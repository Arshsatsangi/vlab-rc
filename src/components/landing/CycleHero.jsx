/**
 * The vapour-compression schematic, in two presentations sharing one geometry.
 *
 * `hero` — the landing page's single orchestrated moment: the pipes draw
 * themselves in, the four components rise in circuit order, and then the
 * refrigerant starts circulating and never stops.
 *
 * `manual` — the same drawing at rest in the theory pages (VCRDiagram renders
 * this), with only the refrigerant itself moving.
 *
 * Colour is the gauge convention from tailwind.config.js: the low side is blue,
 * the high side red, the capillary copper. Node dots are stroked with the side
 * of the pipe they sit on.
 */

const SUCTION = '#4fa8c4'
const DISCHARGE = '#d2452c'
const COPPER = '#c48a4a'
const FROST = '#b9d3d6'

const BOX = { w: 168, h: 76, r: 3 }

/* The four pipes, drawn in the direction the refrigerant travels them. */
const PIPES = [
  { d: 'M242 338H518', tone: SUCTION, delay: 0 }, // 4 → 1  evaporator to compressor
  { d: 'M602 300V140', tone: DISCHARGE, delay: 0.18 }, // 1 → 2
  { d: 'M518 102H242', tone: DISCHARGE, delay: 0.36 }, // 2 → 3
  { d: 'M158 140V300', tone: SUCTION, delay: 0.54 }, // 3 → 4
]

/* The components, in circuit order — the order they rise in. */
const BOXES = [
  {
    id: 'evaporator',
    x: 74,
    y: 300,
    label: 'Evaporator',
    sub: 'Heat absorbed  Q₄₋₁',
    tone: SUCTION,
  },
  {
    id: 'compressor',
    x: 518,
    y: 300,
    label: 'Compressor',
    sub: 'Work input  W₁₋₂',
    tone: DISCHARGE,
  },
  {
    id: 'condenser',
    x: 518,
    y: 64,
    label: 'Condenser',
    sub: 'Heat rejected  Q₂₋₃',
    tone: DISCHARGE,
  },
  {
    id: 'expansionValve',
    x: 74,
    y: 64,
    label: 'Capillary tube',
    sub: 'Throttling  h₃ = h₄',
    tone: COPPER,
  },
]

const POINTS = [
  { n: '1', x: 470, y: 338, tone: SUCTION },
  { n: '2', x: 602, y: 176, tone: DISCHARGE },
  { n: '3', x: 290, y: 102, tone: DISCHARGE },
  { n: '4', x: 158, y: 264, tone: SUCTION },
]

export default function CycleHero({ variant = 'hero' }) {
  const drawing = variant === 'hero'
  /* Stagger for the component boxes, in circuit order. */
  const boxDelay = (id) => 0.55 + BOXES.findIndex((b) => b.id === id) * 0.15

  return (
    <svg
      viewBox="0 0 760 440"
      className="cycle-schematic h-auto w-full"
      role="img"
      aria-label="Vapour compression refrigeration cycle: evaporator to compressor to condenser to capillary tube and back to the evaporator"
    >
      <style>{`
        .lbl { font: 600 13px Archivo, 'Helvetica Neue', sans-serif; fill: #e8ebe4; }
        .sub { font: 10.5px 'IBM Plex Mono', monospace; fill: #8a9690; }
        .node { font: 600 11px 'IBM Plex Mono', monospace; fill: #e8ebe4; }
        .proc { font: 500 11px Archivo, 'Helvetica Neue', sans-serif; fill: #8a9690; letter-spacing: .02em; }
        @keyframes hero-draw-in { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes hero-march { to { stroke-dashoffset: -240; } }
        @keyframes hero-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes hero-box-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .cycle-schematic * { animation: none !important; }
        }
      `}</style>

      <defs>
        <marker id="arrowHot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={DISCHARGE} />
        </marker>
        <marker id="arrowCold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={SUCTION} />
        </marker>
      </defs>

      {/* ---- Circuit pipes: solid run under, travelling refrigerant over ---- */}
      <g fill="none" strokeWidth="5" strokeLinecap="round">
        {PIPES.map((p, i) => (
          <path
            key={`base-${i}`}
            d={p.d}
            stroke={p.tone}
            pathLength="1"
            strokeDasharray={drawing ? 1 : undefined}
            style={
              drawing
                ? { animation: `hero-draw-in 0.45s cubic-bezier(0.65,0,0.35,1) ${p.delay}s both` }
                : undefined
            }
          />
        ))}
        {PIPES.map((p, i) => (
          <path
            key={`flow-${i}`}
            d={p.d}
            stroke={FROST}
            opacity="0.9"
            strokeDasharray="10 230"
            style={{
              animation: drawing
                ? `hero-fade-in 0.5s ease 1.15s both, hero-march 2.4s linear infinite`
                : `hero-march 2.4s linear infinite`,
            }}
          />
        ))}
      </g>

      {/* ---- Process captions ---- */}
      <g className={drawing ? 'hero-late' : undefined} style={drawing ? { animation: 'hero-fade-in 0.5s ease 1.1s both' } : undefined}>
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
        <g stroke={DISCHARGE} strokeWidth="2.5" markerEnd="url(#arrowHot)">
          <path d="M686 84h44" />
          <path d="M686 120h44" />
        </g>
        <text className="sub" x="700" y="150">
          heat to room
        </text>

        <g stroke={SUCTION} strokeWidth="2.5" markerEnd="url(#arrowCold)">
          <path d="M18 322H68" />
          <path d="M18 354H68" />
        </g>
        <text className="sub" x="18" y="386">
          heat from cabinet
        </text>

        {/* ---- State points, stroked with the side they sit on ---- */}
        {POINTS.map((p) => (
          <g key={p.n}>
            <circle cx={p.x} cy={p.y} r="13" fill="#121815" stroke={p.tone} strokeWidth="2" />
            <text className="node" x={p.x} y={p.y + 4} textAnchor="middle">
              {p.n}
            </text>
          </g>
        ))}

        {/* ---- Pressure split ---- */}
        <line x1="24" y1="220" x2="736" y2="220" stroke="#2c3831" strokeWidth="1.5" strokeDasharray="6 8" />
        <text className="sub" x="736" y="210" textAnchor="end">
          high pressure side — above
        </text>
        <text className="sub" x="736" y="238" textAnchor="end">
          low pressure side — below
        </text>
      </g>

      {/* ---- Component boxes, rising in circuit order ---- */}
      {BOXES.map((b) => (
        <g
          key={b.id}
          style={
            drawing
              ? { animation: `hero-box-in 0.5s cubic-bezier(0.2,0.7,0.3,1) ${boxDelay(b.id)}s both` }
              : undefined
          }
        >
          <rect
            x={b.x}
            y={b.y}
            width={BOX.w}
            height={BOX.h}
            rx={BOX.r}
            fill={`${b.tone}1f`}
            stroke={b.tone}
            strokeWidth="2"
          />
          <text className="lbl" x={b.x + BOX.w / 2} y={b.y + 32} textAnchor="middle">
            {b.label}
          </text>
          <text className="sub" x={b.x + BOX.w / 2} y={b.y + 54} textAnchor="middle">
            {b.sub}
          </text>
        </g>
      ))}
    </svg>
  )
}
