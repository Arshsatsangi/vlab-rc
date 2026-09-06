import clsx from 'clsx'
import { useLabStore, selectStatus } from '../../store/labStore.js'
import { arDom } from '../../ar/domSlots.js'

/**
 * The WebGL viewport. The canvas element is owned by useThreeScene (in the page)
 * and passed in as a ref; everything here is HTML overlay chrome.
 */
export default function SceneCanvas({ canvasRef, ready, children }) {
  const status = useLabStore(selectStatus)
  const xray = useLabStore((s) => s.xrayView)
  const exploded = useLabStore((s) => s.explodedView)
  const doorOpen = useLabStore((s) => s.doorOpen)
  const isDefrosting = useLabStore((s) => s.isDefrosting)
  const arActive = useLabStore((s) => s.arActive)
  const arStatus = useLabStore((s) => s.arStatus)

  const badges = [
    // A visible reminder that the camera is open, so it is obvious when it closes
    arActive && 'AR live',
    xray && 'X-Ray',
    exploded && 'Exploded',
    doorOpen && 'Door open',
    isDefrosting && 'Defrost cycle',
  ].filter(Boolean)

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden bg-slate-50">
      {/* AR camera feed. Empty and invisible until a session mounts a <video>
          into it, and always behind the canvas, which clears transparent. */}
      <div
        ref={(el) => {
          arDom.videoLayer = el
        }}
        aria-hidden="true"
        className="absolute inset-0 z-0 overflow-hidden bg-slate-50"
        style={{ display: arActive ? 'block' : 'none' }}
      />
      {/* The canvas clears transparent, so the feed shows through it. Both layers
          sit at z-0 and paint in tree order; every overlay below is later in the
          tree and so still paints on top. */}
      <canvas
        ref={canvasRef}
        className="relative z-0 block h-full w-full touch-none outline-none"
      />

      {/* status chip */}
      <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-lab-border bg-lab-panel/90 px-3 py-1.5 shadow-lip backdrop-blur">
        <span
          className={clsx('h-2 w-2 rounded-full', status.label === 'Running' && 'animate-pulse')}
          style={{ backgroundColor: status.color }}
        />
        <span className="text-[11px] font-semibold text-lab-text">{status.label}</span>
      </div>

      {badges.length > 0 && (
        <div className="pointer-events-none absolute right-4 top-4 z-20 flex flex-wrap justify-end gap-1.5">
          {badges.map((b) => (
            <span
              key={b}
              className="rounded-full border border-lab-blue/50 bg-lab-blue/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-lab-blue backdrop-blur"
            >
              {b}
            </span>
          ))}
        </div>
      )}

      {children}
      {!ready && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-lab-border border-t-lab-blue" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-lab-muted">
              Building model…
            </p>
          </div>
        </div>
      )}

      {/* Hidden on narrow canvases, where the two overlay cards reach the centre */}
      <p className="pointer-events-none absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 text-[10.5px] text-lab-muted/80 xl:block">
        {arActive
          ? arStatus || 'AR running — the simulation keeps ticking'
          : 'drag to orbit · scroll to zoom · click a component to inspect'}
      </p>
    </div>
  )
}
