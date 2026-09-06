import clsx from 'clsx'
import { vcrStages } from '../../data/experimentData.js'
import { useLabStore } from '../../store/labStore.js'

/**
 * The left rail's living circuit.
 *
 * One continuous pipe runs the height of the column, coloured by the gauge-
 * manifold convention — discharge red out of the compressor, copper through the
 * capillary, suction blue back to it — with the four stages hanging off it as
 * leader-line callouts. A slug of refrigerant travels the pipe at the live
 * flowSpeed, and only while the compressor is running: it stops dead the
 * instant the thermostat cuts out, which makes the rail a state display, not
 * a screensaver.
 */

const ROW_H = 68
const PAD = 10
const PIPE_X = 17
const TOP = 26
const BOTTOM = 266
const LEADER_X = 34

const TONE = {
  compressor: '#d2452c',
  condenser: '#d2452c',
  expansionValve: '#c48a4a',
  evaporator: '#4fa8c4',
}

export default function CircuitRail() {
  const selected = useLabStore((s) => s.selectedComponent)
  const compressorOn = useLabStore((s) => s.compressorOn)
  const flowSpeed = useLabStore((s) => s.flowSpeed)
  const select = useLabStore((s) => s.selectComponent)

  const jy = (i) => PAD + ROW_H / 2 + i * ROW_H

  return (
    <div className="relative h-[296px] w-[233px]">
      <svg
        viewBox="0 0 233 296"
        className="pointer-events-none absolute left-0 top-0 h-[296px] w-[233px]"
        aria-hidden="true"
      >
        {/* ---- The pipe, one segment per side of the circuit ---- */}
        <g fill="none" strokeWidth="4" strokeLinecap="round">
          {/* suction return into the compressor (4 → 1) */}
          <path d={`M${PIPE_X} ${TOP}V${jy(0)}`} stroke={TONE.evaporator} />
          {/* discharge and liquid line (1 → 2 → 3): one run, always high side */}
          <path d={`M${PIPE_X} ${jy(0)}V${jy(2)}`} stroke={TONE.compressor} />
          {/* through the capillary (3 → 4) */}
          <path d={`M${PIPE_X} ${jy(2)}V${jy(3)}`} stroke={TONE.expansionValve} />
          {/* out of the evaporator, back to the top */}
          <path d={`M${PIPE_X} ${jy(3)}V${BOTTOM}`} stroke={TONE.evaporator} />
        </g>
        {/* flow direction at the top of the rail: into the compressor */}
        <path
          d={`M${PIPE_X - 4} 23 ${PIPE_X} 17 ${PIPE_X + 4} 23`}
          fill="none"
          stroke={TONE.evaporator}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ---- The slug: one dash, one long gap, travelling at flowSpeed ---- */}
        <path
          d={`M${PIPE_X} ${TOP}V${BOTTOM - 2}`}
          fill="none"
          stroke="#b9d3d6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="10 230"
          className="animate-slug"
          style={{
            animationDuration: `${2.4 / flowSpeed}s`,
            animationPlayState: compressorOn ? 'running' : 'paused',
          }}
        />

        {/* ---- State points and leader lines ---- */}
        {vcrStages.map((st, i) => {
          const active = selected === st.id
          const y = jy(i)
          return (
            <g key={st.id}>
              <line
                x1={PIPE_X + 7}
                y1={y}
                x2={LEADER_X}
                y2={y}
                stroke={TONE[st.id]}
                strokeWidth="1.5"
                opacity={active ? 1 : 0.45}
              />
              <circle
                cx={PIPE_X}
                cy={y}
                r="7.5"
                fill={active ? TONE[st.id] : '#121815'}
                stroke={TONE[st.id]}
                strokeWidth="2"
              />
              <text
                x={PIPE_X}
                y={y + 3}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize="8.5"
                fontWeight="600"
                fill={active ? '#121815' : '#e8ebe4'}
              >
                {st.step}
              </text>
            </g>
          )
        })}
      </svg>

      {/* ---- The four processes as real buttons over the schematic ---- */}
      {vcrStages.map((st, i) => {
        const active = selected === st.id
        return (
          <button
            key={st.id}
            onClick={() => select(active ? null : st.id)}
            aria-pressed={active}
            className="group absolute inset-x-0 flex flex-col justify-center pl-[42px] pr-1 text-left"
            style={{ top: PAD + i * ROW_H, height: ROW_H }}
          >
            <span
              className={clsx(
                'text-[12.5px] font-semibold',
                active ? 'text-lab-copper' : 'text-lab-enamel group-hover:text-lab-frost'
              )}
            >
              {st.name}
            </span>
            <span className="mt-0.5 text-[10.5px] leading-tight text-lab-muted">
              {st.component}
            </span>
            <span className="lab-readout mt-0.5 text-[9.5px] text-lab-muted">{st.process}</span>
          </button>
        )
      })}
    </div>
  )
}
