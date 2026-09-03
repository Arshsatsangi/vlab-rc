import gsap from 'gsap'
import { collectPartMeshes } from '../three/helpers.js'

const SELECTABLE = ['compressor', 'condenser', 'expansionValve', 'evaporator', 'thermostat']
const SHELL = ['cabinet', 'door', 'interior']

/**
 * Selection / hover feedback: the chosen component glows, everything else dims.
 * Original material values are captured once so state is always restorable.
 */
export function createHighlighter(parts) {
  const baseline = new Map()

  const register = (mesh) => {
    if (baseline.has(mesh)) return
    const m = mesh.material
    if (!m || Array.isArray(m)) return
    baseline.set(mesh, {
      opacity: m.opacity,
      transparent: m.transparent,
      emissiveIntensity: m.emissiveIntensity ?? 0,
      hasEmissive: !!m.emissive,
    })
  }

  Object.values(parts).forEach((p) => collectPartMeshes(p).forEach(register))

  const meshesOf = (name) =>
    parts[name] ? collectPartMeshes(parts[name]).filter((m) => baseline.has(m)) : []

  function clear(duration = 0.35) {
    baseline.forEach((base, mesh) => {
      if (mesh.userData.isHitProxy) return
      const tween = { opacity: base.opacity, duration, ease: 'power2.out', overwrite: 'auto' }
      if (base.hasEmissive) tween.emissiveIntensity = base.emissiveIntensity
      gsap.to(mesh.material, {
        ...tween,
        onStart: () => {
          mesh.material.transparent = true
        },
        onComplete: () => {
          mesh.material.transparent = base.transparent
          mesh.material.needsUpdate = true
        },
      })
    })
  }

  function select(name, duration = 0.35) {
    if (!name) return clear(duration)

    baseline.forEach((base, mesh) => {
      if (mesh.userData.isHitProxy) return
      const isTarget = mesh.userData.partName === name
      const isShell = SHELL.includes(mesh.userData.partName)
      const targetOpacity = isTarget ? Math.max(base.opacity, 1) : isShell ? 0.12 : 0.28
      const tween = {
        opacity: targetOpacity,
        duration,
        ease: 'power2.out',
        overwrite: 'auto',
      }
      if (base.hasEmissive) {
        tween.emissiveIntensity = isTarget ? Math.max(0.6, base.emissiveIntensity) : 0
      }
      mesh.material.transparent = true
      mesh.material.depthWrite = isTarget
      gsap.to(mesh.material, tween)
    })
  }

  /** Soft hover cue — only nudges emissive, never opacity. */
  function hover(name, activeSelection) {
    if (activeSelection) return
    baseline.forEach((base, mesh) => {
      if (!base.hasEmissive || mesh.userData.isHitProxy) return
      const isTarget = name && mesh.userData.partName === name
      gsap.to(mesh.material, {
        emissiveIntensity: isTarget ? Math.max(0.4, base.emissiveIntensity) : base.emissiveIntensity,
        duration: 0.22,
        overwrite: 'auto',
      })
    })
  }

  function dispose() {
    baseline.forEach((_, mesh) => gsap.killTweensOf(mesh.material))
    baseline.clear()
  }

  return { select, clear, hover, dispose, meshesOf, SELECTABLE }
}

export { SELECTABLE }
export default createHighlighter
