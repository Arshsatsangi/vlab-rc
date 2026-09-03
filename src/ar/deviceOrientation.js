/**
 * Phone gyroscope → camera rotation, for phones that land on Tier 3.
 *
 * Without this, a phone in webcam mode shows a feed that pans while the model
 * stays glued to the screen. Driving the camera's orientation from the device
 * sensors makes the unit hold its place in the room as the phone turns — not
 * true world tracking (there is no translation), but the rotation is real.
 *
 * The maths is deliberately dependency-free so it can be unit tested without a
 * DOM or a renderer: `orientationQuaternion` is a pure function.
 */

const DEG = Math.PI / 180

/** Multiply two quaternions given as [x, y, z, w]. */
function mul(a, b) {
  const [ax, ay, az, aw] = a
  const [bx, by, bz, bw] = b
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ]
}

/** Quaternion from an Euler triple in Three.js 'YXZ' order (radians). */
function fromEulerYXZ(x, y, z) {
  const c1 = Math.cos(x / 2)
  const c2 = Math.cos(y / 2)
  const c3 = Math.cos(z / 2)
  const s1 = Math.sin(x / 2)
  const s2 = Math.sin(y / 2)
  const s3 = Math.sin(z / 2)
  return [
    s1 * c2 * c3 + c1 * s2 * s3,
    c1 * s2 * c3 - s1 * c2 * s3,
    c1 * c2 * s3 - s1 * s2 * c3,
    c1 * c2 * c3 + s1 * s2 * s3,
  ]
}

/**
 * Device orientation angles → a camera quaternion, as [x, y, z, w].
 *
 * Screen space is rotated a quarter turn out of device space (hence the fixed
 * -90° about X), and the live screen angle undoes the user holding the phone in
 * landscape.
 *
 * @param {number} alpha compass rotation about Z, degrees
 * @param {number} beta  front-to-back tilt about X, degrees
 * @param {number} gamma left-to-right tilt about Y, degrees
 * @param {number} screenAngle `screen.orientation.angle`, degrees
 */
export function orientationQuaternion(alpha, beta, gamma, screenAngle = 0) {
  let q = fromEulerYXZ(beta * DEG, alpha * DEG, -gamma * DEG)
  q = mul(q, [-Math.SQRT1_2, 0, 0, Math.SQRT1_2])
  const half = (-screenAngle * DEG) / 2
  return mul(q, [0, 0, Math.sin(half), Math.cos(half)])
}

/** iOS 13+ gates the sensors behind a prompt that only opens from a gesture. */
export function needsOrientationPermission() {
  return (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  )
}

/**
 * Ask for sensor access. MUST be called synchronously from a user gesture —
 * anything awaited first spends the activation and Safari rejects the prompt.
 * @returns {Promise<boolean>} granted, or true where no permission is needed
 */
export async function requestOrientationPermission() {
  if (!needsOrientationPermission()) return true
  try {
    return (await DeviceOrientationEvent.requestPermission()) === 'granted'
  } catch {
    return false
  }
}

/**
 * Drive `camera.quaternion` from the device sensors.
 * @returns {{update: (dt: number) => void, active: () => boolean, dispose: () => void}}
 */
export function createOrientationCamera({ camera, smoothing = 12 }) {
  // Borrow the camera's own quaternion class so this module needs no three import
  const target = camera.quaternion.clone()
  let received = false

  const screenAngle = () => {
    if (typeof screen !== 'undefined' && screen.orientation) return screen.orientation.angle || 0
    return typeof window !== 'undefined' ? window.orientation || 0 : 0
  }

  const onOrientation = (e) => {
    if (e.alpha === null || e.alpha === undefined) return
    const [x, y, z, w] = orientationQuaternion(e.alpha, e.beta || 0, e.gamma || 0, screenAngle())
    target.set(x, y, z, w)
    received = true
  }

  // `deviceorientationabsolute` is Chrome's earth-referenced variant; where both
  // fire, the absolute one wins because its heading does not drift.
  window.addEventListener('deviceorientationabsolute', onOrientation, true)
  window.addEventListener('deviceorientation', onOrientation, true)

  return {
    update(dt) {
      if (!received) return
      // Exponential approach: frame-rate independent, and it damps sensor jitter
      camera.quaternion.slerp(target, 1 - Math.exp(-smoothing * dt))
    },
    active: () => received,
    dispose() {
      window.removeEventListener('deviceorientationabsolute', onOrientation, true)
      window.removeEventListener('deviceorientation', onOrientation, true)
    },
  }
}

export default createOrientationCamera
