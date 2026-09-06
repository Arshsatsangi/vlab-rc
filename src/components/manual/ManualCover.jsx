import { motion } from 'framer-motion'
import { experimentMeta } from '../../data/experimentData.js'

export default function ManualCover() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-3xl"
    >
      <div className="lab-panel overflow-hidden shadow-stage">
        <div className="border-b border-lab-border bg-gradient-to-r from-lab-suction/15 via-transparent to-transparent px-7 py-6">
          <div className="lab-label">Experiment No. {experimentMeta.number}</div>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-lab-enamel">
            Study of Household / Domestic Refrigerator
          </h1>
          <p className="mt-2 text-sm text-lab-muted">
            {experimentMeta.subject} · {experimentMeta.faculty}
          </p>
        </div>

        <section className="border-b border-lab-border px-7 py-5">
          <h2 className="lab-label">Aim</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-lab-text">{experimentMeta.aim}</p>
        </section>

        <section className="border-b border-lab-border px-7 py-5">
          <h2 className="lab-label">Prior knowledge required</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {experimentMeta.priorKnowledge.map((k) => (
              <li key={k} className="lab-card px-3 py-2.5 text-sm text-lab-text">
                <span className="mr-2 text-lab-cold">▸</span>
                {k}
              </li>
            ))}
          </ul>
        </section>

        <section className="px-7 py-5">
          <h2 className="lab-label">Apparatus</h2>
          <ul className="mt-3 space-y-1.5">
            {experimentMeta.apparatus.map((a) => (
              <li key={a} className="flex gap-2.5 text-sm text-lab-text">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-lab-suction" />
                {a}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </motion.div>
  )
}
