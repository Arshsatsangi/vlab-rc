import { motion } from 'framer-motion'
import { dos, donts, holidayInstructions, restartInstructions } from '../../data/experimentData.js'

export default function ManualSafety() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-5xl space-y-4"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="lab-panel overflow-hidden shadow-sm">
          <header className="flex items-center gap-2 border-b border-lab-green/30 bg-lab-green/10 px-5 py-3.5">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-lab-green/20 text-sm text-lab-green">
              ✓
            </span>
            <h2 className="text-base font-bold text-lab-text">Do&rsquo;s</h2>
          </header>
          <ul className="divide-y divide-lab-border/60">
            {dos.map((d) => (
              <li key={d} className="flex gap-3 px-5 py-3 text-[13.5px] leading-relaxed text-lab-muted">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-lab-green" />
                {d}
              </li>
            ))}
          </ul>
        </section>

        <section className="lab-panel overflow-hidden shadow-sm">
          <header className="flex items-center gap-2 border-b border-lab-hot/30 bg-lab-hot/10 px-5 py-3.5">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-lab-hot/20 text-sm text-lab-hot">
              ✕
            </span>
            <h2 className="text-base font-bold text-lab-text">Don&rsquo;ts</h2>
          </header>
          <ul className="divide-y divide-lab-border/60">
            {donts.map((d) => (
              <li key={d} className="flex gap-3 px-5 py-3 text-[13.5px] leading-relaxed text-lab-muted">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-lab-hot" />
                {d}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="lab-panel px-6 py-5 shadow-sm">
          <h2 className="lab-label">Holiday instructions</h2>
          <ul className="mt-3 space-y-2">
            {holidayInstructions.map((h) => (
              <li key={h} className="flex gap-2.5 text-[13.5px] leading-relaxed text-lab-muted">
                <span className="text-lab-amber">☀</span>
                {h}
              </li>
            ))}
          </ul>
        </section>

        <section className="lab-panel px-6 py-5 shadow-sm">
          <h2 className="lab-label">Restarting instructions</h2>
          <ul className="mt-3 space-y-2">
            {restartInstructions.map((r) => (
              <li key={r} className="flex gap-2.5 text-[13.5px] leading-relaxed text-lab-muted">
                <span className="text-lab-blue">⟳</span>
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg border border-lab-hot/40 bg-lab-hot/10 px-3 py-2.5 text-[12.5px] leading-relaxed text-lab-text">
            <strong className="font-semibold text-lab-copper">Caution:</strong> never restart the compressor
            immediately after switching off. The pressures on the two sides must equalise first,
            otherwise the motor stalls and the overload protector trips.
          </p>
        </section>
      </div>
    </motion.div>
  )
}
