import { useId, useState } from 'react'
import clsx from 'clsx'

/** Lightweight hover/focus tooltip. `side` controls placement. */
export default function Tooltip({ label, children, side = 'top', className }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  const pos = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side]

  return (
    <span
      className={clsx('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      {open && (
        <span
          role="tooltip"
          id={id}
          className={clsx(
            'pointer-events-none absolute z-50 w-max max-w-[220px] rounded-inst border border-lab-border',
            'bg-lab-card px-2.5 py-1.5 text-[11px] leading-snug text-lab-enamel shadow-stage',
            'animate-rise',
            pos
          )}
        >
          {label}
        </span>
      )}
    </span>
  )
}
