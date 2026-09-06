import { useEffect, useRef } from 'react'
import { componentInfo, componentOrder } from '../../data/componentInfo.js'
import { useLabStore } from '../../store/labStore.js'

/**
 * HTML labels pinned to the 3D components. The elements are registered with the
 * engine, which writes their transforms every frame — no React re-render.
 */
export default function ComponentLabels({ engineRef }) {
  const els = useRef({})
  const select = useLabStore((s) => s.selectComponent)
  const hover = useLabStore((s) => s.hoverComponent)

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    componentOrder.forEach((name) => engine.registerLabel(name, els.current[name]))
    return () => {
      const e = engineRef.current
      if (e) componentOrder.forEach((name) => e.registerLabel(name, null))
    }
  })

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {componentOrder.map((name) => {
        const info = componentInfo[name]
        return (
          <button
            key={name}
            data-label={name}
            ref={(el) => {
              els.current[name] = el
            }}
            onClick={() => select(name)}
            onMouseEnter={() => hover(name)}
            onMouseLeave={() => hover(null)}
            style={{ borderColor: `${info.accent}88`, opacity: 0, left: 0, top: 0 }}
            className="absolute flex items-center gap-1.5 whitespace-nowrap rounded-full border border-lab-border bg-lab-panel/90 px-2.5 py-1 text-[10.5px] font-semibold text-lab-text shadow-lip backdrop-blur transition-all duration-200 hover:bg-lab-card"
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: info.accent }} />
            {info.label}
          </button>
        )
      })}
    </div>
  )
}
