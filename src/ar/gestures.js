import * as THREE from 'three'
import { clamp } from '../three/helpers.js'

const TAP_MOVE_PX = 8
const TAP_MS = 400
/** Ignore gestures that start on the HUD's own controls. */
const INTERACTIVE = 'button, a, input, select, textarea, label, [data-ar-ui]'

/**
 * Pointer and touch gestures that move, rotate and scale the placed unit.
 * Shared by Tier 1 (WebXR dom-overlay) and Tier 3 (webcam canvas) so both
 * behave the same way.
 *
 * Room AR (touch):   one finger rotates on Y · pinch scales · two fingers move
 * Webcam AR (mouse): drag moves · wheel scales · shift-drag rotates
 */
export function createGestures({
  el,
  placement,
  getCamera,
  tier = 'webcam',
  onTap = null,
  onChange = null,
  onRotate = null,
  minScale = 0.15,
  maxScale = 2.6,
}) {
  const pointers = new Map()
  const axis = new THREE.Vector3()
  const worldPos = new THREE.Vector3()
  let pinchDist = 0
  let centroid = null
  let down = null
  let travelled = 0

  /** World units per CSS pixel at the depth the unit is standing. */
  function worldPerPixel(camera) {
    placement.getWorldPosition(worldPos)
    const dist = Math.max(0.35, camera.position.distanceTo(worldPos))
    const fov = camera.fov || 55
    const height = el.clientHeight || window.innerHeight || 1
    return (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2) * dist) / height
  }

  // Every rotation path funnels through here, so one call site is enough to tell
  // the app the view no longer matches the preset button that is lit.
  const rotate = (dx) => {
    if (dx === 0) return
    placement.rotation.y += dx * 0.008
    onRotate?.(dx)
  }

  const scaleBy = (factor) => {
    const next = clamp(placement.scale.x * factor, minScale, maxScale)
    placement.scale.setScalar(next)
  }

  /** Drag the unit across the screen plane (mouse, Tier 3). */
  function moveInScreenPlane(camera, dx, dy) {
    const k = worldPerPixel(camera)
    axis.setFromMatrixColumn(camera.matrixWorld, 0)
    placement.position.addScaledVector(axis, dx * k)
    axis.setFromMatrixColumn(camera.matrixWorld, 1)
    placement.position.addScaledVector(axis, -dy * k)
  }

  /** Slide the unit over the floor (two fingers, Tier 1). */
  function moveOnFloor(camera, dx, dy) {
    const k = worldPerPixel(camera)
    axis.setFromMatrixColumn(camera.matrixWorld, 0).setY(0)
    if (axis.lengthSq() > 1e-6) placement.position.addScaledVector(axis.normalize(), dx * k)
    axis.setFromMatrixColumn(camera.matrixWorld, 2).setY(0)
    if (axis.lengthSq() > 1e-6) placement.position.addScaledVector(axis.normalize(), dy * k)
  }

  const mid = () => {
    const pts = [...pointers.values()]
    return {
      x: pts.reduce((a, p) => a + p.x, 0) / pts.length,
      y: pts.reduce((a, p) => a + p.y, 0) / pts.length,
    }
  }

  const spread = () => {
    const [a, b] = [...pointers.values()]
    return Math.hypot(b.x - a.x, b.y - a.y)
  }

  /**
   * Pointer capture keeps a drag alive when the cursor leaves the canvas, but it
   * throws for a pointer id the element does not own. Losing the whole gesture
   * over a failed nicety would be worse than dragging without capture.
   */
  const capture = (el2, method, id) => {
    try {
      el2[method]?.(id)
    } catch {
      /* not a live pointer — carry on uncaptured */
    }
  }

  function onPointerDown(e) {
    if (e.target?.closest?.(INTERACTIVE)) return
    capture(el, 'setPointerCapture', e.pointerId)
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType })
    if (pointers.size === 1) {
      down = { x: e.clientX, y: e.clientY, t: performance.now() }
      travelled = 0
    } else if (pointers.size === 2) {
      pinchDist = spread()
      centroid = mid()
    }
  }

  function onPointerMove(e) {
    const prev = pointers.get(e.pointerId)
    if (!prev) return
    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y
    prev.x = e.clientX
    prev.y = e.clientY
    travelled += Math.hypot(dx, dy)
    const camera = getCamera()
    if (!camera) return

    if (pointers.size >= 2) {
      const dist = spread()
      if (pinchDist > 4) scaleBy(dist / pinchDist)
      pinchDist = dist
      const c = mid()
      if (centroid) moveOnFloor(camera, c.x - centroid.x, c.y - centroid.y)
      centroid = c
    } else if (tier === 'xr' || e.pointerType === 'touch') {
      // One finger rotates — a phone user has no scroll wheel or shift key
      rotate(dx)
    } else if (e.shiftKey) {
      rotate(dx)
    } else {
      moveInScreenPlane(camera, dx, dy)
    }
    onChange?.()
  }

  function onPointerUp(e) {
    const wasSingle = pointers.size === 1
    pointers.delete(e.pointerId)
    capture(el, 'releasePointerCapture', e.pointerId)
    if (pointers.size < 2) {
      pinchDist = 0
      centroid = null
    }
    if (
      wasSingle &&
      down &&
      travelled <= TAP_MOVE_PX &&
      performance.now() - down.t <= TAP_MS &&
      !e.target?.closest?.(INTERACTIVE)
    ) {
      onTap?.(e.clientX, e.clientY)
    }
    down = null
  }

  function onWheel(e) {
    e.preventDefault()
    scaleBy(Math.exp(-e.deltaY * 0.0015))
    onChange?.()
  }

  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerup', onPointerUp)
  el.addEventListener('pointercancel', onPointerUp)
  el.addEventListener('wheel', onWheel, { passive: false })

  return {
    dispose() {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
      el.removeEventListener('wheel', onWheel)
      pointers.clear()
    },
  }
}

export default createGestures
