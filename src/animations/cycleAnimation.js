import gsap from 'gsap'

/**
 * GSAP timelines for the running state of the machine:
 * start-up, thermostat cut-out, restart and shutdown.
 * Emissive intensities communicate hot (condenser) and cold (evaporator) sides.
 */
export function createCycleAnimation({ materials, flow }) {
  let tl = null

  const kill = () => {
    if (tl) tl.kill()
    tl = null
  }

  function playStartup() {
    kill()
    tl = gsap.timeline()
    // t=0.2 — refrigerant starts moving (low-pressure side leads)
    tl.add(() => flow.startFlow(), 0.2)
    // t=1.0 — condenser heats up, evaporator chills down
    tl.to(materials.condenserTube, { emissiveIntensity: 0.5, duration: 2.2, ease: 'sine.out' }, 0.9)
    tl.to(
      materials.evaporatorPlate,
      { emissiveIntensity: 0.6, duration: 2.0, ease: 'sine.out' },
      1.0
    )
    tl.to(
      materials.evaporatorTube,
      { emissiveIntensity: 0.5, duration: 2.0, ease: 'sine.out' },
      1.0
    )
    return tl
  }

  function playCutOut() {
    kill()
    tl = gsap.timeline()
    tl.add(() => flow.stopFlow(), 0.45)
    tl.to(materials.condenserTube, { emissiveIntensity: 0.05, duration: 2.6, ease: 'sine.out' }, 0)
    tl.to(
      materials.evaporatorPlate,
      { emissiveIntensity: 0.34, duration: 2.6, ease: 'sine.out' },
      0
    )
    tl.to(materials.evaporatorTube, { emissiveIntensity: 0.3, duration: 2.6, ease: 'sine.out' }, 0)
    return tl
  }

  function playShutdown() {
    kill()
    tl = gsap.timeline()
    tl.add(() => flow.stopFlow(), 0)
    tl.to(materials.condenserTube, { emissiveIntensity: 0, duration: 3.2, ease: 'sine.out' }, 0)
    tl.to(
      materials.evaporatorPlate,
      { emissiveIntensity: 0.2, duration: 3.2, ease: 'sine.out' },
      0
    )
    tl.to(materials.evaporatorTube, { emissiveIntensity: 0.15, duration: 3.2, ease: 'sine.out' }, 0)
    return tl
  }

  function playDefrost() {
    kill()
    tl = gsap.timeline()
    tl.add(() => flow.stopFlow(), 0)
    tl.to(materials.condenserTube, { emissiveIntensity: 0.02, duration: 1.4 }, 0)
    // Evaporator warms up while the heater is energised
    tl.to(materials.evaporatorPlate, { emissiveIntensity: 0.08, duration: 1.6 }, 0.4)
    tl.to(materials.evaporatorTube, { emissiveIntensity: 0.05, duration: 1.6 }, 0.4)
    return tl
  }

  return { playStartup, playCutOut, playShutdown, playDefrost, kill }
}

export default createCycleAnimation
