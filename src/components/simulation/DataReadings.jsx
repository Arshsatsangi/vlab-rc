import clsx from 'clsx'
import { useLabStore, selectPower, selectRefrigerantState, selectStatus } from '../../store/labStore.js'

function Cell({ label, value, unit, tone = 'text-white', sub }) {
  return (
    <div className="min-w-0 flex-1 border-r border-lab-border/70 px-4 py-2 last:border-r-0">
      <div className="truncate text-[10px] uppercase tracking-wider text-lab-muted">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={clsx('lab-readout text-[15px] font-semibold', tone)}>{value}</span>
        {unit && <span className="text-[10px] text-lab-muted">{unit}</span>}
      </div>
      {sub && <div className="truncate text-[9.5px] text-lab-muted">{sub}</div>}
    </div>
  )
}

/** Bottom bar: the five live readings required by the observation table. */
export default function DataReadings() {
  const s = useLabStore()
  const status = selectStatus(s)
  const watts = selectPower(s)

  const mins = Math.floor(s.elapsed / 60)
  const secs = Math.floor(s.elapsed % 60)

  return (
    <div className="flex h-[68px] shrink-0 items-stretch overflow-x-auto border-t border-lab-border bg-lab-panel">
      <Cell
        label="Compressor inlet"
        value={s.suctionTemp.toFixed(1)}
        unit="°C"
        tone="text-lab-cold"
        sub="suction, 1.2 bar (L.P.)"
      />
      <Cell
        label="Condenser outlet"
        value={s.condenserTemp.toFixed(1)}
        unit="°C"
        tone="text-lab-hot"
        sub="liquid line, 12 bar (H.P.)"
      />
      <Cell
        label="Evaporator temp"
        value={s.evaporatorTemp.toFixed(1)}
        unit="°C"
        tone="text-lab-cold"
        sub="coil surface"
      />
      <Cell
        label="Cabinet temp"
        value={s.cabinetTemp.toFixed(1)}
        unit="°C"
        sub={`freezer ${s.freezerTemp.toFixed(1)} °C`}
      />
      <Cell
        label="Refrigerant state"
        value={selectRefrigerantState(s)}
        tone="text-[13px] text-lab-blue"
        sub={s.compressorOn ? 'circulating' : 'no circulation'}
      />
      <Cell
        label="Compressor"
        value={status.label}
        tone="text-[13px]"
        sub={`${watts} W · run ${Math.floor(s.runSeconds / 60)}m ${Math.floor(s.runSeconds % 60)}s`}
      />
      <Cell
        label="Elapsed"
        value={`${mins}:${String(secs).padStart(2, '0')}`}
        sub={`${s.observations.length} readings recorded`}
      />
    </div>
  )
}
