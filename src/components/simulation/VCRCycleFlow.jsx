import clsx from 'clsx'
import { useLabStore } from '../../store/labStore.js'

/**
 * On-canvas legend for the animated refrigerant flow: the four state points
 * with their live values, plus the high / low pressure colour key.
 */
export default function VCRCycleFlow() {
  const compressorOn = useLabStore((s) => s.compressorOn)
  const showFlow = useLabStore((s) => s.showFlow)
  const speed = useLabStore((s) => s.flowSpeed)
  const suction = useLabStore((s) => s.suctionTemp)
  const condenser = useLabStore((s) => s.condenserTemp)
  const evaporator = useLabStore((s) => s.evaporatorTemp)
  const select = useLabStore((s) => s.selectComponent)

  if (!showFlow) return null

  const points = [
    { n: 1, name: 'Compressor in', part: 'compressor', t: suction, side: 'LP' },
    { n: 2, name: 'Condenser in', part: 'condenser', t: 70, side: 'HP' },
    { n: 3, name: 'Capillary in', part: 'expansionValve', t: condenser, side: 'HP' },
    { n: 4, name: 'Evaporator in', part: 'evaporator', t: evaporator - 4, side: 'LP' },
  ]

  return (
    <div className="absolute bottom-4 left-4 w-[212px] rounded-xl border border-lab-border bg-lab-panel/85 p-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="lab-label">Refrigerant circuit</span>
        <span
          className={clsx(
            'lab-readout text-[10px]',
            compressorOn ? 'text-lab-green' : 'text-lab-muted'
          )}
        >
          {compressorOn ? `${speed}× flow` : 'halted'}
        </span>
      </div>

      <ul className="mt-2 space-y-1">
        {points.map((p) => (
          <li key={p.n}>
            <button
              onClick={() => select(p.part)}
              className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left transition-colors hover:bg-lab-card"
            >
              <span
                className={clsx(
                  'grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white',
                  p.side === 'HP' ? 'bg-lab-hot' : 'bg-lab-blue'
                )}
              >
                {p.n}
              </span>
              <span className="flex-1 truncate text-[10.5px] text-gray-300">{p.name}</span>
              <span className="lab-readout text-[10px] text-gray-400">{p.t.toFixed(0)} °C</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center gap-3 border-t border-lab-border/70 pt-2">
        <span className="flex items-center gap-1.5 text-[9.5px] text-gray-400">
          <span className="h-1.5 w-4 rounded-full bg-lab-hot" /> high pressure
        </span>
        <span className="flex items-center gap-1.5 text-[9.5px] text-gray-400">
          <span className="h-1.5 w-4 rounded-full bg-lab-blue" /> low pressure
        </span>
      </div>
    </div>
  )
}
