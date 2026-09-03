import { useLabStore } from '../store/labStore.js'
import { createGestures } from './gestures.js'
import { createContactShadow } from './contactShadow.js'
import { startWebcamSource, describeCameraError } from './webcamSource.js'
import { createOrientationCamera } from './deviceOrientation.js'
import { createArOrientation } from './orientation.js'

/**
 * The single AR session.
 *
 * There is deliberately one module-level session rather than a React hook: a
 * device can only hold one camera stream or one immersive session at a time, and
 * the session must outlive any component that starts it. It drives the existing
 * scene — same renderer, same simulation, same store — by swapping the camera
 * and the render target, then puts every mutated value back on exit.
 */

/** The model is 2.0 local units tall, so 0.85 stands a real 1.7 m unit in the room. */
export const LIFE_SIZE = 0.85
/** Local-space distance from the model's origin down to the base of its feet. */
export const BASE_OFFSET = 1.0

/** Narrower than the lab's 55° so the composite is closer to a webcam's optics. */
const AR_FOV = 50
const AR_EYE_HEIGHT = 1.1
const AR_DISTANCE = 2.6
const MIN_SCALE = 0.15
const MAX_SCALE = 2.6

let live = null

export const isArRunning = () => live !== null

/** Run a teardown step without letting one failure strand the rest. */
function safe(fn) {
  try {
    fn()
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[ar] teardown step failed', err)
  }
}

/** Capture every value AR mutates, and return the exact-restore closure. */
function snapshot(engine) {
  const { camera, controls, scene, ground, grid, placement, renderer, lights, viewOpts } = engine
  const before = {
    pos: camera.position.clone(),
    quat: camera.quaternion.clone(),
    fov: camera.fov,
    target: controls.target.clone(),
    controlsEnabled: controls.enabled,
    background: scene.background,
    fog: scene.fog,
    groundVisible: ground.visible,
    gridVisible: grid.visible,
    placementPos: placement.position.clone(),
    placementQuat: placement.quaternion.clone(),
    placementScale: placement.scale.clone(),
    pixelRatio: renderer.getPixelRatio(),
    maxPixelRatio: viewOpts.maxPixelRatio,
    exposure: renderer.toneMappingExposure,
    intensities: Object.fromEntries(Object.entries(lights).map(([k, l]) => [k, l.intensity])),
  }

  return () => {
    camera.position.copy(before.pos)
    camera.quaternion.copy(before.quat)
    camera.fov = before.fov
    camera.updateProjectionMatrix()
    controls.target.copy(before.target)
    controls.enabled = before.controlsEnabled
    controls.update()
    scene.background = before.background
    scene.fog = before.fog
    ground.visible = before.groundVisible
    grid.visible = before.gridVisible
    placement.position.copy(before.placementPos)
    placement.quaternion.copy(before.placementQuat)
    placement.scale.copy(before.placementScale)
    viewOpts.maxPixelRatio = before.maxPixelRatio
    renderer.setPixelRatio(before.pixelRatio)
    renderer.toneMappingExposure = before.exposure
    for (const [key, value] of Object.entries(before.intensities)) {
      if (lights[key]) lights[key].intensity = value
    }
  }
}

/** Strip the lab's dark studio look so only the unit composites over the room. */
function enterArScene(engine) {
  const { scene, ground, grid, controls, renderer, lights } = engine
  // A null background clears transparent, which is what lets the feed show
  scene.background = null
  scene.fog = null
  ground.visible = false
  grid.visible = false
  controls.enabled = false
  // The lab rig is tuned to make a light cabinet pop against a near-black
  // backdrop. Over a bright camera feed the same values clip to flat white, so
  // trade ambient for shaping: keep the key, mute the cool rim (a blue edge
  // reads wrong indoors) and pull the exposure back under the room's own light.
  lights.ambient.intensity = 0.5
  lights.rim.intensity = 0.2
  lights.fill.intensity = 0.35
  renderer.toneMappingExposure = 0.95
}

/** Stand the unit on an imaginary floor a few metres in front of the camera. */
function placeInFront({ camera, placement, transitions }, scale = LIFE_SIZE) {
  // A preset fly from the lab view would still be tweening `camera.position` for
  // up to a second and would drag the composite off the pose set just below.
  transitions?.stopCameraFly()
  camera.position.set(0, AR_EYE_HEIGHT, 0)
  camera.quaternion.identity()
  camera.fov = AR_FOV
  camera.updateProjectionMatrix()
  placement.scale.setScalar(scale)
  placement.position.set(0, BASE_OFFSET * scale, -AR_DISTANCE)
  placement.rotation.set(0, 0, 0)
}

/** A tap only means something in cutaway mode, where it labels a component. */
function onTap(engine, x, y) {
  const store = useLabStore.getState()
  if (!store.arCutaway) return
  const name = engine.pickAtClient(x, y)
  store.setArTapped(store.arTapped === name ? null : name)
}

/**
 * Tier 3 — the camera feed as a backdrop behind the transparent canvas.
 * Nothing is world-tracked here: the unit is put in front of the camera and the
 * user positions it by hand. On a phone the gyroscope turns the view, which is
 * enough for the unit to hold its spot in the room while you look around.
 */
