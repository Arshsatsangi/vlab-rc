import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

/**
 * One instrument readout.
 *
 * The value's tint is the gauge-manifold convention, not decoration: `side`
 * states which side of the circuit the number belongs to — `suction` (blue,
 * low) or `discharge` (red, high); `copper` for the throttling step, `frost`
 * for the evaporator skin, and nothing for values that belong to neither side.
 *
 * `pulse` is a *threshold signal*, not the raw value: the parent bumps it only
 * when a reading crosses a line worth acknowledging, and the digits rise once —
 * never on every 10 Hz tick of the simulation.
 */
const SIDES = {
  suction: 'text-lab-suction',
  discharge: 'text-lab-discharge',
  copper: 'text-lab-copper',
  frost: 'text-lab-frost',
}

const SIZES = {
  sm: 'text-[13px]',
  md: 'text-[15px]',
  lg: 'text-lg',
}

export default function Readout({
  label,
  value,
  unit,
  side,
  sub,
  pulse,
  size = 'md',
  className,
}) {
  const tone = SIDES[side] || 'text-lab-enamel'
  const [kick, setKick] = useState(0)
  const prev = useRef(pulse)

  useEffect(() => {
    if (pulse !== undefined && pulse !== prev.current) {
      prev.current = pulse
      setKick((k) => k + 1)
    }
  }, [pulse])

  return (
    <div className={clsx('min-w-0', className)}>
      {label && <div className="truncate text-[10px] text-lab-muted">{label}</div>}
      <div className="flex items-baseline gap-1">
        <span
          key={kick}
          className={clsx(
            'lab-readout font-semibold tabular-nums',
            SIZES[size],
            tone,
            kick > 0 && 'animate-tick'
          )}
        >
          {value}
        </span>
        {unit && <span className="text-[10px] text-lab-muted">{unit}</span>}
      </div>
      {sub && <div className="truncate text-[9.5px] text-lab-muted">{sub}</div>}
    </div>
  )
}

/* The palettes now live in src/theme/tone.js, so the store can read them too.
   Re-exported here because this is where callers already look for them. */
export { STATUS_TONE, statusTone, SIDE } from '../../theme/tone.js'
