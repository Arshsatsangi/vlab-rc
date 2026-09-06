// Experiment content — Refrigeration & Air Conditioning Lab
// Experiment No. 1: Study of Household / Domestic Refrigerator

export const experimentMeta = {
  number: 1,
  title: 'Study of Household / Domestic Refrigerator',
  subject: 'Refrigeration & Air Conditioning Lab',
  faculty: 'Prof. Udhhav Nimbalkar',
  aim: 'To study the working of a household refrigerator along with its auxiliary systems and wiring diagram.',
  priorKnowledge: ['Heat Pump', 'Refrigerator basics', 'Vapour Compression Cycle'],
  apparatus: [
    'Domestic refrigerator (cut-section / working model)',
    'Thermometers for cabinet and freezer temperature',
    'Clamp meter for compressor current',
    'Stopwatch for cut-in / cut-out timing',
  ],
}

export const vcrStages = [
  {
    id: 'compressor',
    step: 1,
    name: 'Compression',
    component: 'Compressor',
    process: 'Isentropic compression (1 → 2)',
    detail:
      'Low-pressure, low-temperature refrigerant vapour drawn from the evaporator is compressed to high pressure and high temperature. Work is supplied by the electric motor.',
    inlet: '-10 °C @ 1.2 bar',
    outlet: '70 °C @ 12 bar',
    state: 'Superheated vapour',
  },
  {
    id: 'condenser',
    step: 2,
    name: 'Condensation',
    component: 'Condenser',
    process: 'Constant pressure heat rejection (2 → 3)',
    detail:
      'High-pressure superheated vapour rejects latent heat to the surrounding air through the coils at the back of the cabinet and condenses into a high-pressure liquid.',
    inlet: '70 °C @ 12 bar',
    outlet: '45 °C @ 12 bar',
    state: 'Saturated / sub-cooled liquid',
  },
  {
    id: 'expansionValve',
    step: 3,
    name: 'Expansion',
    component: 'Capillary Tube (Expansion Device)',
    process: 'Throttling — constant enthalpy (3 → 4)',
    detail:
      'The high-pressure liquid is throttled through a long, narrow capillary tube. Pressure and temperature drop sharply and part of the liquid flashes into vapour.',
    inlet: '45 °C @ 12 bar',
    outlet: '-12 °C @ 1.2 bar',
    state: 'Low-pressure liquid + vapour mixture',
  },
  {
    id: 'evaporator',
    step: 4,
    name: 'Evaporation',
    component: 'Evaporator',
    process: 'Constant pressure heat absorption (4 → 1)',
    detail:
      'The cold refrigerant mixture absorbs latent heat from the cabinet air and food, producing the refrigerating effect, and leaves as slightly superheated vapour.',
    inlet: '-12 °C @ 1.2 bar',
    outlet: '-8 °C @ 1.2 bar',
    state: 'Dry saturated / slightly superheated vapour',
  },
]

export const theoryText = {
  intro:
    'A domestic refrigerator is a self-contained, hermetically sealed unit working on the Vapour Compression Refrigeration (VCR) cycle. It maintains the cabinet at a temperature lower than the surroundings by continuously extracting heat from the cabinet and rejecting it to the room air. Capacity of a household refrigerator normally ranges from 165 to 300 litres, with a refrigerating capacity of about 0.1 to 0.3 tonnes of refrigeration (TR).',
  refrigerant:
    'Modern domestic refrigerators use R-134a (tetrafluoroethane) or R-600a (isobutane). R-12 was discontinued because its chlorine content damages the ozone layer; R-134a is chlorine-free with zero Ozone Depletion Potential.',
  cop: 'COP = Refrigerating effect / Work input = (h1 − h4) / (h2 − h1). A domestic refrigerator typically operates with a COP between 2 and 3.',
  auxiliary: [
    'Hermetically sealed reciprocating compressor with motor sealed in one shell',
    'Natural-convection wire-and-tube condenser mounted at the rear',
    'Capillary tube as the throttling device (no moving parts, maintenance-free)',
    'Drier / strainer to absorb moisture and trap solid particles',
    'Bimetal thermostat sensing evaporator temperature',
    'Overload protector and relay for motor starting and protection',
    'Door gasket with magnetic strip and interior lamp with door switch',
  ],
}

export const thermostatInfo = {
  working:
    'The thermostat is an automatic temperature-control switch wired in series with the compressor motor. A bellows-and-capillary sensing element (or a bimetallic strip) is clamped to the evaporator surface. As the evaporator cools, the volatile charge in the bulb contracts, the bellows collapses and the contacts open — the compressor CUTS OUT. When the cabinet warms up again the charge expands, the contacts close and the compressor CUTS IN.',
  bimetal:
    'A bimetal thermostat uses two dissimilar metals (e.g. brass and steel) bonded together. Because their coefficients of thermal expansion differ, the strip bends when heated and straightens when cooled, making and breaking the electrical contact.',
  cutIn: 8,
  cutOut: 2,
  differential: 6,
  note: 'Differential = Cut-in temperature − Cut-out temperature. A larger differential means fewer but longer compressor runs; too small a differential causes rapid short-cycling and motor overheating.',
}

