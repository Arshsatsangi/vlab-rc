import * as THREE from 'three'

/**
 * Visual behaviour tied to the thermostat: compressor vibration while it is
 * energised, sensing-bulb glow, and the door-face status lamp.
 */
export function createThermostatVisual({ compressor, materials }) {
  const home = compressor.userData.homePosition
    ? compressor.userData.homePosition.clone()
    : compressor.position.clone()
  let t = 0
  let intensity = 0 // eased 0 → 1 with the compressor state

  const GREEN = new THREE.Color('#22c55e')
  const AMBER = new THREE.Color('#f59e0b')
  const GREY = new THREE.Color('#475569')

  function update(dt, { compressorOn, isPowered, isDefrosting, cutOutProximity = 0 }) {
    t += dt
    const target = compressorOn ? 1 : 0
    intensity += (target - intensity) * Math.min(1, dt * 3.2)

    // Vibration: ~48 Hz visually damped, plus a slow scale breathing
    const amp = 0.0022 * intensity
    compressor.position.set(
      home.x + Math.sin(t * 300) * amp,
      home.y + Math.sin(t * 214 + 1.1) * amp * 0.7,
      home.z + Math.cos(t * 268 + 0.4) * amp
    )
    compressor.scale.setScalar(1 + Math.sin(t * 36) * 0.004 * intensity)

    // Sensing bulb glows amber as the cabinet approaches cut-out
    if (materials.thermostatBulb) {
      materials.thermostatBulb.emissiveIntensity = 0.15 + 0.85 * cutOutProximity
    }

    // Door status lamp: green running, amber idle/defrost, dark when off
    const lamp = materials.statusLamp
    if (lamp) {
      if (!isPowered) {
        lamp.emissive.copy(GREY)
        lamp.emissiveIntensity = 0.05
      } else if (isDefrosting) {
        lamp.emissive.copy(AMBER)
        lamp.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 6)
      } else if (compressorOn) {
        lamp.emissive.copy(GREEN)
        lamp.emissiveIntensity = 1.1
      } else {
        lamp.emissive.copy(AMBER)
        lamp.emissiveIntensity = 0.7
      }
    }
  }

  return { update }
}

export default createThermostatVisual
