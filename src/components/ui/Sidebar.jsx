import clsx from 'clsx'
import { vcrStages } from '../../data/experimentData.js'
import { useLabStore } from '../../store/labStore.js'

/** Left-hand information rail: the four processes of the VCR cycle + event log. */
export default function Sidebar() {
  const selected = useLabStore((s) => s.selectedComponent)
  const compressorOn = useLabStore((s) => s.compressorOn)
  const isDefrosting = useLabStore((s) => s.isDefrosting)
  const frost = useLabStore((s) => s.frostThickness)
  const lastEvent = useLabStore((s) => s.lastEvent)
  const select = useLabStore((s) => s.selectComponent)

  return (
    <aside className="flex w-[266px] shrink-0 flex-col overflow-y-auto border-r border-lab-border bg-lab-panel">
      <div className="lab-section">
        <h2 className="lab-label">Vapour Compression Cycle</h2>
        <p className="mt-2 text-[11px] leading-relaxed text-lab-muted">
          Click a process to focus that component in the 3D view.
        </p>
      </div>

      <ol className="px-3 py-3">
        {vcrStages.map((st) => {
          const active = selected === st.id
          return (
            <li key={st.id}>
              <button
                onClick={() => select(active ? null : st.id)}
                aria-current={active ? 'true' : undefined}
                className={clsx(
                  'group mb-2 w-full rounded-lg border px-3 py-2.5 text-left transition-all',
                  active
                    ? 'border-lab-blue bg-lab-blue/15 shadow-glow'
                    : 'border-lab-border bg-lab-card hover:border-lab-blue/60'
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold',
                      active ? 'bg-lab-blue text-white' : 'bg-lab-border text-gray-300'
                    )}
                  >
                    {st.step}
                  </span>
                  <span className="text-xs font-semibold text-white">{st.name}</span>
                  {compressorOn && !isDefrosting && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-lab-green animate-pulse" />
                  )}
                </div>
                <div className="mt-1.5 pl-7 text-[11px] text-gray-400">{st.component}</div>
                <div className="mt-1 pl-7 font-mono text-[10px] text-lab-cold">{st.process}</div>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="lab-section mt-auto">
        <h2 className="lab-label">Frost on evaporator</h2>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-lab-card">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500',
              frost > 0.5 ? 'bg-lab-hot' : 'bg-lab-cold'
            )}
            style={{ width: `${Math.round(frost * 100)}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px]">
          <span className="lab-readout text-gray-300">{(frost * 6).toFixed(1)} mm</span>
          <span className={frost > 0.5 ? 'text-lab-hot' : 'text-lab-muted'}>
            {frost > 0.5 ? 'Defrosting recommended' : 'Within limits'}
          </span>
        </div>
      </div>

      <div className="lab-section border-b-0">
        <h2 className="lab-label">Event log</h2>
        <p
          key={lastEvent?.at}
          className="mt-2 animate-rise font-mono text-[11px] leading-relaxed text-gray-300"
        >
          {lastEvent ? `› ${lastEvent.text}` : '› Idle — switch the supply ON to begin'}
        </p>
      </div>
    </aside>
  )
}
