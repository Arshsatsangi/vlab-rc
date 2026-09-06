import { create } from 'zustand'
import { statusTone } from '../theme/tone.js'

export const ROOM_TEMP = 25
export const DIFFERENTIAL = 6
export const COOL_RATE = 0.5 // °C per simulated second, compressor running
export const WARM_RATE = 0.2 // °C per simulated second, compressor idle
export const DEFROST_SECONDS = 5

const initialState = {
  // --- Refrigerator state ---
  isPowered: false, // master switch (user ON/OFF)
  compressorOn: false, // thermostat-controlled
  thermostatSetting: 4, // target cabinet temperature, °C
  defrostMode: 'manual', // 'manual' | 'timer'
  isDefrosting: false,
  defrostProgress: 0, // 0 → 1
  cabinetTemp: ROOM_TEMP,
  freezerTemp: ROOM_TEMP - 2,
  evaporatorTemp: ROOM_TEMP,
  condenserTemp: ROOM_TEMP,
  suctionTemp: ROOM_TEMP,
  frostThickness: 0, // 0 → 1
  doorOpen: false,
  runSeconds: 0, // total compressor run time
  elapsed: 0, // total simulated seconds since power on
  cycleCount: 0, // number of completed cut-out events
  lastEvent: null, // { type, text, at }

  // --- Visual options ---
  showLabels: true,
  showFlow: true,
  xrayView: false,
  explodedView: false,
  selectedComponent: null,
  hoveredComponent: null,
  viewPreset: '3d',
  // True once the view no longer matches the highlighted preset — set when the
  // unit is turned by hand in AR. Only the highlight and the re-apply logic read
  // it; the lab view's own orbit is deliberately left alone.
  viewCustom: false,
  flowSpeed: 1, // 0.5 | 1 | 2

  // --- AR mode ---
  // `arCapability` is deliberately NOT part of initialState: it describes the
  // device, not the experiment, so a reset must not throw the detection away.
  arActive: false,
  arTier: null, // 'xr' | 'marker' | 'webcam' — the tier actually running
  arPlaced: false, // has the unit been anchored in the room yet
  arCutaway: false,
  arStatus: null, // one short line of guidance for the AR HUD
  arTapped: null, // component name tapped in cutaway mode

  // --- Lab record ---
  observations: [],
}

