/**
 * Which AR mode this device can actually run.
 *
 * Detection is cheap and permission-free — it never opens the camera. It runs
 * once per page load and the answer is cached in the store, because it describes
 * the device rather than the experiment.
 *
 * Tiers, in descending order of fidelity:
 *   'xr'     — WebXR immersive-ar, real world tracking (Android Chrome, headsets)
 *   'marker' — printed target tracked through getUserMedia (iPhone / iPad Safari)
 *   'webcam' — camera feed as a backdrop, unit positioned by hand (laptops)
 *   'none'   — neither is available; `reason` explains why
 */

export const TIER_LABELS = {
  xr: 'Room AR',
  marker: 'Marker AR',
  webcam: 'Webcam AR',
  none: 'AR unavailable',
}

const TIER_HINTS = {
  xr: 'Point at the floor, then tap to place the refrigerator in your room',
  marker: 'Print the target sheet and point the camera at it',
  webcam: 'Composites the running unit over your webcam feed',
}

/** iPadOS 13+ reports itself as a Mac, so touch points are the only tell. */
export function isAppleDevice(nav = navigator) {
  const ua = nav.userAgent || ''
  if (/iPad|iPhone|iPod/.test(ua)) return true
  return /Mac/.test(ua) && (nav.maxTouchPoints || 0) > 1
}

/** True for iOS/iPadOS specifically — the platforms with no WebXR AR at all. */
export function isIos(nav = navigator) {
  const ua = nav.userAgent || ''
  if (/iPad|iPhone|iPod/.test(ua)) return true
  // iPad on iPadOS 13+ masquerading as macOS
  return /Macintosh/.test(ua) && (nav.maxTouchPoints || 0) > 1
}

/**
 * Resolve the best available tier.
 * @param {object} [env] injection point for the tests — `{ navigator, isSecureContext }`
 * @returns {Promise<{tier: string, label: string, hint: string, reason: string|null,
 *                    apple: boolean}>}
 */
export async function detectArTier(env = {}) {
  const nav = env.navigator || (typeof navigator !== 'undefined' ? navigator : {})
  const secure =
    env.isSecureContext !== undefined
      ? env.isSecureContext
      : typeof window !== 'undefined'
        ? window.isSecureContext
        : false
  const apple = isAppleDevice(nav)

  // ---- Tier 1: real WebXR ------------------------------------------------
  if (nav.xr && typeof nav.xr.isSessionSupported === 'function') {
    try {
      if (await nav.xr.isSessionSupported('immersive-ar')) {
        return { tier: 'xr', label: TIER_LABELS.xr, hint: TIER_HINTS.xr, reason: null, apple }
      }
    } catch {
      // isSessionSupported throws SecurityError in an insecure context — fall through
    }
  }

  // ---- Tiers 2 and 3: both need a camera in a secure context -------------
  const hasCamera = !!(nav.mediaDevices && typeof nav.mediaDevices.getUserMedia === 'function')
  if (!secure) {
    return {
      tier: 'none',
      label: TIER_LABELS.none,
      hint: '',
      reason: 'AR needs a secure context — open the lab over https:// or on localhost',
      apple,
    }
  }
  if (!hasCamera) {
    return {
      tier: 'none',
      label: TIER_LABELS.none,
      hint: '',
      reason: 'This browser exposes no camera API',
      apple,
    }
  }

  const tier = isIos(nav) ? 'marker' : 'webcam'
  return { tier, label: TIER_LABELS[tier], hint: TIER_HINTS[tier], reason: null, apple }
}

export default detectArTier
