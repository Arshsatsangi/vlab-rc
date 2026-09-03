// Per-component metadata: info card copy, camera framing, exploded-view offsets.
// `mesh` keys must match the names used in src/three/refrigerator.js.

export const componentInfo = {
  compressor: {
    label: 'Compressor',
    tag: 'Hermetically sealed reciprocating',
    accent: '#ef4444',
    description:
      'Hermetically sealed reciprocating compressor. It draws low-pressure refrigerant vapour from the evaporator and compresses it to a high pressure and temperature so that heat can be rejected in the condenser. The motor and cylinder are welded inside one steel dome, which is why it cannot be repaired in the field.',
    specs: [
      ['Type', 'Hermetic reciprocating, single cylinder'],
      ['Power input', '≈ 150 W'],
      ['Suction (inlet)', '−10 °C @ 1.2 bar'],
      ['Discharge (outlet)', '70 °C @ 12 bar'],
      ['Speed', '2800–2900 rpm'],
    ],
    cycleStep: 'Process 1 → 2 : isentropic compression',
    camera: { pos: [1.6, -0.35, 2.6], target: [0, -0.82, -0.1] },
    explode: [0.35, -0.05, -0.85],
  },
  condenser: {
    label: 'Condenser',
    tag: 'Wire-and-tube, rear mounted',
    accent: '#f97316',
    description:
      'A natural-convection wire-and-tube condenser mounted on the back of the cabinet. High-pressure superheated vapour from the compressor rejects its heat to the room air and condenses into a high-pressure liquid. This is why the rear of a running refrigerator feels warm and needs clearance from the wall.',
    specs: [
      ['Type', 'Natural convection, wire-and-tube'],
      ['Inlet', '70 °C @ 12 bar (superheated vapour)'],
      ['Outlet', '40–50 °C @ 12 bar (liquid)'],
      ['Heat rejected', 'Refrigerating effect + compressor work'],
      ['Clearance', '75–100 mm from the wall'],
    ],
    cycleStep: 'Process 2 → 3 : constant-pressure heat rejection',
    camera: { pos: [1.4, 1.1, -3.0], target: [0, 0.35, -0.55] },
    explode: [0.0, 0.5, -1.0],
  },
  expansionValve: {
    label: 'Capillary Tube',
    tag: 'Throttling / expansion device',
    accent: '#b87333',
    description:
      'A long, small-bore copper tube (typically 2–4 m long, 0.6–1.0 mm bore) that acts as the throttling device. It offers a fixed resistance which drops the refrigerant from condenser pressure to evaporator pressure. The process is irreversible and takes place at constant enthalpy, so temperature falls sharply and part of the liquid flashes to vapour.',
    specs: [
      ['Type', 'Fixed-restriction capillary tube'],
      ['Bore / length', '0.6–1.0 mm / 2–4 m'],
      ['Inlet', '45 °C @ 12 bar (liquid)'],
      ['Outlet', '−12 °C @ 1.2 bar (liquid + vapour)'],
      ['Advantage', 'No moving parts, no maintenance, low cost'],
    ],
    cycleStep: 'Process 3 → 4 : throttling at constant enthalpy',
    camera: { pos: [-2.2, 0.4, 2.2], target: [-0.35, 0.1, -0.2] },
    explode: [-0.9, 0.15, -0.25],
  },
  evaporator: {
    label: 'Evaporator',
    tag: 'Freezer coil, direct cooling',
    accent: '#06b6d4',
    description:
      'Fitted at the top of the cabinet, forming the freezer compartment. The cold low-pressure refrigerant mixture absorbs latent heat from the cabinet air and food, producing the refrigerating effect, and leaves as vapour. Cold air sinks and warm air rises, setting up natural convection that cools the whole cabinet.',
    specs: [
      ['Type', 'Direct-cooling roll-bond / plate coil'],
      ['Operating temperature', '−5 °C to −10 °C'],
      ['Inlet', '−12 °C @ 1.2 bar (liquid + vapour)'],
      ['Outlet', '−8 °C @ 1.2 bar (dry vapour)'],
      ['Note', 'Frost above ~5 mm insulates the coil and must be removed'],
    ],
    cycleStep: 'Process 4 → 1 : constant-pressure heat absorption',
    camera: { pos: [0, 1.5, 2.6], target: [0, 0.72, 0] },
    explode: [0.0, 0.9, 0.5],
  },
  thermostat: {
    label: 'Thermostat Bulb',
    tag: 'Automatic temperature control',
    accent: '#f59e0b',
    description:
      'The sensing bulb of the thermostat, clamped to the evaporator surface. It controls the compressor ON/OFF cycles: when the evaporator is cold enough the contacts open and the compressor cuts out; when the cabinet warms by the differential the contacts close and the compressor cuts in again.',
    specs: [
      ['Type', 'Bellows-and-capillary / bimetal switch'],
      ['Cut-in temperature', '8 °C'],
      ['Cut-out temperature', '2 °C'],
      ['Differential', '6 °C'],
      ['Wiring', 'In series with the compressor motor'],
    ],
    cycleStep: 'Control element — not part of the refrigerant circuit',
    camera: { pos: [-1.5, 1.25, 2.2], target: [-0.28, 0.7, 0.05] },
    explode: [-0.5, 0.6, 0.45],
  },
}

