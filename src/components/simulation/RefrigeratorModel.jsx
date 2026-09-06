import { useState } from 'react'
import clsx from 'clsx'
import { useLabStore } from '../../store/labStore.js'
import { DIMS } from '../../three/refrigerator.js'

const construction = [
  ['Cabinet (W × H × D)', `${DIMS.w * 1000} × ${DIMS.h * 1000} × ${DIMS.d * 1000} mm`],
  ['Gross volume', '≈ 240 litres'],
  ['Insulation', 'Polyurethane foam (PUF), 50–60 mm'],
  ['Door seal', 'Magnetic gasket, self-closing'],
  ['Compartments', 'Freezer, fresh food (3 shelves), crisper'],
  ['Refrigerant', 'R-134a, hermetic sealed system'],
]

/**
 * Bottom-right card describing the cabinet itself — the part of the model that
 * is not in the refrigerant circuit — with the door and interior-lamp controls.
 */
export default function RefrigeratorModel() {
  const [open, setOpen] = useState(false)
  const doorOpen = useLabStore((s) => s.doorOpen)
  const toggleDoor = useLabStore((s) => s.toggleDoor)
  const isPowered = useLabStore((s) => s.isPowered)

  return (
    <div className="absolute bottom-4 right-4 w-[204px] rounded-float border border-lab-border bg-lab-panel/90 p-3 shadow-lip backdrop-blur">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2"
        aria-expanded={open}
      >
        <span className="lab-label">Cabinet</span>
        <span className="text-[10px] text-lab-muted">{open ? '▾ hide' : '▸ specs'}</span>
      </button>

      {open && (
        <dl className="mt-2 space-y-1.5 border-t border-lab-border/70 pt-2">
          {construction.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[9.5px] uppercase tracking-wide text-lab-muted">{k}</dt>
              <dd className="lab-readout text-[10.5px] text-lab-text">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <button
        onClick={toggleDoor}
        className={clsx('lab-btn mt-2 w-full !py-1.5 !text-[11.5px]', doorOpen && 'lab-btn-active')}
      >
        {doorOpen ? '🚪 Close door' : '🚪 Open door'}
      </button>
      <p className="mt-1.5 text-[9.5px] leading-relaxed text-lab-muted">
        {doorOpen
          ? isPowered
            ? 'Lamp ON · warm moist air entering — frost and running time increase.'
            : 'Lamp ON · supply is off.'
          : 'Door sealed by the magnetic gasket.'}
      </p>
    </div>
  )
}
