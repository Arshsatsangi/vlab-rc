import { motion } from 'framer-motion'

/**
 * The chrome around every route: an opacity-only curtain (0.28s) so pages
 * cross-fade like the manual's own page turns. No transforms — the simulation
 * page mounts a three.js canvas, and transformed ancestors would fight both
 * its sizing and any fixed-position modals inside.
 */
export default function PageShell({ children }) {
  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.2, 0.7, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}