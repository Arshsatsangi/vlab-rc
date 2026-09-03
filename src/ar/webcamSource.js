/**
 * The webcam feed that sits behind the transparent 3D canvas in Tier 3.
 *
 * This is deliberately the whole of the camera handling: the tracker in Tier 2
 * reads frames from the same video element, so there is one place that asks for
 * permission, one place that stops the track, and one place that turns a
 * getUserMedia rejection into a sentence a student can act on.
 */

/** getUserMedia rejects with a handful of well-known names — say what each means. */
export function describeCameraError(err) {
  const name = err?.name || ''
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Camera access was blocked — allow it in the address bar to use AR'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'No camera found on this device'
    case 'NotReadableError':
    case 'TrackStartError':
      return 'The camera is already in use by another app'
    case 'SecurityError':
      return 'AR needs a secure context — open the lab over https:// or on localhost'
    default:
      return err?.message ? `Camera unavailable — ${err.message}` : 'Camera unavailable'
  }
}

/** Wait for the first decoded frame so the feed never flashes black. */
function waitForFrame(video) {
  if (video.readyState >= 2) return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => {
      video.removeEventListener('loadeddata', done)
      resolve()
    }
    video.addEventListener('loadeddata', done)
    // A track that never produces data should not hang the launch
    setTimeout(done, 4000)
  })
}

/**
 * Open the camera and mount it as a full-bleed layer.
 *
 * @param {HTMLElement|null} layer element to mount the <video> into
 * @param {'environment'|'user'} facingMode rear camera on phones, only camera on laptops
 * @param {((reason: string) => void)|null} onLost called if the track dies mid-session
 * @returns {Promise<{video: HTMLVideoElement, stream: MediaStream, label: string, stop: () => void}>}
 */
export async function startWebcamSource({
  layer = null,
  facingMode = 'environment',
  onLost = null,
} = {}) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw Object.assign(new Error('This browser exposes no camera API'), { name: 'NotFoundError' })
  }

  const ideal = {
    audio: false,
    video: {
      facingMode: { ideal: facingMode },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  }

  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia(ideal)
  } catch (err) {
    // A laptop has no 'environment' camera; retry unconstrained before giving up
    if (err?.name === 'OverconstrainedError' || err?.name === 'NotFoundError') {
      stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true })
    } else {
      throw err
    }
  }

  const video = document.createElement('video')
  video.autoplay = true
  video.muted = true
  video.playsInline = true
  video.setAttribute('playsinline', '') // iOS Safari honours the attribute, not the property
  video.srcObject = stream
  // `cover` crops instead of letterboxing. Tier 3 is not world-tracked, so a
  // crop costs nothing and a black bar around the feed would look broken.
  video.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000'

  if (layer) layer.appendChild(video)

  try {
    await video.play()
  } catch {
    // Autoplay policies can reject even a muted play(); the frames still arrive
  }
  await waitForFrame(video)

  const track = stream.getVideoTracks()[0]

  // A track can die under us: the device is unplugged, another app claims it, or
  // the OS revokes permission mid-session. The <video> then holds its last frame
  // forever, which looks like a working feed that has simply stopped moving —
  // so say it out loud instead. `track.stop()` does not fire 'ended', so tearing
  // down deliberately cannot trip this.
  let lost = false
  let stopped = false
  const onTrackLost = (reason) => () => {
    if (lost || stopped) return
    lost = true
    onLost?.(reason)
  }
  const onEnded = onTrackLost('The camera feed stopped — reopen AR to try again')
  const onMute = onTrackLost('The camera feed was interrupted — check the camera is free')
  if (track && onLost) {
    track.addEventListener('ended', onEnded)
    track.addEventListener('mute', onMute)
  }

  return {
    video,
    stream,
    label: track?.label || 'camera',
    stop() {
      stopped = true
      track?.removeEventListener('ended', onEnded)
      track?.removeEventListener('mute', onMute)
      for (const t of stream.getTracks()) t.stop()
      video.pause?.()
      video.srcObject = null
      video.remove()
    },
  }
}

export default startWebcamSource
