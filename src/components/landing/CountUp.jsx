import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

/**
 * An instrument digit that counts up to its value once it scrolls into view.
 *
 * Numbers on a console are read, not watched — so the count is short (≈1.1s),
 * eases out like everything else, and respects reduced motion by sitting at
 * its final value immediately.
 */
export default function CountUp({ to, duration = 1.1, pad = 0, suffix = '', className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduced = useReducedMotion()
  const [val, setVal] = useState(() => (reduced ? to : 0))

  useEffect(() => {
    if (!inView || reduced) return
    let raf
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * to))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced, to, duration])

  const shown = pad ? String(val).padStart(pad, '0') : String(val)
  return (
    <span ref={ref} className={className}>
      {shown}
      {suffix}
    </span>
  )
}