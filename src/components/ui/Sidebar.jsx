import clsx from 'clsx'
import CircuitRail from './CircuitRail.jsx'
import { useLabStore } from '../../store/labStore.js'

/** Left-hand information rail: the living circuit, the frost gauge, the log. */
export default function Sidebar() {
  const isDefrosting = useLabStore((s) => s.isDefrosting)
  const frost = useLabStore((s) => s.frostThickness)
  const thermostatSetting = useLabStore((s) => s.thermostatSetting)
  const lastEvent = useLabStore((s) => s.lastEvent)

  return (
    <aside className="flex w-[266px] shrink-0 flex-col overflow-y-auto border-r border-lab-border bg-lab-panel">
      <div className="lab-section">
        <h2 className="lab-label">Vapour compression cycle</h2>
        <p className="mt-2 text-[11px] leading-relaxed text-lab-muted">
          Click a process to focus that component in the 3D view.
        </p>
      </div>

      <div className="py-3 pl-4">
        <CircuitRail />
      </div>

      <div className="lab-section">
        <div className="flex items-center justify-between gap-2">
          <h2 className="lab-label">Frost on evaporator</h2>
          <span className="lab-readout text-[11px] text-lab-frost">
            {(frost * 6).toFixed(1)} mm
          </span>
        </div>
        <div className="frost-track relative mt-2.5">
          <div
            className={clsx('frost-fill transition-[width] duration-500', frost > 0.5 && 'animate-breathe')}
            style={{ width: `${Math.round(frost * 100)}%` }}
          />
          {/* The warm wash that melts the layer while a defrost runs */}
          {isDefrosting && <span className="frost-wash" />}
        </div>
        <div className="mt-1.5 flex justify-between text-[10px]">
          <span className="lab-readout text-lab-muted">{Math.round(frost * 100)} %</span>
          <span className={frost > 0.5 ? 'text-lab-copper' : 'text-lab-muted'}>
            {frost > 0.5 ? 'Defrosting recommended' : 'Within limits'}
          </span>
        </div>
      </div>

      <div className="lab-section mt-auto border-b-0">
        <div className="flex items-center justify-between gap-2">
          <h2 className="lab-label">Event log</h2>
          <span className="lab-readout text-[10px] text-lab-muted">
            cut-out at {thermostatSetting} °C
          </span>
        </div>
        <p
          key={lastEvent?.at}
          className="mt-2 animate-rise text-[11px] leading-relaxed text-lab-frost"
        >
          <span className="lab-readout">{lastEvent ? `› ${lastEvent.text}` : '› Idle — switch the supply ON to begin'}</span>
        </p>
      </div>
    </aside>
  )
}
