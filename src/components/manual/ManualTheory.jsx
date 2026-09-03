import { motion } from 'framer-motion'
import { theoryText, vcrStages } from '../../data/experimentData.js'
import VCRDiagram from './VCRDiagram.jsx'

export default function ManualTheory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-4xl space-y-4"
    >
      <section className="lab-panel px-7 py-5 shadow-panel">
        <h2 className="text-xl font-bold text-white">Theory — Description</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-300">{theoryText.intro}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-300">{theoryText.refrigerant}</p>
      </section>

      <section className="lab-panel px-5 py-5 shadow-panel">
        <h3 className="lab-label px-2">Vapour Compression Refrigeration Cycle</h3>
        <div className="mt-3 rounded-xl bg-lab-bg/60 p-3">
          <VCRDiagram />
        </div>
      </section>

      <section className="lab-panel overflow-hidden shadow-panel">
        <h3 className="lab-label border-b border-lab-border px-7 py-4">The four processes</h3>
        <div className="divide-y divide-lab-border/70">
          {vcrStages.map((st) => (
            <article key={st.id} className="px-7 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-lab-blue text-[11px] font-bold text-white">
                  {st.step}
                </span>
                <h4 className="text-sm font-semibold text-white">
                  {st.name} — {st.component}
                </h4>
                <span className="ml-auto font-mono text-[11px] text-lab-cold">{st.process}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">{st.detail}</p>
              <dl className="mt-3 grid gap-2 text-[11px] sm:grid-cols-3">
                {[
                  ['Inlet', st.inlet],
                  ['Outlet', st.outlet],
                  ['Refrigerant state', st.state],
                ].map(([k, v]) => (
                  <div key={k} className="lab-card px-3 py-2">
                    <dt className="text-lab-muted">{k}</dt>
                    <dd className="lab-readout mt-0.5 text-gray-200">{v}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="lab-panel px-7 py-5 shadow-panel">
        <h3 className="lab-label">Coefficient of Performance</h3>
        <p className="mt-2 font-mono text-sm text-lab-cold">{theoryText.cop}</p>
        <h3 className="lab-label mt-5">Auxiliary systems</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {theoryText.auxiliary.map((a) => (
            <li key={a} className="lab-card px-3 py-2 text-[13px] text-gray-300">
              <span className="mr-2 text-lab-blue">▸</span>
              {a}
            </li>
          ))}
        </ul>
      </section>
    </motion.div>
  )
}
