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
      <div className="lab-panel overflow-hidden shadow-panel">
        <div className="border-b border-lab-border bg-gradient-to-r from-lab-blue/20 via-lab-cold/10 to-transparent px-7 py-6">
          <div className="lab-label">Experiment No. {experimentMeta.number}</div>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-white">
            Study of Household / Domestic Refrigerator
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {experimentMeta.subject} · {experimentMeta.faculty}
          </p>
        </div>

        <section className="border-b border-lab-border px-7 py-5">
          <h2 className="lab-label">Aim</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-gray-200">{experimentMeta.aim}</p>
        </section>

        <section className="border-b border-lab-border px-7 py-5">
          <h2 className="lab-label">Prior knowledge required</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {experimentMeta.priorKnowledge.map((k) => (
              <li key={k} className="lab-card px-3 py-2.5 text-sm text-gray-200">
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
              <li key={a} className="flex gap-2.5 text-sm text-gray-300">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-lab-blue" />
                {a}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </motion.div>
  )
}
