const BOX = { w: 168, h: 76, r: 10 }

const boxes = [
  { id: 'evaporator', x: 74, y: 300, label: 'EVAPORATOR', sub: 'Heat absorbed  Q₄₋₁', tone: 'cold' },
  { id: 'compressor', x: 518, y: 300, label: 'COMPRESSOR', sub: 'Work input  W₁₋₂', tone: 'hot' },
  { id: 'condenser', x: 518, y: 64, label: 'CONDENSER', sub: 'Heat rejected  Q₂₋₃', tone: 'hot' },
  {
    id: 'expansionValve',
    x: 74,
    y: 64,
    label: 'CAPILLARY TUBE',
    sub: 'Throttling  h₃ = h₄',
    tone: 'mix',
  },
]

const TONE = {
  cold: { stroke: '#06b6d4', fill: 'rgba(6,182,212,0.12)' },
  hot: { stroke: '#ef4444', fill: 'rgba(239,68,68,0.12)' },
  mix: { stroke: '#b87333', fill: 'rgba(184,115,51,0.14)' },
}

/** Animated schematic of the vapour compression refrigeration cycle. */
export default function VCRDiagram() {
  return (
    <svg
      viewBox="0 0 760 440"
      className="h-auto w-full"
      role="img"
      aria-label="Vapour compression refrigeration cycle: evaporator to compressor to condenser to capillary tube and back to the evaporator"
    >
      <style>{`
        .flow { stroke-dasharray: 12 10; animation: dash 1.6s linear infinite; }
        @keyframes dash { to { stroke-dashoffset: -44; } }
        .pipe { fill: none; stroke-width: 5; stroke-linecap: round; }
        .lbl { font: 600 13px Inter, system-ui, sans-serif; fill: #f9fafb; letter-spacing: .06em; }
        .sub { font: 11px 'JetBrains Mono', monospace; fill: #9ca3af; }
        .node { font: 700 12px Inter, sans-serif; fill: #f9fafb; }
        .proc { font: 600 11px Inter, sans-serif; fill: #cbd5e1; letter-spacing: .04em; }
      `}</style>

      <defs>
        <marker id="arrowHot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#ef4444" />
        </marker>
        <marker id="arrowCold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#06b6d4" />
        </marker>
      </defs>

      {/* ---- Circuit pipes ---- */}
      <g>
        <path className="pipe" d="M242 338 H518" stroke="#06b6d4" markerEnd="url(#arrowCold)" />
        <path className="pipe flow" d="M242 338 H518" stroke="#7dd3fc" opacity="0.9" />

        <path className="pipe" d="M602 300 V140" stroke="#ef4444" markerEnd="url(#arrowHot)" />
        <path className="pipe flow" d="M602 300 V140" stroke="#fca5a5" opacity="0.9" />

        <path className="pipe" d="M518 102 H242" stroke="#ef4444" markerEnd="url(#arrowHot)" />
        <path className="pipe flow" d="M518 102 H242" stroke="#fdba74" opacity="0.9" />

        <path className="pipe" d="M158 140 V300" stroke="#06b6d4" markerEnd="url(#arrowCold)" />
        <path className="pipe flow" d="M158 140 V300" stroke="#7dd3fc" opacity="0.9" />
      </g>

      {/* ---- Process captions ---- */}
      <text className="proc" x="380" y="322" textAnchor="middle">
        4 → 1  Evaporation (L.P. vapour)
      </text>
      <text className="proc" x="618" y="224" textAnchor="start">
        1 → 2  Compression
      </text>
      <text className="proc" x="380" y="86" textAnchor="middle">
        2 → 3  Condensation (H.P. liquid)
      </text>
      <text className="proc" x="142" y="224" textAnchor="end">
        3 → 4  Throttling
      </text>

      {/* ---- Heat transfer arrows ---- */}
      <g stroke="#ef4444" strokeWidth="2.5" fill="none" markerEnd="url(#arrowHot)">
        <path d="M686 84 h44" />
        <path d="M686 120 h44" />
      </g>
      <text className="sub" x="700" y="150">
        heat to room
      </text>

      <g stroke="#06b6d4" strokeWidth="2.5" fill="none" markerEnd="url(#arrowCold)">
        <path d="M18 322 H68" />
        <path d="M18 354 H68" />
      </g>
      <text className="sub" x="18" y="386">
        heat from cabinet
      </text>

      {/* ---- Component boxes ---- */}
      {boxes.map((b) => {
        const tone = TONE[b.tone]
        return (
          <g key={b.id}>
            <rect
              x={b.x}
              y={b.y}
              width={BOX.w}
              height={BOX.h}
              rx={BOX.r}
              fill={tone.fill}
              stroke={tone.stroke}
              strokeWidth="2"
            />
            <text className="lbl" x={b.x + BOX.w / 2} y={b.y + 32} textAnchor="middle">
              {b.label}
            </text>
            <text className="sub" x={b.x + BOX.w / 2} y={b.y + 54} textAnchor="middle">
              {b.sub}
            </text>
          </g>
        )
      })}

      {/* ---- State points ---- */}
      {[
        { n: '1', x: 470, y: 338 },
        { n: '2', x: 602, y: 176 },
        { n: '3', x: 290, y: 102 },
        { n: '4', x: 158, y: 264 },
      ].map((p) => (
        <g key={p.n}>
          <circle cx={p.x} cy={p.y} r="13" fill="#111827" stroke="#3b82f6" strokeWidth="2" />
          <text className="node" x={p.x} y={p.y + 4} textAnchor="middle">
            {p.n}
          </text>
        </g>
      ))}

      {/* ---- Pressure split line ---- */}
      <line
        x1="24"
        y1="220"
        x2="736"
        y2="220"
        stroke="#374151"
        strokeWidth="1.5"
        strokeDasharray="6 8"
      />
      <text className="sub" x="736" y="212" textAnchor="end">
        high pressure side ▲   low pressure side ▼
      </text>
    </svg>
  )
}
