/**
 * Ambient life for the landing hero — the only decorative motion on the page.
 *
 * Two layers, both quiet: a cold glow that breathes behind the schematic like
 * the evaporator's presence, and a handful of frost motes rising off the coil.
 * Everything is opacity/transform only (compositor-friendly), and under
 * reduced motion the CSS guard in index.css stills the lot.
 */
const MOTES = [
  { left: '6%', size: 2, dur: 11, delay: 0 },
  { left: '18%', size: 3, dur: 14, delay: 2.5 },
  { left: '37%', size: 2, dur: 12.5, delay: 5 },
  { left: '58%', size: 2.5, dur: 13, delay: 1.2 },
  { left: '74%', size: 2, dur: 15, delay: 3.8 },
  { left: '88%', size: 3, dur: 11.5, delay: 6.4 },
  { left: '47%', size: 1.5, dur: 16, delay: 8 },
]

export default function FrostAmbient() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* The cold side, felt rather than seen */}
      <div className="absolute -top-28 left-1/2 h-56 w-3/4 -translate-x-1/2 rounded-full bg-lab-suction/10 blur-3xl animate-glowPulse" />
      {MOTES.map((m, i) => (
        <span
          key={i}
          className="frost-mote animate-drift"
          style={{
            left: m.left,
            width: m.size,
            height: m.size,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.delay}s`,
          }}
        />
      ))}
    </div>
  )
}