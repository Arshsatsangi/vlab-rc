import { motion } from 'framer-motion'
import { simulationGuide } from '../../data/experimentData.js'

const readings = [
  ['Compressor inlet', 'Suction temperature of the low-pressure vapour'],
  ['Condenser outlet', 'Temperature of the high-pressure liquid'],
  ['Evaporator temp', 'Coil temperature — the coldest point of the circuit'],
  ['Cabinet temp', 'Fresh-food compartment air temperature'],
  ['Refrigerant state', 'Phase of the refrigerant around the circuit'],
]

export default function ManualGuide({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-4xl space-y-4"
    >
      <section className="lab-panel px-7 py-5 shadow-panel">
        <h2 className="text-xl font-bold text-white">How to use the simulation</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-gray-300">
          The 3D model is fully interactive. Work through the controls in the order below to
          reproduce the readings required for your observation table.
        </p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {simulationGuide.map((g) => (
            <div key={g.title} className="lab-card px-4 py-3">
              <div className="flex items-center gap-2">
                <span aria-hidden="true">{g.icon}</span>
                <h3 className="text-sm font-semibold text-white">{g.title}</h3>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-gray-400">{g.detail}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="lab-panel px-7 py-5 shadow-panel">
        <h3 className="lab-label">What the five live readings mean</h3>
        <dl className="mt-3 divide-y divide-lab-border/70">
          {readings.map(([k, v]) => (
            <div key={k} className="flex flex-wrap gap-x-4 gap-y-1 py-2.5">
              <dt className="w-40 shrink-0 text-[13px] font-semibold text-lab-cold">{k}</dt>
              <dd className="text-[13px] text-gray-300">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="lab-panel px-7 py-5 shadow-panel">
        <h3 className="lab-label">Suggested run for the observation table</h3>
        <ol className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-gray-300">
          {[
            'Switch the supply ON and set the thermostat to 4 °C.',
            'Record a reading immediately, then every two simulated minutes.',
            'Note the cabinet temperature at which the compressor cuts out.',
            'Wait for the cabinet to warm and note the cut-in temperature; the difference is the differential.',
            'Open and close the door a few times and watch the frost indicator climb.',
            'Run a defrost cycle once frost is above 50 %, then continue recording.',
            'Download the PDF and attach it to your journal.',
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-lab-card text-[10px] font-bold text-lab-cold ring-1 ring-lab-border">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-lab-blue/40 bg-lab-blue/10 px-7 py-7 text-center">
        <h3 className="text-lg font-bold text-white">Ready to begin</h3>
        <p className="max-w-md text-[13px] leading-relaxed text-gray-300">
          The manual is complete. Launch the interactive 3D refrigerator to perform the experiment
          and record your observations.
        </p>
        <button
          onClick={onStart}
          className="mt-1 rounded-xl bg-lab-blue px-7 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:bg-blue-500 active:scale-[0.98]"
        >
          ▶ Start Simulation
        </button>
      </div>
    </motion.div>
  )
}
