import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { initScene } from '../three/scene.js'
import { buildRefrigerator } from '../three/refrigerator.js'
import { createRefrigerantFlow } from '../three/refrigerantFlow.js'
import { createThermostatVisual } from '../three/thermostat.js'
import { createDefrostVisual } from '../three/defrost.js'
import { createCycleAnimation } from '../animations/cycleAnimation.js'
import { createHighlighter } from '../animations/componentHighlight.js'
import { createStateTransitions } from '../animations/stateTransitions.js'
import { disposeObject, findPart, toScreen } from '../three/helpers.js'
import { useLabStore, DIFFERENTIAL } from '../store/labStore.js'
import { componentOrder } from '../data/componentInfo.js'

/**
 * Label anchor points in model space, measured at the home (un-exploded) pose.
 * They are spread over the cabinet — top-rear, top-right, top-left, mid-left,
 * bottom — so the five labels stay legible from every camera preset.
 */
const ANCHORS = {
  compressor: new THREE.Vector3(0.16, -0.72, 0.0),
  condenser: new THREE.Vector3(0.05, 0.88, -0.55),
  expansionValve: new THREE.Vector3(-0.6, -0.14, -0.42),
  evaporator: new THREE.Vector3(0.34, 0.6, 0.24),
  thermostat: new THREE.Vector3(-0.34, 0.78, 0.2),
}

/** Minimum vertical gap between two labels that sit in the same screen column. */
const LABEL_GAP = 26

/**
 * Owns the whole Three.js lifecycle: scene graph, animation loop, raycasting
 * and the bridge between the Zustand store and the 3D view.
 */
