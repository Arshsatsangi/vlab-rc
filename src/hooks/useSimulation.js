import { useEffect, useRef } from 'react'
import {
  useLabStore,
  ROOM_TEMP,
  DIFFERENTIAL,
  COOL_RATE,
  WARM_RATE,
  DEFROST_SECONDS,
} from '../store/labStore.js'

const TICK_MS = 100
const lag = (cur, target, k, dt) => cur + (target - cur) * Math.min(1, k * dt)

/**
 * Thermal model of the cabinet, the thermostat cut-in/cut-out logic, frost
 * build-up and the defrost cycle. Runs at 10 Hz off a single interval.
 */
export function useSimulation() {
  const last = useRef(performance.now())
  const runAccum = useRef(0) // compressor seconds since the last frost increment
  const timerAccum = useRef(0) // compressor seconds since the last timer defrost
  const defrostT = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      const now = performance.now()
      const dt = Math.min((now - last.current) / 1000, 0.5)
      last.current = now

      const s = useLabStore.getState()
      const patch = { elapsed: s.elapsed + dt }
      let cabinet = s.cabinetTemp

      // ---- Defrost cycle ------------------------------------------------
      if (s.isDefrosting) {
        defrostT.current += dt
        const p = Math.min(1, defrostT.current / DEFROST_SECONDS)
        patch.defrostProgress = p
        patch.frostThickness = Math.max(0, s.frostThickness * (1 - p))
        cabinet = cabinet + WARM_RATE * dt * 1.6 // no cooling while defrosting
        patch.cabinetTemp = cabinet
        useLabStore.setState(patch)
        if (p >= 1) {
          defrostT.current = 0
          timerAccum.current = 0
          useLabStore.getState().finishDefrost()
        }
        return
      }
      defrostT.current = 0

      // ---- Cabinet temperature -----------------------------------------
      // Frost insulates the coil, so cooling gets slower as it builds up.
      const efficiency = 1 - 0.45 * s.frostThickness
      const doorPenalty = s.doorOpen ? 3.2 : 1

      if (s.compressorOn) {
        cabinet -= COOL_RATE * efficiency * dt
        cabinet += WARM_RATE * (doorPenalty - 1) * dt
        patch.runSeconds = s.runSeconds + dt
        runAccum.current += dt
        timerAccum.current += dt
        // Frost grows while the coil is below freezing
        if (runAccum.current >= 30) {
          runAccum.current -= 30
          patch.frostThickness = Math.min(1, s.frostThickness + 0.005)
        }
      } else if (s.isPowered) {
        cabinet += WARM_RATE * doorPenalty * dt
      } else {
        cabinet = lag(cabinet, ROOM_TEMP, 0.06, dt)
      }
      cabinet = Math.max(-18, Math.min(ROOM_TEMP + 2, cabinet))
      patch.cabinetTemp = cabinet

      // ---- Derived readings (first-order lag so gauges move smoothly) ----
      const evapTarget = s.compressorOn ? Math.min(-4, s.thermostatSetting - 12) : cabinet - 2
      const condTarget = s.compressorOn ? 45 + 6 * s.frostThickness : ROOM_TEMP
      patch.evaporatorTemp = lag(s.evaporatorTemp, evapTarget, 0.5, dt)
      patch.suctionTemp = lag(s.suctionTemp, evapTarget + 2, 0.5, dt)
      patch.condenserTemp = lag(s.condenserTemp, condTarget, 0.35, dt)
      patch.freezerTemp = lag(
        s.freezerTemp,
        s.compressorOn || s.isPowered ? Math.max(-12, cabinet - 8) : cabinet - 2,
        0.4,
        dt
      )

      useLabStore.setState(patch)

      // ---- Thermostat switching ----------------------------------------
      if (s.isPowered) {
        if (s.compressorOn && cabinet <= s.thermostatSetting) {
          useLabStore.getState().cutOut()
        } else if (!s.compressorOn && cabinet >= s.thermostatSetting + DIFFERENTIAL) {
          useLabStore.getState().cutIn()
        }
        // Automatic (timer) defrosting: every 120 s of compressor running
        if (s.defrostMode === 'timer' && timerAccum.current >= 120 && s.frostThickness > 0.05) {
          timerAccum.current = 0
          useLabStore.getState().startDefrost()
        }
      }
    }, TICK_MS)

    return () => clearInterval(id)
  }, [])
}

export default useSimulation
