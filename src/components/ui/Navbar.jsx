import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'

export default function Navbar({ right = null }) {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Experiments' },
    { to: '/manual', label: 'Manual' },
    { to: '/simulation', label: 'Simulation' },
  ]

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-lab-border bg-lab-panel/80 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="text-xl" aria-hidden="true">
          🧊
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">Virtual Refrigeration &amp; AC Lab</div>
          <div className="text-[11px] text-lab-muted">
            Experiment 1 — Household / Domestic Refrigerator
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-1" aria-label="Main">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            aria-current={pathname === l.to ? 'page' : undefined}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-sm transition-colors',
              pathname === l.to
                ? 'bg-lab-blue/20 text-white ring-1 ring-lab-blue/60'
                : 'text-gray-400 hover:bg-lab-card hover:text-white'
            )}
          >
            {l.label}
          </Link>
        ))}
        {right}
      </nav>
    </header>
  )
}