export function useThreeScene() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { renderer, scene, camera, controls, detachResize, lights, ground, grid, viewOpts } =
      initScene(canvas)
    const fridge = buildRefrigerator()

    // A transform carrier between the scene and the model. It is identity in the
    // lab view, so nothing changes there; in AR it holds the room placement
    // (position / rotation / scale) without the model itself ever being moved.
    const placement = new THREE.Group()
    placement.name = 'arPlacement'
    placement.add(fridge.group)
    scene.add(placement)

    const flow = createRefrigerantFlow()
    fridge.group.add(flow.pipesGroup)
    fridge.group.add(flow.flowGroup)

    const thermo = createThermostatVisual({
      compressor: fridge.parts.compressor,
      materials: fridge.materials,
    })
    const defrostFx = createDefrostVisual({ materials: fridge.materials, frost: fridge.frost })
    const cycle = createCycleAnimation({ materials: fridge.materials, flow })
    const highlighter = createHighlighter(fridge.parts)
    const transitions = createStateTransitions({
      parts: fridge.parts,
      group: fridge.group,
      camera,
      controls,
      pipesGroup: flow.pipesGroup,
    })

    const cabinetLight = scene.getObjectByName('cabinetLight')
    const labelEls = new Map()
    const raycaster = new THREE.Raycaster()
    raycaster.params.Line = { threshold: 0.02 }
    const pointer = new THREE.Vector2()
    const tmp = new THREE.Vector3()
    const anchor = new THREE.Vector3()

    // ---- Picking --------------------------------------------------------
    const pickTargets = []
    fridge.group.traverse((o) => {
      if (o.isMesh && o.userData.partName && componentOrder.includes(o.userData.partName)) {
        pickTargets.push(o)
      }
    })

    /** Raycast the pick targets from screen coordinates. Returns a part name or null. */
    const pickAtClient = (clientX, clientY) => {
      const r = renderer.domElement.getBoundingClientRect()
      pointer.set(
        ((clientX - r.left) / r.width) * 2 - 1,
        -((clientY - r.top) / r.height) * 2 + 1
      )
      // Inside an immersive session the pose lives on the XR camera, not ours
      const cam = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera
      raycaster.setFromCamera(pointer, cam)
      const hits = raycaster.intersectObjects(pickTargets, false)
      for (const h of hits) {
        const part = findPart(h.object)
        if (part && componentOrder.includes(part.userData.partName)) return part.userData.partName
      }
      return null
    }

    const pick = (e) => pickAtClient(e.clientX, e.clientY)

    let downAt = null
    const onPointerDown = (e) => {
      if (useLabStore.getState().arActive) return
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() }
    }

    const onPointerUp = (e) => {
      // AR installs its own gesture handling; the orbit-style pick would fight it
      if (useLabStore.getState().arActive) return
      if (!downAt) return
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y)
      const held = performance.now() - downAt.t
      downAt = null
      // Ignore orbit drags — only treat a short, still press as a click
      if (moved > 6 || held > 500) return
      const name = pick(e)
      const store = useLabStore.getState()
      if (name) {
        store.selectComponent(store.selectedComponent === name ? null : name)
      } else if (store.selectedComponent) {
        store.selectComponent(null)
      }
    }

    const onPointerMove = (e) => {
      if (useLabStore.getState().arActive) return
      const name = pick(e)
      const store = useLabStore.getState()
      if (store.hoveredComponent !== name) store.hoverComponent(name)
      renderer.domElement.style.cursor = name ? 'pointer' : 'grab'
    }

    const onPointerLeave = () => {
      if (useLabStore.getState().arActive) return
      useLabStore.getState().hoverComponent(null)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerleave', onPointerLeave)

    // ---- Store → 3D reactions -------------------------------------------
    /**
     * Installed by the AR controller. A preset view means "put this face on
     * screen"; outside AR that is a camera fly, inside AR the camera belongs to
     * the device and the model turns instead. Returning true means handled.
     */
    let presetHandler = null

    let prev = useLabStore.getState()
    const unsubscribe = useLabStore.subscribe((s) => {
      if (s.compressorOn !== prev.compressorOn || s.isPowered !== prev.isPowered) {
        if (!s.isPowered) cycle.playShutdown()
        else if (s.compressorOn) cycle.playStartup()
        else cycle.playCutOut()
      }
      if (s.isDefrosting && !prev.isDefrosting) cycle.playDefrost()
      if (s.flowSpeed !== prev.flowSpeed) flow.setSpeed(s.flowSpeed)
      if (s.showFlow !== prev.showFlow) flow.setVisible(s.showFlow)
      if (s.doorOpen !== prev.doorOpen) transitions.setDoor(s.doorOpen)
      if (s.xrayView !== prev.xrayView) transitions.setXray(s.xrayView)
      if (s.explodedView !== prev.explodedView) transitions.setExploded(s.explodedView)
      // Clearing `viewCustom` re-applies the same preset — that is what pressing
      // a preset button after turning the unit by hand in AR has to do.
      if (s.viewPreset !== prev.viewPreset || (prev.viewCustom && !s.viewCustom)) {
        const handled = presetHandler ? presetHandler(s.viewPreset) : false
        // Never fly the camera while AR owns it, even if the handler declined
        if (!handled && !s.arActive) transitions.flyToPreset(s.viewPreset)
      }
      if (s.selectedComponent !== prev.selectedComponent) {
        highlighter.select(s.selectedComponent)
        if (s.selectedComponent) {
          if (!s.arActive) transitions.flyToComponent(s.selectedComponent)
        } else {
          // Restore whichever view mode is still active
          if (s.xrayView) transitions.setXray(true)
          if (s.explodedView) transitions.setExploded(true)
          if (!s.arActive) transitions.flyToPreset(s.viewPreset)
        }
      }
      if (s.hoveredComponent !== prev.hoveredComponent) {
        highlighter.hover(s.hoveredComponent, s.selectedComponent)
      }
      prev = s
    })


    // ---- Render loop ----------------------------------------------------
    const clock = new THREE.Clock()

    /**
     * Extra per-frame work installed by the AR controller (reticle hit-testing,
     * marker tracking, gesture inertia). Keeping it as a hook on this one loop
     * is what lets AR drive the same scene instead of standing up a second one.
     */
    let frameHook = null

    /** One simulation-independent frame: animate, position labels, draw. */
    const frame = (dt, xrFrame) => {
      const s = useLabStore.getState()

      // OrbitControls is disabled during AR; letting it update would keep
      // pulling the camera back to its own orbit solution every frame.
      if (controls.enabled) controls.update()
      flow.update(dt)

      const span = Math.max(0.5, DIFFERENTIAL)
      const proximity = s.compressorOn
        ? 1 - Math.min(1, Math.max(0, (s.cabinetTemp - s.thermostatSetting) / span))
        : 0
      thermo.update(dt, {
        compressorOn: s.compressorOn,
        isPowered: s.isPowered,
        isDefrosting: s.isDefrosting,
        cutOutProximity: proximity,
      })
      defrostFx.update(dt, {
        frostThickness: s.frostThickness,
        isDefrosting: s.isDefrosting,
      })

      if (cabinetLight) cabinetLight.intensity = s.doorOpen ? 1.15 : s.isPowered ? 0.35 : 0.1
      if (fridge.interiorLamp) {
        fridge.interiorLamp.material.emissiveIntensity = s.doorOpen ? 1.6 : 0
      }

      if (frameHook) frameHook(dt, xrFrame)

      // Screen-space labels are meaningless inside an immersive session
      if (!renderer.xr.isPresenting) updateLabels(s)
      renderer.render(scene, camera)
    }

    /** Cached label widths — measuring every frame would force a reflow. */
    const labelWidths = new Map()

    /** Position the HTML labels by writing transforms straight to the DOM. */
    function updateLabels(s) {
      if (labelEls.size === 0) return
      const w = renderer.domElement.clientWidth
      const h = renderer.domElement.clientHeight
      // The tags are HTML, so they stay upright and legible over the camera feed
      // at every AR orientation, Top included. Cutaway mode is the exception:
      // there, tapping a component is the labelling gesture.
      const show = s.showLabels && !s.selectedComponent && !(s.arActive && s.arCutaway)

      const placed = []

      // The AR presets turn this group during the frame that is about to be
      // drawn, so refresh its own world matrix (not its children's — the anchors
      // are read in local space) before projecting, or the tags trail the unit
      // by a frame through the turn.
      fridge.group.updateWorldMatrix(true, false)

      labelEls.forEach((el, name) => {
        if (!el) return
        if (!show) {
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
          return
        }
        const part = fridge.parts[name]
        const home = part?.userData.homePosition
        anchor.copy(ANCHORS[name])
        if (part && home) anchor.add(tmp.copy(part.position).sub(home))
        fridge.group.localToWorld(anchor)
        const p = toScreen(anchor, camera, w, h)
        let width = labelWidths.get(name)
        if (!width) {
          width = el.offsetWidth || 96
          if (el.offsetWidth) labelWidths.set(name, width)
        }
        placed.push({ el, x: p.x, y: p.y, width, visible: p.visible })
      })

      // Nudge labels apart when the camera stacks two of them in one column
      placed.sort((a, b) => a.y - b.y)
      for (let i = 1; i < placed.length; i++) {
        const above = placed[i - 1]
        const cur = placed[i]
        const overlapX = Math.abs(cur.x - above.x) < (cur.width + above.width) / 2
        if (overlapX && cur.y - above.y < LABEL_GAP) cur.y = above.y + LABEL_GAP
      }

      for (const l of placed) {
        l.el.style.transform = `translate(-50%,-50%) translate(${l.x}px,${l.y}px)`
        l.el.style.opacity = l.visible ? '1' : '0'
        l.el.style.pointerEvents = l.visible ? 'auto' : 'none'
      }
    }

    // Three's own loop, so that entering an immersive session simply reroutes the
    // callback to XRSession.requestAnimationFrame — same loop, same scene.
    renderer.setAnimationLoop((_time, xrFrame) => {
      frame(Math.min(clock.getDelta(), 0.05), xrFrame)
    })
    setReady(true)

    // ---- Public API for React components --------------------------------
    engineRef.current = {
      scene,
      camera,
      controls,
      renderer,
      lights,
      ground,
      grid,
      /** Mutable render-quality knobs shared with `attachResize`. */
      viewOpts,
      /** Transform carrier for AR room placement (identity in the lab view). */
      placement,
      fridge,
      parts: fridge.parts,
      materials: fridge.materials,
      flow,
      transitions,
      highlighter,
      /** Draw exactly one frame — used by tests and when the tab is throttled. */
      renderFrame: (dt = 1 / 60) => frame(dt),
      /** Install (or clear, with null) extra per-frame work on the single loop. */
      setFrameHook: (fn) => {
        frameHook = fn || null
      },
      /**
       * Install (or clear, with null) the handler that answers camera presets
       * while AR owns the camera. It is called with the preset key and returns
       * true when it has taken care of the view.
       */
      setPresetHandler: (fn) => {
        presetHandler = fn || null
      },

      /** Hit-test the pickable component meshes at a screen position. */
      pickAtClient,
      registerLabel: (name, el) => {
        if (el) labelEls.set(name, el)
        else labelEls.delete(name)
      },
      resetCamera: () => transitions.flyToPreset(useLabStore.getState().viewPreset),
      screenshot: () => renderer.domElement.toDataURL('image/png'),
    }

    // Handy for debugging from the console during development
    if (import.meta.env.DEV) window.__lab = engineRef.current

    // Apply the initial store state once the graph exists
    const s0 = useLabStore.getState()
    flow.setSpeed(s0.flowSpeed)
    flow.setVisible(s0.showFlow)
    transitions.flyToPreset(s0.viewPreset)

    return () => {
      renderer.setAnimationLoop(null)
      frameHook = null
      presetHandler = null
      unsubscribe()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      detachResize()
      cycle.kill()
      highlighter.dispose()
      transitions.dispose()
      flow.dispose()
      disposeObject(scene)
      controls.dispose()
      renderer.dispose()
      engineRef.current = null
    }
  }, [])

  return { canvasRef, engineRef, ready }
}

export default useThreeScene
