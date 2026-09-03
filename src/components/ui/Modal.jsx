import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Modal({ open, onClose, title, subtitle, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ scale: 0.94, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="lab-panel relative z-10 max-h-[85vh] w-full max-w-2xl overflow-hidden shadow-panel"
          >
            <div className="flex items-start justify-between gap-4 border-b border-lab-border px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs text-lab-muted">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-lab-muted transition-colors hover:bg-lab-card hover:text-white"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">{children}</div>
            {footer && <div className="border-t border-lab-border px-5 py-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
