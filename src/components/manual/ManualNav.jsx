import clsx from 'clsx'

/** Progress bar + page stepper shown at the top of the digital lab manual. */
export default function ManualNav({ pages, index, onSelect, onPrev, onNext }) {
  const pct = ((index + 1) / pages.length) * 100

  return (
    <div className="shrink-0 border-b border-lab-border bg-lab-panel/70 backdrop-blur">
      <div className="h-1 w-full bg-lab-card">
        <div
          className="h-full bg-gradient-to-r from-lab-blue to-lab-cold transition-[width] duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={pages.length}
          aria-label="Manual progress"
        />
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <ol className="flex flex-1 flex-wrap items-center gap-1.5">
          {pages.map((p, i) => (
            <li key={p.id}>
              <button
                onClick={() => onSelect(i)}
                aria-current={i === index ? 'step' : undefined}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] transition-colors',
                  i === index
                    ? 'bg-lab-blue/20 text-white ring-1 ring-lab-blue/60'
                    : i < index
                      ? 'text-lab-cold hover:bg-lab-card'
                      : 'text-lab-muted hover:bg-lab-card hover:text-gray-300'
                )}
              >
                <span
                  className={clsx(
                    'grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold',
                    i === index
                      ? 'bg-lab-blue text-white'
                      : i < index
                        ? 'bg-lab-cold/25 text-lab-cold'
                        : 'bg-lab-card text-lab-muted'
                  )}
                >
                  {i < index ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-2">
          <span className="lab-readout hidden text-[11px] text-lab-muted sm:inline">
            Page {index + 1} / {pages.length}
          </span>
          <button onClick={onPrev} disabled={index === 0} className="lab-btn">
            ← Back
          </button>
          <button
            onClick={onNext}
            disabled={index === pages.length - 1}
            className="lab-btn lab-btn-active"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
