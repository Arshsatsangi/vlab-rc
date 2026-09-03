import { AnimatePresence, motion } from 'framer-motion'
import { componentInfo } from '../../data/componentInfo.js'
import { useLabStore } from '../../store/labStore.js'

/** Floating card shown when a 3D component is selected. */
export default function ComponentInfoPanel() {
  const selected = useLabStore((s) => s.selectedComponent)
  const select = useLabStore((s) => s.selectComponent)
  const info = selected ? componentInfo[selected] : null

  return (
    <AnimatePresence>
      {info && (
        <motion.aside
          key={selected}
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.25 }}
          className="absolute left-4 top-16 w-[292px] overflow-hidden rounded-xl border bg-lab-panel/95 shadow-panel backdrop-blur"
          style={{ borderColor: `${info.accent}66` }}
        >
          <header
            className="flex items-start justify-between gap-2 px-4 py-3"
            style={{ backgroundColor: `${info.accent}1f` }}
          >
            <div>
              <h2 className="text-sm font-bold text-white">{info.label}</h2>
              <p className="mt-0.5 text-[10.5px] text-gray-400">{info.tag}</p>
            </div>
            <button
              onClick={() => select(null)}
              className="rounded px-1.5 text-lab-muted transition-colors hover:text-white"
              aria-label="Close component information"
            >
              ✕
            </button>
          </header>

          <div className="max-h-[46vh] overflow-y-auto px-4 py-3">
            <p
              className="lab-readout text-[10.5px] font-semibold"
              style={{ color: info.accent }}
            >
              {info.cycleStep}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-gray-300">{info.description}</p>
            <dl className="mt-3 space-y-1.5 border-t border-lab-border/70 pt-2.5">
              {info.specs.map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="w-[92px] shrink-0 text-[10px] uppercase tracking-wide text-lab-muted">
                    {k}
                  </dt>
                  <dd className="lab-readout flex-1 text-[10.5px] text-gray-200">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
