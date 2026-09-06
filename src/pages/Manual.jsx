import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ManualNav from '../components/manual/ManualNav.jsx'
import ManualCover from '../components/manual/ManualCover.jsx'
import ManualTheory from '../components/manual/ManualTheory.jsx'
import ManualProcedure from '../components/manual/ManualProcedure.jsx'
import ManualSafety from '../components/manual/ManualSafety.jsx'
import ManualGuide from '../components/manual/ManualGuide.jsx'

const pages = [
  { id: 'cover', label: 'Aim' },
  { id: 'theory', label: 'Theory' },
  { id: 'procedure', label: 'Thermostat & Procedure' },
  { id: 'safety', label: "Do's & Don'ts" },
  { id: 'guide', label: 'Using the Simulation' },
]

export default function Manual() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)

  const start = useCallback(() => navigate('/simulation'), [navigate])
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex((i) => Math.min(pages.length - 1, i + 1)), [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  const page = pages[index].id

  return (
    <>
      <ManualNav pages={pages} index={index} onSelect={setIndex} onPrev={prev} onNext={next} />
      <main className="flex-1 overflow-y-auto px-4 py-5">
        <AnimatePresence mode="wait">
          {page === 'cover' && <ManualCover key="cover" />}
          {page === 'theory' && <ManualTheory key="theory" />}
          {page === 'procedure' && <ManualProcedure key="procedure" />}
          {page === 'safety' && <ManualSafety key="safety" />}
          {page === 'guide' && <ManualGuide key="guide" onStart={start} />}
        </AnimatePresence>

        <div className="mx-auto mt-5 flex max-w-4xl items-center justify-between border-t border-lab-border pt-4">
          <button onClick={prev} disabled={index === 0} className="lab-btn">
            ← {index > 0 ? pages[index - 1].label : 'Back'}
          </button>
          <span className="lab-readout text-[11px] text-lab-muted">
            {pages[index].label} — page {index + 1} of {pages.length}
          </span>
          {index === pages.length - 1 ? (
            <button onClick={start} className="lab-btn lab-btn-active">
              Start Simulation →
            </button>
          ) : (
            <button onClick={next} className="lab-btn lab-btn-active">
              {pages[index + 1].label} →
            </button>
          )}
        </div>
      </main>
    </>
  )
}