export const defrostInfo = {
  why: 'Moisture in the cabinet air freezes on the cold evaporator surface. Frost is a thermal insulator — a 3 mm layer can reduce the heat-transfer rate substantially, increasing running time and power consumption. It must be removed periodically.',
  methods: [
    {
      name: 'Manual defrosting',
      detail:
        'The user switches the thermostat to the DEFROST position or unplugs the unit. The compressor stops, frost melts by cabinet heat and drains into the drip tray. Used in single-door direct-cool refrigerators.',
    },
    {
      name: 'Semi-automatic (push-button) defrosting',
      detail:
        'Pressing the defrost button opens the thermostat contacts. Once the evaporator reaches about 4 °C the contacts close automatically and normal cooling resumes.',
    },
    {
      name: 'Automatic / timer defrosting',
      detail:
        'An electric timer interrupts the compressor circuit at fixed intervals (typically once every 6–12 hours) and energises an electric defrost heater near the evaporator for 15–25 minutes. A defrost-termination thermostat cuts the heater once the coil clears.',
    },
  ],
}

export const dos = [
  'Install the refrigerator in a well-ventilated place, at least 75–100 mm clear of the wall so the condenser can reject heat.',
  'Level the cabinet on its adjustable feet so the door closes and seals under its own weight.',
  'Allow hot food to cool to room temperature before placing it inside.',
  'Cover all liquids and store vegetables in the crisper to limit moisture and therefore frost.',
  'Open the door only when required and close it quickly to reduce heat and moisture ingress.',
  'Defrost the evaporator as soon as the frost layer approaches 5–6 mm.',
  'Clean the condenser coils and the drip tray periodically.',
  'Use a dedicated, properly earthed socket and a voltage stabiliser where the supply fluctuates.',
]

export const donts = [
  'Do not overload the cabinet or block the air-circulation gaps between shelves.',
  'Do not place hot vessels directly on the evaporator or shelves.',
  'Do not scrape frost with a knife or any sharp tool — the evaporator tubing can be punctured.',
  'Do not keep the door open for long periods or stand items against the gasket.',
  'Do not restart the compressor immediately after switching off — wait at least 5 minutes for pressures to equalise, otherwise the motor may not start and the overload protector will trip.',
  'Do not store volatile or inflammable liquids such as petrol, ether or solvents inside the cabinet.',
  'Do not use an extension cord or share the socket with high-current appliances.',
  'Do not wash the interior with hot water or abrasive cleaners.',
]

export const holidayInstructions = [
  'Short absence (up to a week): set the thermostat to a warmer setting and leave the unit running.',
  'Long absence: remove all food, switch off and unplug the unit, defrost fully and wipe the interior dry.',
  'Leave the door slightly ajar (wedge it open) to prevent mould and stale odour.',
  'Clean and replace the drip tray before leaving.',
]

export const restartInstructions = [
  'Wait at least 5 minutes after switching OFF before switching ON again — the pressures must equalise.',
  'Check the supply voltage; a low voltage can prevent the hermetic motor from starting.',
  'Set the thermostat to a mid position first, then adjust after the cabinet has pulled down.',
  'Expect a longer first run: the compressor operates almost continuously until the cabinet reaches the set temperature.',
]

export const simulationGuide = [
  {
    icon: 'cursor',
    title: 'Rotate the model',
    detail: 'Left-click and drag anywhere on the 3D view to orbit around the refrigerator.',
  },
  {
    icon: 'zoom',
    title: 'Zoom',
    detail: 'Scroll the mouse wheel (or pinch on a trackpad) to move closer or further away.',
  },
  {
    icon: 'target',
    title: 'Inspect a component',
    detail:
      'Click the compressor, condenser, capillary tube, evaporator or thermostat bulb. The part is highlighted, the camera focuses on it and an information card opens.',
  },
  {
    icon: 'power',
    title: 'Control panel (right)',
    detail:
      'Switch the unit ON/OFF, set the thermostat from 1 °C to 8 °C, trigger a defrost, change the refrigerant flow speed and toggle labels, X-ray and exploded views.',
  },
  {
    icon: 'gauge',
    title: 'Live readings',
    detail:
      'Temperatures, pressures, refrigerant state, frost thickness and power draw update continuously while the simulation runs.',
  },
  {
    icon: 'table',
    title: 'Observation table',
    detail:
      'Press "Record Reading" at intervals to build your lab record, then export it as a printable PDF for your journal.',
  },
]

export const conclusionTemplate =
  'The working of a household refrigerator was studied. The refrigerant is circulated through the compressor, condenser, capillary tube and evaporator, forming a closed vapour compression refrigeration cycle. The thermostat was observed to cut out the compressor at the set cabinet temperature and cut in again after a rise equal to the differential. Frost formation on the evaporator was observed to increase the running time, and defrosting restored normal performance.'
