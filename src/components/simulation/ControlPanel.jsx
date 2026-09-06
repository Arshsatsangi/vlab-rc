import clsx from 'clsx'
import { useLabStore, selectStatus, DIFFERENTIAL } from '../../store/labStore.js'
import ArLauncher from './ArLauncher.jsx'

const SPEEDS = [
  { v: 0.5, label: 'Slow', hint: '0.5×' },
  { v: 1, label: 'Normal', hint: '1×' },
  { v: 2, label: 'Fast', hint: '2×' },
]

const VIEWS = [
  { v: 'front', label: 'Front' },
  { v: 'side', label: 'Side' },
  { v: 'top', label: 'Top' },
  { v: '3d', label: '3D' },
  { v: 'rear', label: 'Rear' },
]

function Section({ title, right, children }) {
  return (
    <section className="lab-section">
      <div className="flex items-center justify-between gap-2">
        <h3 className="lab-label">{title}</h3>
        {right}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Check({ label, checked, onChange, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-lab-blue"
      />
      <span className="leading-tight">
        <span className="text-[12.5px] text-lab-text">{label}</span>
        {hint && <span className="block text-[10.5px] text-lab-muted">{hint}</span>}
      </span>
    </label>
  )
}

export default function ControlPanel({ onOpenTable, onReset, engineRef }) {
  const s = useLabStore()
  const status = selectStatus(s)
  const frostPct = Math.round(s.frostThickness * 100)

  return (
    <aside className="flex w-[288px] shrink-0 flex-col overflow-y-auto border-l border-lab-border bg-lab-panel shadow-lip">
      {/* ---- Power ---- */}
      <Section
        title="Power supply"
        right={
          <span
            className="lab-readout text-[11px] font-semibold"
            style={{ color: status.color }}
          >
            {status.label}
          </span>
        }
      >
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={s.startRefrigerator}
            disabled={s.isPowered}
            className={clsx('lab-btn', s.isPowered && 'lab-btn-active')}
          >
            ⏻ ON
          </button>
          <button
            onClick={s.stopRefrigerator}
            disabled={!s.isPowered}
            className={clsx('lab-btn', !s.isPowered && 'border-red-200 text-red-600')}
          >
            ⏼ OFF
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button onClick={s.toggleDoor} className={clsx('lab-btn', s.doorOpen && 'lab-btn-active')}>
            {s.doorOpen ? 'Close door' : 'Open door'}
          </button>
          <button onClick={onReset} className="lab-btn">
            ↻ Reset
          </button>
        </div>
      </Section>
      {/* ---- Thermostat ---- */}
      <Section
        title="Thermostat setting"
        right={<span className="lab-readout text-[11px] text-lab-cold">{s.thermostatSetting} °C</span>}
      >
        <input
          type="range"
          min={1}
          max={8}
          step={1}
          value={s.thermostatSetting}
          onChange={(e) => s.setThermostat(e.target.value)}
          className="w-full"
          aria-label="Thermostat setting in degrees Celsius"
        />
        <div className="mt-1 flex justify-between text-[10px] text-lab-muted">
          <span>1 — coldest</span>
          <span>8 — warmest</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="lab-card px-3 py-2">
            <div className="text-[10px] text-lab-muted">Cabinet now</div>
            <div className="lab-readout mt-0.5 text-lg font-semibold text-lab-text">
              {s.cabinetTemp.toFixed(1)} °C
            </div>
          </div>
          <div className="lab-card px-3 py-2">
            <div className="text-[10px] text-lab-muted">Cut-in at</div>
            <div className="lab-readout mt-0.5 text-lg font-semibold text-lab-amber">
              {s.thermostatSetting + DIFFERENTIAL} °C
            </div>
          </div>
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-lab-muted">
          Cut-out {s.thermostatSetting} °C · differential {DIFFERENTIAL} °C · completed cycles{' '}
          {s.cycleCount}
        </p>
      </Section>

      {/* ---- Defrost ---- */}
      <Section
        title="Defrost"
        right={
          <span
            className={clsx(
              'lab-readout text-[11px]',
              frostPct > 50 ? 'text-lab-hot' : 'text-lab-cold'
            )}
          >
            {frostPct}%
          </span>
        }
      >
        <div className="grid grid-cols-2 gap-2">
          {['manual', 'timer'].map((m) => (
            <button
              key={m}
              onClick={() => s.setDefrostMode(m)}
              className={clsx('lab-btn capitalize', s.defrostMode === m && 'lab-btn-active')}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={s.startDefrost}
          disabled={s.isDefrosting || !s.isPowered}
          className={clsx('lab-btn mt-2 w-full', s.isDefrosting && 'lab-btn-active')}
        >
          {s.isDefrosting
            ? `Defrosting… ${Math.round(s.defrostProgress * 100)}%`
            : '❄ Start Defrost'}
        </button>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-lab-muted">
            <span>Frost on evaporator</span>
            <span className="lab-readout">{(s.frostThickness * 6).toFixed(1)} mm</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-lab-card">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                s.frostThickness > 1 - 1e-6
                  ? 'bg-lab-hot animate-pulse'
                  : s.frostThickness > 0.5
                    ? 'bg-lab-hot'
                    : 'bg-lab-cold'
              )}
              style={{ width: `${frostPct}%` }}
            />
          </div>
          {s.frostThickness > 0.5 && (
            <p className="mt-1.5 text-[10.5px] text-lab-hot">
              Frost is insulating the coil — efficiency is falling. Run a defrost cycle.
            </p>
          )}
          {s.defrostMode === 'timer' && (
            <p className="mt-1.5 text-[10.5px] text-lab-muted">
              Timer mode: a defrost is triggered automatically after every 2 minutes of compressor
              run once frost appears.
            </p>
          )}
        </div>
      </Section>

      {/* ---- Flow speed ---- */}
      <Section title="Refrigerant flow speed">
        <div className="grid grid-cols-3 gap-2">
          {SPEEDS.map((sp) => (
            <button
              key={sp.v}
              onClick={() => s.setFlowSpeed(sp.v)}
              className={clsx('lab-btn !px-1', s.flowSpeed === sp.v && 'lab-btn-active')}
            >
              <span className="block text-[11.5px]">{sp.label}</span>
              <span className="block font-mono text-[9.5px] text-lab-muted">{sp.hint}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ---- Visual options ---- */}
      <Section title="Visual options">
        <Check
          label="Show labels"
          checked={s.showLabels}
          onChange={s.setShowLabels}
          hint="Component name tags in the 3D view"
        />
        <Check
          label="Show refrigerant flow"
          checked={s.showFlow}
          onChange={s.setShowFlow}
          hint="Animated particles: red = high pressure, blue = low"
        />
        <Check
          label="X-Ray view"
          checked={s.xrayView}
          onChange={s.setXray}
          hint="Make the cabinet translucent"
        />
        <Check
          label="Exploded view"
          checked={s.explodedView}
          onChange={s.setExploded}
          hint="Separate the components to see the layout"
        />
      </Section>

      {/* ---- Camera ---- */}
      {/* A preset means the same view in both modes: in the lab the camera flies
          to it, in AR the unit turns to face the viewer. So the buttons stay live
          inside AR — only the highlight drops, once the unit is turned by hand. */}
      <Section
        title="Camera"
        right={
          s.viewCustom && (
            <span className="lab-readout text-[11px] text-lab-muted">Custom</span>
          )
        }
      >
        <div className="grid grid-cols-3 gap-2">
          {VIEWS.map((v) => (
            <button
              key={v.v}
              onClick={() => s.setViewPreset(v.v)}
              title={s.arActive ? `Turn the unit to the ${v.label} view` : undefined}
              className={clsx(
                'lab-btn !px-1 text-[11.5px]',
                s.viewPreset === v.v && !s.viewCustom && 'lab-btn-active'
              )}
            >
              {v.label}
            </button>
          ))}
          {/* Sixth cell of the same grid — no new row, no restyling */}
          <ArLauncher engineRef={engineRef} />
        </div>
        {s.arActive && (
          <p className="mt-2 text-[10.5px] leading-snug text-lab-muted">
            {s.arStatus || 'AR is running — the simulation keeps ticking.'}
          </p>
        )}
      </Section>

      {/* ---- Lab record ---- */}
      <Section
        title="Lab record"
        right={<span className="lab-readout text-[11px] text-lab-muted">{s.observations.length}</span>}
      >
        <div className="grid gap-2">
          <button
            onClick={s.recordReading}
            disabled={!s.isPowered}
            title={
              s.isPowered
                ? 'Record the present readings into the observation table'
                : 'Switch the supply ON to record readings'
            }
            className={`lab-btn ${s.isPowered ? 'lab-btn-active' : ''}`}
          >
            ✚ Record Reading
          </button>
          <button onClick={onOpenTable} className="lab-btn">
            📋 Observation Table
          </button>
          {!s.isPowered && (
            <p className="text-[10.5px] leading-snug text-lab-muted">
              Readings can only be taken while the supply is ON.
            </p>
          )}
        </div>
      </Section>
    </aside>
  )
}
