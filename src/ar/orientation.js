import * as THREE from 'three'
import { presetViewAngles } from '../data/componentInfo.js'

/**
 * Camera presets, in AR.
 *
 * Outside AR a preset is a camera move: the lab camera flies to `cameraPresets`
 * and the model never moves. In AR that is not available — the camera IS the
 * device camera, and overriding its pose would break the composite and the sense
 * that the unit is standing in the room. So the same five presets are expressed
 * the other way round: the camera is left exactly where it is and the unit is
 * turned about its own centre until the requested face points at the viewer.
 *
 * Only the model's own rotation is touched. The AR anchor — the placement group
 * that carries the screen position, the 0.5×/1×/2× scale and the gesture yaw —
 * is read but never written, so a preset cannot disturb the placement.
 */

/** Requirement: ~400 ms, ease-in-out, quaternion slerp. */
const TURN_SECONDS = 0.4
const DEG = Math.PI / 180
const Y_AXIS = new THREE.Vector3(0, 1, 0)
const X_AXIS = new THREE.Vector3(1, 0, 0)

/** Smoothstep: ease-in-out with zero angular velocity at both ends. */
export const easeInOut = (t) => t * t * (3 - 2 * t)

export const hasPreset = (key) => Boolean(presetViewAngles[key])

/**
 * The viewer rotation a preset describes: yaw about world Y, then pitch about
 * the viewer's own X — the YXZ order OrbitControls solves for, so this is the
 * orientation the lab camera reaches for the matching entry in `cameraPresets`.
 */
export function viewRotation(key, out = new THREE.Quaternion()) {
  const angles = presetViewAngles[key]
  if (!angles) return null
  const pitch = new THREE.Quaternion().setFromAxisAngle(X_AXIS, angles.pitch * DEG)
  return out.setFromAxisAngle(Y_AXIS, angles.yaw * DEG).multiply(pitch)
}

/**
 * World rotation for the unit so that the preset's face points at a viewer
 * standing on bearing `viewerYaw`.
 *
 * It is the inverse of the viewer rotation — turning the model by −yaw shows the
 * same face that walking to +yaw would — swung round to wherever the viewer
 * actually is. Pure function of its arguments, so the mapping can be checked
 * without a renderer.
 *
 * @param {string} key one of `presetViewAngles`
 * @param {number} viewerYaw bearing from the unit to the camera, radians
 * @param {THREE.Quaternion} [out]
 * @returns {THREE.Quaternion|null} null for an unknown preset
 */
export function presetModelQuaternion(key, viewerYaw = 0, out = new THREE.Quaternion()) {
  const view = viewRotation(key)
  if (!view) return null
  return out.setFromAxisAngle(Y_AXIS, viewerYaw).multiply(view.invert())
}

/**
 * Drive the model's orientation for the running AR session.
 *
 * @param {object} engine the object returned by `useThreeScene`
 * @returns {{apply: (key: string, opts?: {animate?: boolean}) => boolean,
 *            update: (dt: number) => void, turning: () => boolean,
 *            dispose: () => void}}
 */
export function createArOrientation({ engine }) {
  const model = engine.fridge.group
  /** The lab-view orientation to hand back on exit (identity in practice). */
  const home = model.quaternion.clone()

  const from = new THREE.Quaternion()
  const to = new THREE.Quaternion()
  const world = new THREE.Quaternion()
  const parentInv = new THREE.Quaternion()
  const unitPos = new THREE.Vector3()
  const eyePos = new THREE.Vector3()

  // t counts 0 → 1 across TURN_SECONDS; 1 means settled
  let t = 1

  const activeCamera = () =>
    engine.renderer.xr.isPresenting ? engine.renderer.xr.getCamera() : engine.camera

  /**
   * Bearing from the unit to the camera, so "toward the screen" means toward
   * where the viewer is actually standing — including after the unit has been
   * dragged off to one side.
   */
  function viewerYaw() {
    engine.placement.getWorldPosition(unitPos)
    activeCamera().getWorldPosition(eyePos)
    const dx = eyePos.x - unitPos.x
    const dz = eyePos.z - unitPos.z
    // Directly under/over the camera there is no bearing to speak of; keep the
    // yaw the unit already has rather than snapping it to an arbitrary one.
    if (dx * dx + dz * dz < 1e-6) return engine.placement.rotation.y
    return Math.atan2(dx, dz)
  }

  /**
   * Turn the unit to a preset. Returns false for a key this module does not
   * know, which lets the caller fall back to the lab-view camera fly.
   */
  function apply(key, { animate = true } = {}) {
    if (!hasPreset(key)) return false

    presetModelQuaternion(key, viewerYaw(), world)
    // The placement keeps its position, scale and gesture yaw; the model absorbs
    // that yaw so the *visible* orientation is exactly the preset either way.
    engine.placement.getWorldQuaternion(parentInv).invert()
    to.copy(parentInv).multiply(world)

    if (animate) {
      from.copy(model.quaternion)
      t = 0
    } else {
      t = 1
      model.quaternion.copy(to)
    }
    return true
  }

  /** Advance the slerp. Called from the AR session's per-frame hook. */
  function update(dt) {
    if (t >= 1) return
    t = Math.min(1, t + dt / TURN_SECONDS)
    model.quaternion.slerpQuaternions(from, to, easeInOut(t))
  }

  return {
    apply,
    update,
    turning: () => t < 1,
    /** Hand the model back to the lab view exactly as it was found. */
    dispose() {
      t = 1
      model.quaternion.copy(home)
    },
  }
}

export default createArOrientation
