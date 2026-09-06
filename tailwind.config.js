/** @type {import('tailwindcss').Config} */

/**
 * Palette: the gauge-manifold convention.
 *
 * A refrigeration service technician reads a system through a two-gauge manifold —
 * blue for the low (suction) side, red for the high (discharge) side. Every colour
 * here states which side of the circuit a value belongs to, so the tint on a number
 * is information rather than decoration. Copper is the tubing itself, and stands for
 * the throttling step where the refrigerant is neither one thing nor the other.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lab: {
          // --- surfaces: a machine room, zinc-green rather than blue-grey ---
          plant: '#121815',
          bg: '#121815',
          panel: '#1a211d',
          card: '#212a25',
          border: '#2c3831',
          // --- ink ---
          enamel: '#e8ebe4',
          text: '#e8ebe4',
          muted: '#8a9690',
          // --- the manifold ---
          suction: '#4fa8c4',
          discharge: '#d2452c',
          copper: '#c48a4a',
          frost: '#b9d3d6',
          // legacy aliases, so a class written before the redesign still resolves
          blue: '#4fa8c4',
          cold: '#4fa8c4',
          hot: '#d2452c',
          amber: '#c48a4a',
          green: '#7ba870',
        },
      },
      fontFamily: {
        sans: ['Archivo', 'Helvetica Neue', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      /** Three radii, each meaning something: instrument, control, floating. */
      borderRadius: {
        inst: '2px',
        ctl: '6px',
        float: '12px',
      },
      boxShadow: {
        // Elevation is sheet metal catching light along its top edge, not a drop shadow.
        lip: 'inset 0 1px 0 rgba(232,235,228,0.07)',
        stage: '0 24px 60px -24px rgba(0,0,0,0.8)',
        gauge: '0 0 0 1px rgba(79,168,196,0.35), 0 0 18px -6px rgba(79,168,196,0.5)',
        // A live copper terminal, and the cold glow of a frosting coil.
        copperGlow: '0 0 22px -6px rgba(196, 138, 74, 0.55), 0 0 0 1px rgba(196, 138, 74, 0.28)',
        frostGlow: '0 0 18px -4px rgba(185, 211, 214, 0.5)',
      },
      keyframes: {
        // A slug of refrigerant travelling a pipe: one short dash in a long gap.
        slug: { to: { strokeDashoffset: '-240' } },
        // Schematic drawing itself in on the landing page.
        draw: { to: { strokeDashoffset: '0' } },
        // One pass of light across a chip when the thermostat changes state.
        sweep: { from: { transform: 'translateX(-110%)' }, to: { transform: 'translateX(210%)' } },
        // A readout acknowledging that it crossed a threshold.
        tick: {
          '0%': { transform: 'translateY(3px)', opacity: '0.35' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        // A frost mote rising off the evaporator: slow, faint, gone.
        drift: {
          '0%': { transform: 'translate3d(0,0,0)', opacity: '0' },
          '12%': { opacity: '0.55' },
          '80%': { opacity: '0.35' },
          '100%': { transform: 'translate3d(14px,-190px,0)', opacity: '0' },
        },
        // The cold side's presence, felt rather than seen.
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.85' },
        },
      },
      animation: {
        slug: 'slug 2.4s linear infinite',
        draw: 'draw 1s cubic-bezier(0.65,0,0.35,1) forwards',
        sweep: 'sweep 0.6s ease-out',
        tick: 'tick 0.12s ease-out',
        rise: 'rise 0.28s cubic-bezier(0.2,0.7,0.3,1) both',
        breathe: 'breathe 1.6s ease-in-out infinite',
        drift: 'drift 12s ease-in-out infinite',
        glowPulse: 'glowPulse 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
