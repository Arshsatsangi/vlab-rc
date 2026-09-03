import * as THREE from 'three'
import gsap from 'gsap'
import { componentInfo, componentOrder, cameraPresets } from '../data/componentInfo.js'
import { collectPartMeshes } from '../three/helpers.js'

const SHELL = ['cabinet', 'door', 'interior']

/**
 * View-level state changes: door swing, exploded view, X-ray mode and
 * camera fly-to for presets and component focus.
 */
export function createStateTransitions({ parts, group, camera, controls, pipesGroup }) {
  let wireframe = null
  const shellMeshes = SHELL.flatMap((n) => (parts[n] ? collectPartMeshes(parts[n]) : []))
  const shellBase = new Map(
    shellMeshes.map((m) => [m, { opacity: m.material.opacity, transparent: m.material.transparent }])
  )

  // ---- Door -------------------------------------------------------------
  function setDoor(open) {
    gsap.to(parts.door.rotation, {
      y: open ? -1.18 : 0,
      duration: 0.9,
      ease: open ? 'power3.out' : 'power2.inOut',
      overwrite: 'auto',
    })
  }

  // ---- Exploded view ----------------------------------------------------
  function setExploded(on) {
    const tl = gsap.timeline()
    componentOrder.forEach((name, i) => {
      const part = parts[name]
      if (!part) return
      const home = part.userData.homePosition || new THREE.Vector3()
      const [dx, dy, dz] = componentInfo[name].explode
      tl.to(
        part.position,
        {
          x: home.x + (on ? dx : 0),
          y: home.y + (on ? dy : 0),
          z: home.z + (on ? dz : 0),
          duration: 1.0,
          ease: on ? 'power3.out' : 'power2.inOut',
          overwrite: 'auto',
        },
        i * 0.1
      )
    })

    // The shell fades back so the separated parts read clearly
    shellBase.forEach((base, mesh) => {
      mesh.material.transparent = true
      gsap.to(mesh.material, {
        opacity: on ? 0.08 : base.opacity,
        duration: 0.7,
        overwrite: 'auto',
        onComplete: () => {
          if (!on) {
            mesh.material.transparent = base.transparent
            mesh.material.needsUpdate = true
          }
        },
      })
    })

    // Connecting pipes stretch oddly when parts separate — fade them out
    if (pipesGroup) {
      pipesGroup.children.forEach((pipe) => {
        pipe.material.transparent = true
        gsap.to(pipe.material, { opacity: on ? 0.12 : 1, duration: 0.6, overwrite: 'auto' })
      })
    }
    if (on) setDoor(true)
    return tl
  }

  // ---- X-ray view -------------------------------------------------------
  function ensureWireframe() {
    if (wireframe) return wireframe
    const geo = new THREE.BoxGeometry(1.205, 2.005, 0.805)
    wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0 })
    )
    wireframe.name = 'xrayWireframe'
    wireframe.renderOrder = 5
    group.add(wireframe)
    geo.dispose()
    return wireframe
  }

  function setXray(on) {
    const wf = ensureWireframe()
    gsap.to(wf.material, { opacity: on ? 0.55 : 0, duration: 0.45, overwrite: 'auto' })
    shellBase.forEach((base, mesh) => {
      mesh.material.transparent = true
      mesh.material.depthWrite = !on
      gsap.to(mesh.material, {
        opacity: on ? 0.14 : base.opacity,
        duration: 0.5,
        overwrite: 'auto',
        onComplete: () => {
          if (!on) {
            mesh.material.transparent = base.transparent
            mesh.material.depthWrite = true
            mesh.material.needsUpdate = true
          }
        },
      })
    })
  }

  // ---- Camera -----------------------------------------------------------
  function flyTo({ pos, target }, duration = 1.15) {
    gsap.to(camera.position, {
      x: pos[0],
      y: pos[1],
      z: pos[2],
      duration,
      ease: 'power3.inOut',
      overwrite: 'auto',
    })
    gsap.to(controls.target, {
      x: target[0],
      y: target[1],
      z: target[2],
      duration,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onUpdate: () => controls.update(),
    })
  }

  const flyToPreset = (key) => cameraPresets[key] && flyTo(cameraPresets[key])
  const flyToComponent = (name) => componentInfo[name] && flyTo(componentInfo[name].camera, 1.0)

  /**
   * Drop any camera fly still in flight. AR sets the camera by hand and then
   * leaves it to the device; a tween from the lab view would go on writing to
   * `camera.position` for another second and drag the composite with it.
   */
  function stopCameraFly() {
    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(controls.target)
  }

  function dispose() {
    if (wireframe) {
      wireframe.geometry.dispose()
      wireframe.material.dispose()
      group.remove(wireframe)
      wireframe = null
    }
    shellBase.forEach((_, mesh) => gsap.killTweensOf(mesh.material))
    stopCameraFly()
  }

  return {
    setDoor,
    setExploded,
    setXray,
    flyTo,
    flyToPreset,
    flyToComponent,
    stopCameraFly,
    dispose,
  }
}

export default createStateTransitions
