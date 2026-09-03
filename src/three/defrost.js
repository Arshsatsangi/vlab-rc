/**
 * Frost build-up and the defrost cycle, rendered on the evaporator.
 *  - frost shell opacity + scale follow `frostThickness` (0 → 1)
 *  - the heater rod glows red while a defrost cycle is active
 */
export function createDefrostVisual({ materials, frost }) {
  let shown = 0
  let glow = 0
  let t = 0

  function update(dt, { frostThickness = 0, isDefrosting = false }) {
    t += dt

    shown += (frostThickness - shown) * Math.min(1, dt * 2.5)
    if (materials.frost) {
      materials.frost.opacity = Math.min(0.92, shown * 0.92)
      materials.frost.visible = shown > 0.004
    }
    // Frost shell thickens slightly as it accumulates
    frost.scale.setScalar(1 + shown * 0.05)

    const target = isDefrosting ? 1 : 0
    glow += (target - glow) * Math.min(1, dt * 3)
    if (materials.heater) {
      const flicker = 0.88 + 0.12 * Math.sin(t * 11)
      materials.heater.emissiveIntensity = glow * 2.4 * flicker
      materials.heater.color.setHex(glow > 0.15 ? 0x7a3a24 : 0x4a4038)
    }
  }

  return { update }
}

export default createDefrostVisual
