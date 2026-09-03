import * as THREE from 'three'

/**
 * Attach a ResizeObserver-driven resize handler. Returns a disposer.
 *
 * `opts` is read on every resize rather than captured, so AR can lower
 * `maxPixelRatio` mid-session by mutating the same object — otherwise the next
 * resize would put the full device pixel ratio straight back.
 */
export function attachResize(canvas, camera, renderer, opts = {}) {
  const resize = () => {
    const parent = canvas.parentElement
    if (!parent) return
    const w = parent.clientWidth || 1
    const h = parent.clientHeight || 1
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.maxPixelRatio ?? 2))
  }
  resize()
  const ro = new ResizeObserver(resize)
  if (canvas.parentElement) ro.observe(canvas.parentElement)
  window.addEventListener('resize', resize)
  return () => {
    ro.disconnect()
    window.removeEventListener('resize', resize)
  }
}

/** Recursively dispose geometries, materials and textures below `root`. */
export function disposeObject(root) {
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
    const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : []
    mats.forEach((m) => {
      Object.values(m).forEach((v) => {
        if (v && v.isTexture) v.dispose()
      })
      m.dispose()
    })
  })
}

/** Project a world position to CSS pixel coordinates within the canvas rect. */
export function toScreen(position, camera, width, height, out = new THREE.Vector3()) {
  out.copy(position).project(camera)
  return {
    x: (out.x * 0.5 + 0.5) * width,
    y: (-out.y * 0.5 + 0.5) * height,
    visible: out.z < 1,
    depth: out.z,
  }
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
export const lerp = (a, b, t) => a + (b - a) * t

/** Walk up the parent chain until a mesh/group carrying `userData.partName` is found. */
export function findPart(object) {
  let o = object
  while (o) {
    if (o.userData && o.userData.partName) return o
    o = o.parent
  }
  return null
}

/** Cache the original material values we mutate, so views can be restored exactly. */
export function snapshotMaterials(root) {
  const snap = new Map()
  root.traverse((obj) => {
    if (!obj.isMesh) return
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    mats.forEach((m, i) => {
      snap.set(`${obj.uuid}:${i}`, {
        material: m,
        opacity: m.opacity,
        transparent: m.transparent,
        emissiveIntensity: m.emissiveIntensity ?? 0,
        depthWrite: m.depthWrite,
      })
    })
  })
  return snap
}

export function restoreMaterials(snap) {
  snap.forEach((s) => {
    s.material.opacity = s.opacity
    s.material.transparent = s.transparent
    s.material.depthWrite = s.depthWrite
    if (s.material.emissive) s.material.emissiveIntensity = s.emissiveIntensity
    s.material.needsUpdate = true
  })
}

/** Every mesh belonging to a named part (used for raycasting + highlighting). */
export function collectPartMeshes(part) {
  const meshes = []
  part.traverse((o) => {
    if (o.isMesh) meshes.push(o)
  })
  return meshes
}