async function startWebcamTier(engine, ctx) {
  let source
  try {
    source = await startWebcamSource({
      layer: ctx.videoLayer,
      // If the feed dies the composite is a lie — a frozen frame with a live
      // model over it. Leave AR rather than let the student believe the pose.
      onLost: (reason) => {
        const store = useLabStore.getState()
        store.notify(reason, 'warn')
        store.exitAr()
      },
    })
  } catch (err) {
    return { ok: false, reason: describeCameraError(err) }
  }
  ctx.disposers.push(() => source.stop())

  placeInFront(engine)

  const orientation = createOrientationCamera({ camera: engine.camera })
  ctx.disposers.push(() => orientation.dispose())
  ctx.frameFns.push((dt) => orientation.update(dt))

  const store = useLabStore.getState()
  store.setArPlaced(true)
  store.setArStatus(
    (navigator.maxTouchPoints || 0) > 0
      ? 'Drag to turn · pinch to resize · two fingers to move · camera presets turn the unit'
      : 'Drag to move · scroll to resize · shift-drag to turn · camera presets turn the unit'
  )
  return { ok: true }
}

/**
 * Enter AR on the running scene.
 *
 * @param {object} engine the object returned by `useThreeScene`
 * @param {'xr'|'marker'|'webcam'} tier the mode to run, from `detectArTier()`
 * @param {HTMLElement|null} hudRoot overlay root — the gesture surface in Tier 1
 * @param {HTMLElement|null} videoLayer where the camera feed is mounted
 * @returns {Promise<{ok: boolean, reason?: string}>}
 */
export async function startAr({ engine, tier = 'webcam', hudRoot = null, videoLayer = null }) {
  if (live) await stopAr()
  if (!engine) return { ok: false, reason: 'The 3D scene is not ready yet' }

  const restore = snapshot(engine)
  // The view the lab camera is holding. If a preset is pressed inside AR the two
  // fall out of step, and the exit has to answer for it — see `stopAr`.
  const enterPreset = useLabStore.getState().viewPreset
  const ctx = { tier, hudRoot, videoLayer, disposers: [], frameFns: [] }

  // Added to `placement`, so the blob inherits the AR scale for free
  const shadow = createContactShadow()
  engine.placement.add(shadow.mesh)
  ctx.disposers.push(() => shadow.dispose())

  enterArScene(engine)

  const result = await startWebcamTier(engine, ctx)
  if (!result.ok) {
    ctx.disposers.reverse().forEach(safe)
    restore()
    engine.setFrameHook(null)
    return result
  }

  // Camera presets, the AR way round: the device camera is left alone and the
  // unit turns about its own centre instead. Installing the handler is what makes
  // the CAMERA buttons live inside AR; the placement is never written.
  const modelOrientation = createArOrientation({ engine })
  modelOrientation.apply(enterPreset, { animate: false })
  ctx.disposers.push(() => modelOrientation.dispose())
  ctx.frameFns.push((dt) => modelOrientation.update(dt))
  engine.setPresetHandler((key) => modelOrientation.apply(key))

  const gestures = createGestures({
    el: tier === 'xr' && hudRoot ? hudRoot : engine.renderer.domElement,
    placement: engine.placement,
    getCamera: () =>
      engine.renderer.xr.isPresenting ? engine.renderer.xr.getCamera() : engine.camera,
    tier,
    minScale: MIN_SCALE,
    maxScale: MAX_SCALE,
    onTap: (x, y) => onTap(engine, x, y),
    // Turning the unit by hand leaves the preset behind, so stop claiming it
    onRotate: () => {
      if (!useLabStore.getState().viewCustom) useLabStore.getState().setViewCustom(true)
    },
  })
  ctx.disposers.push(() => gestures.dispose())

  engine.setFrameHook((dt, xrFrame) => {
    for (const fn of ctx.frameFns) fn(dt, xrFrame)
  })

  live = { engine, ctx, restore, tier, enterPreset, stopping: false }
  // `reset()` clears arActive too, so the store is the one exit signal to watch
  live.unsubscribe = useLabStore.subscribe((s) => {
    if (!s.arActive) stopAr()
  })
  return { ok: true }
}

/** Leave AR: release the camera, undo every scene mutation, keep the readings. */
export async function stopAr() {
  if (!live || live.stopping) return
  live.stopping = true
  const { engine, ctx, restore, unsubscribe, enterPreset } = live

  engine.setFrameHook(null)
  engine.setPresetHandler(null)
  unsubscribe?.()
  ctx.disposers.reverse().forEach(safe)
  restore()
  live = null

  const store = useLabStore.getState()
  if (store.arActive) store.exitAr()

  // `restore()` gives back the camera pose from the moment AR started. If the
  // student changed the view inside AR, the lit button now describes something
  // the lab camera is not showing, so bring the camera to it instead.
  const after = useLabStore.getState()
  if (after.viewCustom) after.setViewCustom(false) // re-applies via the subscription
  else if (after.viewPreset !== enterPreset) engine.transitions.flyToPreset(after.viewPreset)
}

export default startAr
