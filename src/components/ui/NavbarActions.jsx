import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Modal from './Modal.jsx'
import Icon from './Icon.jsx'
import { viva } from '../../data/componentInfo.js'

/**
 * The header's right-hand actions, resolved from the route.
 *
 * Lives inside the Navbar so the shell (and its sliding live-tab) can persist
 * across routes while the actions change with them: the manual offers the
 * simulation, the simulation offers the viva and a way back to the manual.
 * The viva dialog travels with its own button — one self-contained unit.
 */
export default function NavbarActions() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [vivaOpen, setVivaOpen] = useState(false)

  if (pathname === '/manual') {
    return (
      <button
        onClick={() => navigate('/simulation')}
        className="lab-btn lab-btn-active ml-2 !flex !items-center !gap-2 !py-1.5"
      >
        <Icon name="play" />
        Simulation
      </button>
    )
  }

  if (pathname === '/simulation') {
    return (
      <>
        <button
          onClick={() => setVivaOpen(true)}
          className="lab-btn ml-2 !flex !items-center !gap-2 !py-1.5"
        >
          <Icon name="target" />
          Viva
        </button>
        <Link to="/manual" className="lab-btn !flex !items-center !gap-2 !py-1.5">
          <Icon name="book" />
          Manual
        </Link>

        <Modal
          open={vivaOpen}
          onClose={() => setVivaOpen(false)}
          title="Viva Questions"
          subtitle="Expected questions for this experiment"
        >
          <ol className="space-y-3">
            {viva.map((v, i) => (
              <li key={i} className="lab-card px-4 py-3">
                <p className="text-[13px] font-semibold text-lab-text">
                  {i + 1}. {v.q}
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-lab-muted">{v.a}</p>
              </li>
            ))}
          </ol>
        </Modal>
      </>
    )
  }

  return null
}