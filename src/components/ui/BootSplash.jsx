import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * The boot sequence — the machine powering up before the room is shown.
 *
 * The coil mark draws itself (pathLength), the nameplate fades in beneath it,
 * and a charge bar sweeps the way current moves down a live wire. One beat,
 * then the room is revealed as the splash lifts. Click or any key skips it;
 * reduced motion shortens the whole thing to a brief hold.
 */
export default function BootSplash({ onDone }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    const t = setTimeout(onDone, reduced ? 500 : 1650)
    const skip = () => onDone()
    window.addEventListener('keydown', skip)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', skip)
    }
  }, [onDone, reduced])

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-lab-bg"
      exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.2, 0.7, 0.3, 1] } }}
      onClick={onDone}
      role="presentation"
    >
      <div className="flex flex-col items-center gap-6">
        {/* The coil, drawing itself in — the same mark the navbar wears. */}
        <svg width="52" height="52" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          <motion.path
            d="M5 6h13a3.2 3.2 0 0 1 0 6.4H8a3.2 3.2 0 0 0 0 6.4h13"
            stroke="#4fa8c4"
            strokeWidth="1.7"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduced ? 0 : 1.1, ease: [0.65, 0, 0.35, 1] }}
          />
          <motion.path
            d="M13 21.5v3M11.6 22.6l2.8 1.8M14.4 22.6l-2.8 1.8"
            stroke="#b9d3d6"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 1.0, duration: 0.35 }}
          />
        </svg>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.45, duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
        >
          <p className="text-[15px] font-semibold tracking-tight text-lab-enamel">
            Virtual Refrigeration &amp; AC Lab
          </p>
          <p className="lab-readout mt-1.5 text-[11px] text-lab-muted">
            charging refrigerant circuit…
          </p>
        </motion.div>

        {/* The charge bar: current travelling a wire. */}
        <div className="h-px w-44 overflow-hidden bg-lab-border">
          <motion.div
            className="h-full w-1/3 bg-lab-copper"
            initial={{ x: '-120%' }}
            animate={{ x: reduced ? '220%' : ['-120%', '320%'] }}
            transition={
              reduced
                ? { duration: 0.4 }
                : { duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }
            }
          />
        </div>

        <p className="lab-readout text-[9.5px] tracking-wide text-lab-muted/60">
          click or press any key to enter
        </p>
      </div>
    </motion.div>
  )
}