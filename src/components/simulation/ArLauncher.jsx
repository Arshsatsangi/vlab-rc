import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useLabStore } from '../../store/labStore.js'
import { detectArTier } from '../../ar/capability.js'
import { requestOrientationPermission } from '../../ar/deviceOrientation.js'
import { arDom } from '../../ar/domSlots.js'

/**
 * The AR entry point — one button that fills the sixth cell of the Camera grid.
 *
 * Capability detection runs once, when the browser is idle, and is cached in the
 * store, so the button can name the mode it will actually start ("Room AR",
 * "Marker AR", "Webcam AR") instead of promising AR and failing. Where no mode
 * is possible the button is disabled and its tooltip says why.
 *
 * The controller is imported dynamically: a laptop that never taps AR should not
 * download the tracker, the pose solver or the USDZ exporter.
 */
export default function ArLauncher({ engineRef }) {
  const capability = useLabStore((s) => s.arCapability)
  const setArCapability = useLabStore((s) => s.setArCapability)
  const arActive = useLabStore((s) => s.arActive)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (capability) return
    let cancelled = false
    const run = () => {
      detectArTier().then((cap) => {
        if (!cancelled) setArCapability(cap)
      })
    }
    // Detection is cheap but it touches navigator.xr, so keep it off first paint
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(run, { timeout: 1200 })
      : window.setTimeout(run, 400)
    return () => {
      cancelled = true
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [capability, setArCapability])

  const tier = capability?.tier ?? null
  const unavailable = tier === 'none'
  const label = arActive ? 'Exit AR' : busy ? 'AR…' : 'AR'

  const title = arActive
    ? 'Leave AR and return to the lab view'
    : !capability
      ? 'Checking what this device supports…'
      : unavailable
        ? `AR unavailable — ${capability.reason}`
        : `${capability.label} — ${capability.hint}`

  async function onClick() {
    const store = useLabStore.getState()
    if (arActive) {
      store.exitAr()
      return
    }
    if (!tier || unavailable || busy) return

    // iOS gates the motion sensors behind a prompt that only opens from a real
    // gesture, so it has to be asked for here and not after the first await.
    requestOrientationPermission()

    setBusy(true)
    store.enterAr(tier)
    try {
      const { startAr } = await import('../../ar/arController.js')
      const result = await startAr({
        engine: engineRef?.current,
        tier,
        videoLayer: arDom.videoLayer,
        hudRoot: arDom.hudRoot,
      })
      if (!result.ok) {
        store.exitAr()
        store.setViewPreset('3d')
        store.notify(result.reason, 'warn')
      }
    } catch (err) {
      store.exitAr()
      store.notify(`AR failed to start — ${err?.message || 'unknown error'}`, 'warn')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={unavailable || busy || !capability}
      title={title}
      aria-pressed={arActive}
      className={clsx('lab-btn !px-1 text-[11.5px]', arActive && 'lab-btn-active')}
    >
      {label}
    </button>
  )
}
