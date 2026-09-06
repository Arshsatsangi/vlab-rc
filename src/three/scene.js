import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { attachResize } from './helpers.js'

export const BG_COLOR = 0x121815

/**
 * Create renderer, scene, camera, lights, ground and controls for the lab view.
 * @param {HTMLCanvasElement} canvas
 */
export function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    // Alpha cannot be enabled after construction, and AR needs a transparent
    // drawing buffer to composite the model over the camera feed. The lab view
    // is unaffected: an opaque `scene.background` clears with alpha 1.
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(BG_COLOR)
  scene.fog = new THREE.FogExp2(BG_COLOR, 0.035)

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
  camera.position.set(2.9, 1.9, 3.6)

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minDistance = 1.6
  controls.maxDistance = 11
  controls.maxPolarAngle = Math.PI * 0.86
  controls.target.set(0, 0.1, 0)
  controls.update()

  const lights = addLights(scene)
  const { ground, grid } = addGround(scene)

  // Mutable render-quality knobs. AR lowers the pixel-ratio ceiling on phones;
  // holding it here means a later resize keeps the reduced value.
  const viewOpts = { maxPixelRatio: 2 }
  const detachResize = attachResize(canvas, camera, renderer, viewOpts)

  return { renderer, scene, camera, controls, detachResize, lights, ground, grid, viewOpts }
}

function addLights(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.45)
  scene.add(ambient)

  const key = new THREE.DirectionalLight(0xffffff, 1.5)
  key.position.set(5, 10, 7)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 1
  key.shadow.camera.far = 30
  key.shadow.camera.left = -5
  key.shadow.camera.right = 5
  key.shadow.camera.top = 5
  key.shadow.camera.bottom = -5
  key.shadow.bias = -0.0006
  key.shadow.normalBias = 0.02
  scene.add(key)

  // Cool rim light from behind-left to read the silhouette against the dark bg
  const rim = new THREE.DirectionalLight(0x88bbff, 0.55)
  rim.position.set(-6, 4, -5)
  scene.add(rim)

  // Warm fill from the front so the door face is not flat
  const fill = new THREE.DirectionalLight(0xffe6c4, 0.3)
  fill.position.set(-2, 1, 6)
  scene.add(fill)

  // Interior cabinet lamp (cold blue) — toggled with the door in the model layer
  const cabinetLight = new THREE.PointLight(0x88ccff, 0.35, 3.2, 2)
  cabinetLight.position.set(0, 0.5, 0)
  cabinetLight.name = 'cabinetLight'
  scene.add(cabinetLight)

  return { ambient, key, rim, fill, cabinetLight }
}

function addGround(scene) {
  const geo = new THREE.CircleGeometry(9, 64)
  const mat = new THREE.MeshStandardMaterial({
    color: 0x101a33,
    roughness: 0.85,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9,
  })
  const ground = new THREE.Mesh(geo, mat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1.02
  ground.receiveShadow = true
  ground.name = 'ground'
  scene.add(ground)

  const grid = new THREE.GridHelper(18, 36, 0x1e3a5f, 0x152540)
  grid.position.y = -1.015
  grid.material.transparent = true
  grid.material.opacity = 0.45
  grid.name = 'grid'
  scene.add(grid)

  return { ground, grid }
}
