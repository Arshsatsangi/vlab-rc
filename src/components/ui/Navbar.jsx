import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import NavbarActions from './NavbarActions.jsx'

/**
 * The plant's nameplate and route switch.
 *
 * The mark is a drawn coil, not an emoji: three returns of tubing with a frost
 * tick, which is the same object the whole app is about. The active route is
 * marked by a copper underline that *slides* between tabs on a spring — one
 * physical tab travelling the rail rather than three separate bars. Non-active
 * tabs grow a quiet frost hairline on hover.
 */
function CoilMark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {/* evaporator serpentine — the cold side, so suction blue */}
      <path
        d="M5 6h13a3.2 3.2 0 0 1 0 6.4H8a3.2 3.2 0 0 0 0 6.4h13"
        stroke="#4fa8c4"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      {/* frost on the coil */}
      <path d="M13 21.5v3M11.6 22.6l2.8 1.8M14.4 22.6l-2.8 1.8" stroke="#b9d3d6" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Experiments' },
    { to: '/manual', label: 'Manual' },
    { to: '/simulation', label: 'Simulation' },
  ]

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-lab-border bg-lab-panel/90 px-4 shadow-lip backdrop-blur">
      <Link to="/" className="group flex items-center gap-2.5 rounded-ctl">
        {/* The coil tilts a few degrees when the nameplate is visited — a tiny
            acknowledgement, not a gimmick. */}
        <span className="transition-transform duration-300 ease-out group-hover:rotate-[8deg]">
          <CoilMark />
        </span>
        <span className="leading-tight">
          <span className="block text-[13px] font-semibold text-lab-enamel">
            Virtual Refrigeration &amp; AC Lab
          </span>
          <span className="block text-[10.5px] text-lab-muted">
            Experiment 1 — Household / Domestic Refrigerator
          </span>
        </span>
      </Link>

      <nav className="flex items-center gap-1" aria-label="Main">
        {links.map((l) => {
          const here = pathname === l.to
          return (
            <Link
              key={l.to}
              to={l.to}
              aria-current={here ? 'page' : undefined}
              className={clsx(
                'group relative px-3 py-[18px] text-[13px] transition-colors duration-150',
                here ? 'text-lab-copper' : 'text-lab-muted hover:text-lab-enamel'
              )}
            >
              {l.label}
              {here ? (
                <motion.span
                  layoutId="nav-live"
                  className="absolute inset-x-2 -bottom-px h-[2px] bg-lab-copper shadow-[0_0_10px_rgba(196,138,74,0.65)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  aria-hidden="true"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-0 h-[2px] origin-center scale-x-0 bg-lab-frost/30 transition-transform duration-200 ease-out group-hover:scale-x-100"
                />
              )}
            </Link>
          )
        })}
        <NavbarActions />
      </nav>
    </header>
  )
}
