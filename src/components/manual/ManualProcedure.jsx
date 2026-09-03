import { motion } from 'framer-motion'
import { thermostatInfo, defrostInfo } from '../../data/experimentData.js'
import ThermostatDiagram from './ThermostatDiagram.jsx'

const procedure = [
  'Inspect the refrigerator and identify the compressor, condenser, capillary tube, evaporator, drier and thermostat.',
  'Trace the refrigerant circuit from the compressor discharge through the condenser and capillary tube to the evaporator, and back to the compressor suction.',
  'Note the wiring: supply → thermostat → overload protector / relay → compressor motor, with the door switch feeding the interior lamp.',
  'Place thermometers in the freezer and in the fresh-food compartment and record the initial temperatures.',
  'Switch on the supply and set the thermostat to a mid position. Start the stopwatch.',
  'Record the cabinet and freezer temperatures every two minutes along with the compressor status.',
  'Note the temperature at which the compressor cuts out, and the temperature at which it cuts in again. Calculate the differential.',
  'Observe frost formation on the evaporator. When it becomes appreciable, run a defrost cycle and note the time taken.',
  'Switch off the supply, wait at least five minutes, then restart and note the pull-down behaviour.',
  'Tabulate all readings and draw the temperature–time curve.',
]

export default function ManualProcedure() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-4xl space-y-4"
    >
      <section className="lab-panel px-7 py-5 shadow-panel">
        <h2 className="text-xl font-bold text-white">Thermostat — automatic temperature control</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-300">{thermostatInfo.working}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            ['Cut-in', `${thermostatInfo.cutIn} °C`, 'text-lab-amber'],
            ['Cut-out', `${thermostatInfo.cutOut} °C`, 'text-lab-cold'],
            ['Differential', `${thermostatInfo.differential} °C`, 'text-lab-blue'],
          ].map(([k, v, tone]) => (
            <div key={k} className="lab-card px-4 py-3">
              <div className="lab-label">{k}</div>
              <div className={`lab-readout mt-1 text-xl font-semibold ${tone}`}>{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl bg-lab-bg/60 p-3">
          <ThermostatDiagram />
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-lab-muted">{thermostatInfo.note}</p>
      </section>

      <section className="lab-panel px-7 py-5 shadow-panel">
        <h2 className="text-xl font-bold text-white">Bimetal thermostat</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-300">{thermostatInfo.bimetal}</p>
      </section>

      <section className="lab-panel px-7 py-5 shadow-panel">
        <h2 className="text-xl font-bold text-white">Defrosting</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-300">{defrostInfo.why}</p>
        <div className="mt-4 space-y-2">
          {defrostInfo.methods.map((m, i) => (
            <div key={m.name} className="lab-card px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-lab-blue/25 text-[10px] font-bold text-lab-blue">
                  {i + 1}
                </span>
                <h3 className="text-sm font-semibold text-white">{m.name}</h3>
              </div>
              <p className="mt-1.5 pl-7 text-[13px] leading-relaxed text-gray-300">{m.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lab-panel px-7 py-5 shadow-panel">
        <h2 className="text-xl font-bold text-white">Procedure</h2>
        <ol className="mt-3 space-y-2.5">
          {procedure.map((step, i) => (
            <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-gray-300">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-lab-card text-[11px] font-bold text-lab-cold ring-1 ring-lab-border">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </motion.div>
  )
}