export const componentOrder = [
  'compressor',
  'condenser',
  'expansionValve',
  'evaporator',
  'thermostat',
]

export const cameraPresets = {
  front: { pos: [0, 0.6, 4.6], target: [0, 0.1, 0] },
  side: { pos: [4.4, 0.6, 0.4], target: [0, 0.1, 0] },
  top: { pos: [0.01, 4.6, 0.6], target: [0, 0.1, 0] },
  '3d': { pos: [2.9, 1.9, 3.6], target: [0, 0.1, 0] },
  rear: { pos: [-1.2, 1.2, -4.2], target: [0, 0.2, -0.4] },
}

/**
 * The same five views written as a viewer bearing instead of a camera position.
 *
 * `yaw` is where the viewer stands around the cabinet — 0° in front of the door,
 * +90° at its right-hand side (the side `cameraPresets.side` shows), 180° behind
 * it at the condenser — and `pitch` is the viewer's elevation, negative looking
 * down. In AR the camera is the real device camera and must not be moved, so the
 * unit is turned by the *inverse* of this rotation instead, which puts the same
 * face on screen as the lab camera preset does.
 *
 * Only `top` carries a pitch: a student cannot climb above a unit standing in
 * their room, so that view has to be produced by tipping the model. The others
 * are yaw-only, which keeps the cabinet standing upright on the floor. The 3D
 * yaw is the three-quarter bearing of `cameraPresets['3d']` (atan2(2.9, 3.6)).
 */
export const presetViewAngles = {
  front: { yaw: 0, pitch: 0 },
  side: { yaw: 90, pitch: 0 },
  top: { yaw: 0, pitch: -90 },
  '3d': { yaw: 38.9, pitch: 0 },
  rear: { yaw: 180, pitch: 0 },
}

export const viva = [
  {
    q: 'What is a vapour compression refrigeration cycle?',
    a: 'A closed cycle in which a refrigerant is alternately compressed and expanded, changing phase between liquid and vapour, so that it absorbs latent heat in the evaporator at low pressure and rejects it in the condenser at high pressure. The four processes are compression, condensation, throttling and evaporation.',
  },
  {
    q: 'What is the function of the capillary tube?',
    a: 'It is the throttling device. It reduces the pressure of the liquid refrigerant from condenser pressure to evaporator pressure and thereby its temperature, and it also meters the flow of refrigerant into the evaporator.',
  },
  {
    q: 'Explain cut-in and cut-out temperature.',
    a: 'Cut-out is the temperature at which the thermostat opens its contacts and stops the compressor (about 2 °C at the sensing point). Cut-in is the temperature at which the contacts close again and restart the compressor (about 8 °C). Their difference is the differential, about 6 °C.',
  },
  {
    q: 'What is the COP of a refrigerator?',
    a: 'Coefficient of Performance = refrigerating effect / work input = (h1 − h4)/(h2 − h1). It is a dimensionless ratio, always greater than one for a refrigerator, typically 2–3 for a domestic unit.',
  },
  {
    q: 'Why is R-134a used instead of R-12?',
    a: 'R-12 (CFC) contains chlorine, which destroys stratospheric ozone, and it was phased out under the Montreal Protocol. R-134a (HFC) is chlorine-free with zero Ozone Depletion Potential, is non-toxic and non-flammable, and has thermodynamic properties close to R-12.',
  },
  {
    q: 'What is frosting and how is it prevented?',
    a: 'Frosting is the deposition of ice on the evaporator surface from moisture in the cabinet air. Frost insulates the coil and reduces heat transfer. It is removed by manual, semi-automatic or automatic timer-controlled defrosting, and minimised by covering liquids and limiting door openings.',
  },
  {
    q: 'What is the range of household refrigerator capacity?',
    a: 'Gross volume commonly ranges from about 165 to 300 litres, with a refrigerating capacity of roughly 0.1 to 0.3 tonnes of refrigeration and a compressor power input of about 100–200 W.',
  },
]