export const useLabStore = create((set, get) => ({
  ...initialState,

  // Detected once per page load and cached — see src/ar/capability.js.
  arCapability: null, // { tier, label, reason }

  // ---- Power / thermostat ----
  startRefrigerator: () =>
    set({
      isPowered: true,
      compressorOn: true,
      lastEvent: { type: 'start', text: 'Supply ON — compressor started', at: Date.now() },
    }),

  stopRefrigerator: () =>
    set({
      isPowered: false,
      compressorOn: false,
      isDefrosting: false,
      defrostProgress: 0,
      lastEvent: { type: 'stop', text: 'Supply OFF — compressor stopped', at: Date.now() },
    }),

  togglePower: () => (get().isPowered ? get().stopRefrigerator() : get().startRefrigerator()),

  setThermostat: (temp) => set({ thermostatSetting: Number(temp) }),

  setDefrostMode: (mode) => set({ defrostMode: mode }),

  cutOut: () =>
    set((s) => ({
      compressorOn: false,
      cycleCount: s.cycleCount + 1,
      lastEvent: {
        type: 'cutout',
        text: `CUT-OUT at ${s.cabinetTemp.toFixed(1)} °C`,
        at: Date.now(),
      },
    })),

  cutIn: () =>
    set((s) => ({
      compressorOn: true,
      lastEvent: {
        type: 'cutin',
        text: `CUT-IN at ${s.cabinetTemp.toFixed(1)} °C`,
        at: Date.now(),
      },
    })),

  // ---- Defrost ----
  startDefrost: () => {
    if (get().isDefrosting) return
    set({
      isDefrosting: true,
      defrostProgress: 0,
      compressorOn: false,
      lastEvent: { type: 'defrost', text: 'Defrost cycle started', at: Date.now() },
    })
  },

  finishDefrost: () =>
    set((s) => ({
      isDefrosting: false,
      defrostProgress: 1,
      frostThickness: 0,
      cabinetTemp: s.cabinetTemp + 5,
      compressorOn: s.isPowered,
      lastEvent: { type: 'defrostDone', text: 'DEFROST COMPLETE', at: Date.now() },
    })),

  openDoor: () =>
    set((s) => ({
      doorOpen: true,
      frostThickness: Math.min(1, s.frostThickness + 0.01),
      lastEvent: { type: 'door', text: 'Door opened — heat and moisture ingress', at: Date.now() },
    })),

  closeDoor: () => set({ doorOpen: false }),
  toggleDoor: () => (get().doorOpen ? get().closeDoor() : get().openDoor()),

  // ---- Physics tick (called by useSimulation) ----
  tick: (patch) => set(patch),

  /** One-line status message for the sidebar ticker — the app's only toast. */
  notify: (text, type = 'info') => set({ lastEvent: { type, text, at: Date.now() } }),

  // ---- Visual options ----
  setShowLabels: (v) => set({ showLabels: v }),
  setShowFlow: (v) => set({ showFlow: v }),
  setXray: (v) => set({ xrayView: v }),
  setExploded: (v) => set({ explodedView: v, selectedComponent: null }),
  setFlowSpeed: (v) => set({ flowSpeed: v }),

  // A preset means the same view in both modes: outside AR the camera flies to
  // it, inside AR the unit turns to it. The open component card is only dismissed
  // in the lab view, where the camera fly would otherwise fight the component
  // framing; in AR nothing moves the camera, so the card is left alone.
  setViewPreset: (v) =>
    set((s) => ({
      viewPreset: v,
      viewCustom: false,
      selectedComponent: s.arActive ? s.selectedComponent : null,
    })),

  /** Flagged when a hand rotation in AR leaves the highlighted preset behind. */
  setViewCustom: (v) => set({ viewCustom: !!v }),

  selectComponent: (name) => set({ selectedComponent: name }),
  hoverComponent: (name) => set({ hoveredComponent: name }),

  // ---- AR mode ----
  // The AR controller subscribes to `arActive` and tears itself down when it
  // goes false, so `reset()` (which spreads initialState) also exits AR and
  // releases the camera track without needing any special case.
  setArCapability: (cap) => set({ arCapability: cap }),

  enterAr: (tier) =>
    set({
      arActive: true,
      arTier: tier,
      arPlaced: false,
      arCutaway: false,
      arStatus: null,
      arTapped: null,
      selectedComponent: null,
      hoveredComponent: null,
      // AR opens showing whichever preset is highlighted, so the highlight is
      // honest again even if the lab view had been orbited away from it.
      viewCustom: false,
    }),

  exitAr: () =>
    set({
      arActive: false,
      arTier: null,
      arPlaced: false,
      arCutaway: false,
      arStatus: null,
      arTapped: null,
    }),

  setArPlaced: (v) => set({ arPlaced: v }),
  setArStatus: (text) => set({ arStatus: text }),
  setArCutaway: (v) => set({ arCutaway: v, arTapped: null }),
  toggleArCutaway: () => set((s) => ({ arCutaway: !s.arCutaway, arTapped: null })),
  setArTapped: (name) => set({ arTapped: name }),

  // ---- Observation table ----
  // Readings are only meaningful while the supply is ON — a reading taken with
  // the refrigerator switched off would just repeat the ambient values.
  recordReading: () =>
    set((s) => {
      if (!s.isPowered) {
        return {
          lastEvent: {
            type: 'warn',
            text: 'Switch the supply ON before recording a reading',
            at: Date.now(),
          },
        }
      }
      return {
        observations: [
          ...s.observations,
          {
            sn: s.observations.length + 1,
            time: +(s.elapsed / 60).toFixed(2),
            cabinetTemp: +s.cabinetTemp.toFixed(1),
            freezerTemp: +s.freezerTemp.toFixed(1),
            evaporatorTemp: +s.evaporatorTemp.toFixed(1),
            condenserTemp: +s.condenserTemp.toFixed(1),
            status: s.isDefrosting ? 'DEFROST' : s.compressorOn ? 'ON' : 'OFF',
            frost: Math.round(s.frostThickness * 100),
          },
        ],
      }
    }),

  clearObservations: () => set({ observations: [] }),

  reset: () =>
    set((s) => ({
      ...initialState,
      // preserve the user's view preferences across a reset
      showLabels: s.showLabels,
      showFlow: s.showFlow,
      viewPreset: s.viewPreset,
      flowSpeed: s.flowSpeed,
      lastEvent: { type: 'reset', text: 'Simulation reset to room conditions', at: Date.now() },
    })),
}))

// ---- Derived selectors ----
/**
 * Machine state, with its colour taken from the one palette that defines them
 * (Readout.jsx). Returning the hex from here rather than re-declaring it means
 * the status chip, the AR HUD and the observation table cannot drift apart.
 */
export const selectStatus = (s) => {
  const label = s.isDefrosting
    ? 'Defrosting'
    : !s.isPowered
      ? 'Off'
      : s.compressorOn
        ? 'Running'
        : 'Idle (cut-out)'
  return { label, color: statusTone(label) }
}

// Compressor ≈150 W; interior lamp 15 W when the door is open;
// defrost heater ≈120 W. Efficiency falls as frost builds up.
export const selectPower = (s) => {
  let w = 0
  if (s.compressorOn) w += 150 * (1 + 0.25 * s.frostThickness)
  if (s.isDefrosting) w += 120
  if (s.doorOpen) w += 15
  return Math.round(w)
}

export const selectRefrigerantState = (s) => {
  if (!s.compressorOn) return 'Static / equalising'
  return 'Vapour → Liquid → Mixture'
}

/**
 * The live reading that belongs to one component, for the AR cutaway labels.
 * Returns `{ label, value }` so the caller does not have to know which of the
 * simulated temperatures is the meaningful one for that part.
 */
export const selectComponentTemp = (s, name) => {
  const t = (v) => `${v.toFixed(1)} °C`
  switch (name) {
    case 'compressor':
      return { label: 'Suction → discharge', value: `${t(s.suctionTemp)} → ${t(s.condenserTemp)}` }
    case 'condenser':
      return { label: 'Condensing temperature', value: t(s.condenserTemp) }
    case 'expansionValve':
      return { label: 'Outlet after throttling', value: t(s.evaporatorTemp) }
    case 'evaporator':
      return { label: 'Coil temperature', value: t(s.evaporatorTemp) }
    case 'thermostat':
      return { label: 'Cabinet sensed', value: t(s.cabinetTemp) }
    default:
      return null
  }
}

export default useLabStore
