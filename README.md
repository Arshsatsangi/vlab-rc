# 🧊 Virtual Refrigeration & Air Conditioning Lab

**Experiment No. 1 — Study of Household / Domestic Refrigerator**

An interactive 3D virtual laboratory: a digital lab manual followed by a fully animated
vapour-compression-cycle simulation of a domestic refrigerator, with live readings and an
exportable observation table.

Prepared for **Prof. Udhhav Nimbalkar** — Refrigeration & Air Conditioning Lab.

---

## Stack

| Purpose | Library |
| ------- | ------- |
| UI | React 18 + Vite 5 |
| 3D | Three.js r163 (`WebGLRenderer`, `OrbitControls`) |
| Animation | GSAP 3 timelines, Framer Motion for page transitions |
| State | Zustand 4 |
| Styling | Tailwind CSS 3 (dark mode, `class` strategy) |

---

## How to run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (by default <http://localhost:5173>).

To build and preview a production bundle:

```bash
npm run build
npm run preview
```

## How to use

### 1. Digital lab manual (`/manual`)

Five pages with a progress bar and forward / back navigation (arrow keys work too):

1. **Aim** — experiment number, aim, prior knowledge and apparatus.
2. **Theory** — description of the VCR cycle with an animated SVG circuit diagram and the four
   processes tabulated.
3. **Thermostat & Procedure** — cut-in / cut-out with a temperature–time graph, the bimetal
   thermostat, the three defrosting methods and the step-by-step procedure.
4. **Do's & Don'ts** — two-column cards plus holiday and restarting instructions.
5. **Using the simulation** — controls guide and the **Start Simulation** button.

### 2. Simulation (`/simulation`)

| Area | What it does |
| ---- | ------------ |
| 3D view | Drag to orbit, scroll to zoom. Click the compressor, condenser, capillary tube, evaporator or thermostat bulb to highlight it, fly the camera to it and open its data card. |
| Left rail | The four processes of the cycle (click to focus), frost indicator, event log. |
| Right panel | Power ON/OFF, door, reset · thermostat 1–8 °C · defrost mode + Start Defrost · flow speed 0.5× / 1× / 2× · labels, flow, X-ray and exploded view · camera presets · Record Reading. |
| Bottom bar | The five live readings — compressor inlet, condenser outlet, evaporator temp, cabinet temp, refrigerant state — plus power draw and elapsed time. |
| Observation table | Record readings (only while the supply is ON), review them, **Download PDF** or clear the table. |

### What the simulation models

- Cabinet cools from 25 °C at 0.5 °C/s while the compressor runs and warms at 0.2 °C/s when idle.
- The thermostat cuts out at the set temperature and cuts back in after a **6 °C differential**.
- Frost grows with running time and every door opening; above 50 % it insulates the coil and
  cooling slows measurably. A defrost cycle clears it in 5 s and leaves the cabinet 5 °C warmer.
- Opening the door adds a heat load, lights the interior lamp and accelerates frosting.

---

## Project structure

```
src/
├── pages/            Landing, Manual, Simulation
├── components/
│   ├── manual/       Cover, Theory, Procedure, Safety, Guide, Nav + SVG diagrams
│   ├── simulation/   SceneCanvas, RefrigeratorModel, VCRCycleFlow, ComponentLabels,
│   │                 ControlPanel, DataReadings, ComponentInfoPanel, ObservationTable
│   └── ui/           Navbar, Sidebar, Modal, Tooltip
├── three/            scene, refrigerator, refrigerantFlow, thermostat, defrost, helpers
├── animations/       cycleAnimation, componentHighlight, stateTransitions
├── store/            labStore.js (Zustand)
├── data/             experimentData.js, componentInfo.js
└── hooks/            useThreeScene.js, useSimulation.js
```

`docs/viva_questions.md` and `docs/result_format.md` hold the viva questions and the journal
result / calculation template.

---

## Credits

Built as a virtual-lab teaching aid for the Refrigeration & Air Conditioning Lab.
Experiment content and observation format after Prof. Udhhav Nimbalkar's lab manual.
