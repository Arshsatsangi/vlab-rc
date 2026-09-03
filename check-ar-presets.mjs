// Throwaway check for the AR preset orientation maths. Deleted after running.
import * as THREE from 'three'
import {
  easeInOut,
  hasPreset,
  presetModelQuaternion,
  createArOrientation,
} from './src/ar/orientation.js'
import { cameraPresets, presetViewAngles } from './src/data/componentInfo.js'

let fails = 0
const ok = (cond, msg) => {
  if (!cond) fails++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`)
}
const DEG = 180 / Math.PI
const AXES = {
  '+X (right side)': new THREE.Vector3(1, 0, 0),
  '+Y (top)': new THREE.Vector3(0, 1, 0),
  '+Z (door/front)': new THREE.Vector3(0, 0, 1),
}

/** Rotation of the lab camera for a preset, from pos/target with up = +Y. */
function labCameraQuat(key) {
  const { pos, target } = cameraPresets[key]
  const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
  cam.position.set(...pos)
  cam.up.set(0, 1, 0)
  cam.lookAt(new THREE.Vector3(...target))
  cam.updateMatrixWorld(true)
  return cam.quaternion.clone()
}

console.log('--- 1. every preset in the table is answered -------------------')
for (const key of Object.keys(cameraPresets)) {
  ok(hasPreset(key), `hasPreset('${key}')`)
  ok(presetModelQuaternion(key, 0) !== null, `presetModelQuaternion('${key}')`)
}
ok(!hasPreset('nope'), "hasPreset('nope') is false")
ok(presetModelQuaternion('nope', 0) === null, 'unknown preset returns null')
ok(
  Object.keys(presetViewAngles).sort().join() === Object.keys(cameraPresets).sort().join(),
  'presetViewAngles covers exactly the lab presets'
)

console.log('\n--- 2. AR shows the same faces as the lab camera ---------------')
// A local axis appears in camera space as camQuat⁻¹ · axis (lab, model unrotated)
// or as modelQuat · axis (AR, camera identity). Same signs => same view.
for (const key of Object.keys(cameraPresets)) {
  const model = presetModelQuaternion(key, 0)
  const labInv = labCameraQuat(key).clone().invert()
  for (const [name, axis] of Object.entries(AXES)) {
    const lab = axis.clone().applyQuaternion(labInv)
    const ar = axis.clone().applyQuaternion(model)
    const angle = Math.acos(THREE.MathUtils.clamp(lab.dot(ar), -1, 1)) * DEG
    const sameSigns = ['x', 'y', 'z'].every(
      (c) => Math.abs(lab[c]) < 0.12 || Math.abs(ar[c]) < 0.12 || Math.sign(lab[c]) === Math.sign(ar[c])
    )
    ok(
      sameSigns && angle < 30,
      `${key.padEnd(5)} ${name.padEnd(16)} lab(${lab.toArray().map((n) => n.toFixed(2))}) ` +
        `ar(${ar.toArray().map((n) => n.toFixed(2))}) Δ${angle.toFixed(1)}°`
    )
  }
}

console.log('\n--- 3. the requested face points at the viewer -----------------')
const toward = new THREE.Vector3(0, 0, 1) // +Z in camera space = out of the screen
const faceOf = { front: AXES['+Z (door/front)'], side: AXES['+X (right side)'], top: AXES['+Y (top)'] }
faceOf.rear = new THREE.Vector3(0, 0, -1)
for (const [key, face] of Object.entries(faceOf)) {
  const d = face.clone().applyQuaternion(presetModelQuaternion(key, 0)).dot(toward)
  ok(d > 0.99, `${key.padEnd(5)} requested face faces the viewer (dot ${d.toFixed(3)})`)
}
{
  const q = presetModelQuaternion('3d', 0)
  const door = AXES['+Z (door/front)'].clone().applyQuaternion(q)
  const side = AXES['+X (right side)'].clone().applyQuaternion(q)
  ok(door.z > 0.3 && side.z > 0.3, `3d shows door and side together (${door.z.toFixed(2)}, ${side.z.toFixed(2)})`)
  ok(door.x < 0 && side.x > 0, '3d puts the door on the left and the side on the right')
}

console.log('\n--- 4. the cabinet stays upright (top is the exception) --------')
for (const key of ['front', 'side', 'rear', '3d']) {
  const up = AXES['+Y (top)'].clone().applyQuaternion(presetModelQuaternion(key, 0))
  ok(up.y > 0.999, `${key.padEnd(5)} still standing on the floor (up.y ${up.y.toFixed(4)})`)
}
{
  const q = presetModelQuaternion('top', 0)
  const up = AXES['+Y (top)'].clone().applyQuaternion(q)
  const door = AXES['+Z (door/front)'].clone().applyQuaternion(q)
  ok(Math.abs(up.z - 1) < 1e-6, 'top is tipped so its top faces the viewer')
  ok(door.y < -0.999, 'top puts the door at the bottom of the screen, as the lab top view does')
}

console.log('\n--- 5. the viewer bearing is followed --------------------------')
for (const yaw of [0, 0.9, -2.2, Math.PI]) {
  const q = presetModelQuaternion('front', yaw)
  const door = AXES['+Z (door/front)'].clone().applyQuaternion(q)
  const want = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw))
  ok(door.distanceTo(want) < 1e-6, `front at viewerYaw ${yaw.toFixed(2)} aims the door at the viewer`)
}

console.log('\n--- 6. ease-in-out: 400 ms, no snap ---------------------------')
ok(easeInOut(0) === 0 && easeInOut(1) === 1, 'ease spans 0 → 1')
ok(Math.abs(easeInOut(0.5) - 0.5) < 1e-9, 'ease is symmetric at the midpoint')
ok(easeInOut(0.02) < 0.02 && easeInOut(0.98) > 0.98, 'ease starts and ends slowly (ease-in-out)')
let mono = true
for (let i = 1; i <= 100; i++) mono = mono && easeInOut(i / 100) > easeInOut((i - 1) / 100)
ok(mono, 'ease is monotonic — the turn never backs up')

console.log('\n--- 7. createArOrientation: placement untouched, slerp settles -')
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
camera.position.set(0, 1.1, 0)
const placement = new THREE.Group()
const group = new THREE.Group()
placement.add(group)
placement.scale.setScalar(0.85)
placement.position.set(0.4, 0.85, -2.6)
placement.rotation.y = 0.7 // a hand rotation already applied by the gestures
placement.updateMatrixWorld(true)
const engine = {
  fridge: { group },
  placement,
  camera,
  renderer: { xr: { isPresenting: false, getCamera: () => camera } },
}
const before = {
  pos: placement.position.clone(),
  quat: placement.quaternion.clone(),
  scale: placement.scale.clone(),
}
const orient = createArOrientation({ engine })
ok(orient.apply('nope') === false, 'apply() declines an unknown preset (lab fly can take over)')
ok(orient.apply('side') === true, "apply('side') handled")
ok(orient.turning() === true, 'a preset animates rather than snapping')

// 0.4 s at 60 fps
let frames = 0
while (orient.turning() && frames < 100) {
  orient.update(1 / 60)
  frames++
  group.updateMatrixWorld(true)
  ok(Math.abs(group.quaternion.length() - 1) < 1e-6 || frames > 1, 'quaternion stays unit-length')
}
ok(
  Math.abs(frames / 60 - 0.4) <= 1 / 60,
  `settles in ${frames} frames ≈ ${(frames / 60).toFixed(2)} s (target 0.40 s, ±1 frame)`
)
ok(!orient.turning(), 'turn reports settled')

ok(
  placement.position.equals(before.pos) &&
    placement.quaternion.equals(before.quat) &&
    placement.scale.equals(before.scale),
  'placement position / rotation / scale identical after a preset'
)

// The visible (world) orientation must be the preset even though the placement
// carries a 0.7 rad hand rotation — that is what parentInv is for.
placement.updateMatrixWorld(true)
const world = group.getWorldQuaternion(new THREE.Quaternion())
const viewerYaw = Math.atan2(
  camera.position.x - placement.position.x,
  camera.position.z - placement.position.z
)
const want = presetModelQuaternion('side', viewerYaw)
ok(Math.abs(Math.abs(world.dot(want)) - 1) < 1e-6, 'visible orientation equals the preset under a gesture yaw')
const sideFace = AXES['+X (right side)'].clone().applyQuaternion(world)
const eye = camera.position.clone().sub(placement.getWorldPosition(new THREE.Vector3())).normalize()
ok(sideFace.dot(eye) > 0.99, `the side faces the actual viewer (dot ${sideFace.dot(eye).toFixed(3)})`)

// animate:false is the entry path — no visible turn on entering AR
orient.apply('rear', { animate: false })
ok(!orient.turning(), 'apply({animate:false}) is instant, for the AR entry')

orient.dispose()
ok(group.quaternion.equals(new THREE.Quaternion()), 'dispose() hands the model back to the lab view')

console.log(`\n${fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
