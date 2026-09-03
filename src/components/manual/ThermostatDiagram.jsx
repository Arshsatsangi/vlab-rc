import { thermostatInfo } from '../../data/experimentData.js'

const X0 = 62
const Y = (t) => 240 - t * 20 // 0 °C → y=240, 10 °C → y=40
const RUN = 88 // px of compressor-running (falling) segment
const IDLE = 88 // px of idle (rising) segment

/** Cabinet temperature against time, showing thermostat cut-in / cut-out. */
export default function ThermostatDiagram() {
  const { cutIn, cutOut } = thermostatInfo
  const on = []
  const off = []
  let x = X0
  for (let i = 0; i < 4; i++) {
    on.push(`M${x} ${Y(cutIn)} L${x + RUN} ${Y(cutOut)}`)
    x += RUN
    off.push(`M${x} ${Y(cutOut)} L${x + IDLE} ${Y(cutIn)}`)
    x += IDLE
  }

  return (
    <svg
      viewBox="0 0 760 300"
      className="h-auto w-full"
      role="img"
      aria-label="Graph of cabinet temperature against time showing the compressor cutting out at 2 degrees and cutting in at 8 degrees Celsius"
    >
      <style>{`
        .ax { stroke: #374151; stroke-width: 1.5; }
        .gl { stroke: #1f2937; stroke-width: 1; }
        .tx { font: 11px 'JetBrains Mono', monospace; fill: #9ca3af; }
        .tg { font: 600 11px Inter, sans-serif; }
      `}</style>

      {/* grid */}
      {[0, 2, 4, 6, 8, 10].map((t) => (
        <g key={t}>
          <line className="gl" x1={X0} y1={Y(t)} x2={730} y2={Y(t)} />
          <text className="tx" x={X0 - 10} y={Y(t) + 4} textAnchor="end">
            {t}
          </text>
        </g>
      ))}

      {/* cut-in / cut-out bands */}
      <line
        x1={X0}
        y1={Y(cutIn)}
        x2={730}
        y2={Y(cutIn)}
        stroke="#f59e0b"
        strokeWidth="1.8"
        strokeDasharray="7 6"
      />
      <line
        x1={X0}
        y1={Y(cutOut)}
        x2={730}
        y2={Y(cutOut)}
        stroke="#06b6d4"
        strokeWidth="1.8"
        strokeDasharray="7 6"
      />

      <text className="tx tg" x={736} y={Y(cutIn) + 4} fill="#f59e0b" textAnchor="end">
        CUT-IN {cutIn} °C
      </text>
      <text className="tx tg" x={736} y={Y(cutOut) - 8} fill="#06b6d4" textAnchor="end">
        CUT-OUT {cutOut} °C
      </text>

      {/* differential bracket */}
      <line x1={44} y1={Y(cutIn)} x2={44} y2={Y(cutOut)} stroke="#3b82f6" strokeWidth="1.6" />
      <text
        className="tx tg"
        x={40}
        y={(Y(cutIn) + Y(cutOut)) / 2}
        fill="#3b82f6"
        textAnchor="middle"
        transform={`rotate(-90 40 ${(Y(cutIn) + Y(cutOut)) / 2})`}
      >
        differential {thermostatInfo.differential} °C
      </text>

      {/* sawtooth */}
      {on.map((d, i) => (
        <path key={`on${i}`} d={d} fill="none" stroke="#22c55e" strokeWidth="3.5" />
      ))}
      {off.map((d, i) => (
        <path key={`off${i}`} d={d} fill="none" stroke="#f59e0b" strokeWidth="3.5" />
      ))}

      {/* axes */}
      <line className="ax" x1={X0} y1={40} x2={X0} y2={262} />
      <line className="ax" x1={X0} y1={262} x2={730} y2={262} />
      <text className="tx" x={X0} y={284}>
        time →
      </text>
      <text className="tx" x={20} y={34}>
        °C
      </text>

      {/* legend */}
      <g>
        <rect x={470} y={22} width="12" height="4" fill="#22c55e" />
        <text className="tx" x={490} y={29}>
          compressor ON (cooling)
        </text>
        <rect x={470} y={40} width="12" height="4" fill="#f59e0b" />
        <text className="tx" x={490} y={47}>
          compressor OFF (heat leak)
        </text>
      </g>
    </svg>
  )
}
