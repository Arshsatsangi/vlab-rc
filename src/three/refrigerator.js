import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Cabinet dimensions (metres, model scale)
//   exterior : 1.2 W x 2.0 H x 0.8 D, centred on the origin
//   machine compartment (compressor) : y from -1.00 to -0.68 at the rear
//   freezer compartment : top 30 % of the interior
// ---------------------------------------------------------------------------
export const DIMS = {
  w: 1.2,
  h: 2.0,
  d: 0.8,
  wall: 0.06,
  doorT: 0.07,
  plinthTop: -0.68,
}

/** Refrigerant circuit connection points, consumed by refrigerantFlow.js */
export const PORTS = {
  compressorSuction: new THREE.Vector3(-0.02, -0.76, -0.06),
  compressorDischarge: new THREE.Vector3(0.3, -0.76, -0.2),
  condenserIn: new THREE.Vector3(0.46, 0.86, -0.47),
  condenserOut: new THREE.Vector3(-0.46, -0.44, -0.47),
  evaporatorIn: new THREE.Vector3(-0.42, 0.46, -0.28),
  evaporatorOut: new THREE.Vector3(0.42, 0.46, -0.28),
}

const mat = {
  steel: () =>
    new THREE.MeshStandardMaterial({ color: 0xc9ced8, metalness: 0.38, roughness: 0.48 }),
  interior: () =>
    new THREE.MeshStandardMaterial({
      color: 0xeef1f6,
      metalness: 0.05,
      roughness: 0.82,
      side: THREE.DoubleSide,
    }),
  chrome: () =>
    new THREE.MeshStandardMaterial({ color: 0xe2e7ee, metalness: 0.95, roughness: 0.14 }),
  dark: () => new THREE.MeshStandardMaterial({ color: 0x2b3038, metalness: 0.7, roughness: 0.42 }),
  darker: () => new THREE.MeshStandardMaterial({ color: 0x1a1e25, metalness: 0.6, roughness: 0.55 }),
  copper: () =>
    new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.85, roughness: 0.28 }),
  glass: () =>
    new THREE.MeshStandardMaterial({
      color: 0xbfe3ff,
      metalness: 0.1,
      roughness: 0.08,
      transparent: true,
      opacity: 0.35,
    }),
}

/** Tag a group so raycasting can resolve it to a named, selectable part. */
function tagPart(obj, partName) {
  obj.userData.partName = partName
  obj.traverse((o) => {
    o.userData.partName = partName
    if (o.isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  return obj
}

function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

// ---------------------------------------------------------------------------
// Cabinet shell — five panels so the interior is genuinely hollow
// ---------------------------------------------------------------------------
function buildCabinet() {
  const g = new THREE.Group()
  g.name = 'cabinet'
  const { w, h, d, wall, plinthTop } = DIMS
  const outer = mat.steel()
  const inner = mat.interior()

  const interiorBottom = plinthTop
  const interiorH = h / 2 - interiorBottom - wall // from plinthTop up to under the top panel

  g.add(box(w, wall, d, outer, 0, h / 2 - wall / 2, 0)) // top
  g.add(box(wall, interiorH + wall, d, outer, -w / 2 + wall / 2, interiorBottom + interiorH / 2, 0)) // left
  g.add(box(wall, interiorH + wall, d, outer, w / 2 - wall / 2, interiorBottom + interiorH / 2, 0)) // right
  g.add(box(w, interiorH + wall, wall, outer, 0, interiorBottom + interiorH / 2, -d / 2 + wall / 2)) // back
  g.add(box(w, wall, d, outer, 0, interiorBottom - wall / 2, 0)) // interior floor

  // Machine compartment: sides + front skirt, open at the rear
  g.add(box(wall, 0.32, d, outer, -w / 2 + wall / 2, -0.84, 0))
  g.add(box(wall, 0.32, d, outer, w / 2 - wall / 2, -0.84, 0))
  g.add(box(w, 0.32, wall, outer, 0, -0.84, d / 2 - wall / 2))
  g.add(box(w - 2 * wall, 0.06, d - 2 * wall, mat.darker(), 0, -0.99, 0)) // base plate

  // Interior liner (slightly inset so the white liner reads against the shell)
  const linerW = w - 2 * wall - 0.004
  const linerH = interiorH - 0.004
  const linerD = d - 2 * wall
  const liner = new THREE.Group()
  liner.add(box(0.006, linerH, linerD, inner, -linerW / 2, interiorBottom + linerH / 2 + 0.01, 0))
  liner.add(box(0.006, linerH, linerD, inner, linerW / 2, interiorBottom + linerH / 2 + 0.01, 0))
  liner.add(box(linerW, linerH, 0.006, inner, 0, interiorBottom + linerH / 2 + 0.01, -linerD / 2))
  liner.add(box(linerW, 0.006, linerD, inner, 0, interiorBottom + 0.014, 0))
  liner.add(box(linerW, 0.006, linerD, inner, 0, h / 2 - wall - 0.006, 0))
  g.add(liner)

  return { group: tagPart(g, 'cabinet'), interiorBottom, interiorH }
}

// ---------------------------------------------------------------------------
// Door — hinge pivot at the left edge (x = -0.6)
// ---------------------------------------------------------------------------
function buildDoor() {
  const pivot = new THREE.Group()
  pivot.name = 'doorPivot'
  pivot.position.set(-DIMS.w / 2, 0, DIMS.d / 2)

  const g = new THREE.Group()
  g.name = 'door'
  const { w, h, doorT, plinthTop } = DIMS
  const doorH = h / 2 - plinthTop
  const cy = plinthTop + doorH / 2
  const cx = w / 2 // local offset so the pivot sits on the hinge line

  g.add(box(w, doorH, doorT, mat.steel(), cx, cy, doorT / 2))

  // Magnetic gasket frame on the inner face
  const gasketMat = new THREE.MeshStandardMaterial({ color: 0x3a4049, roughness: 0.9 })
  const gt = 0.035
  g.add(box(w - 0.02, gt, 0.03, gasketMat, cx, cy + doorH / 2 - gt, -0.012))
  g.add(box(w - 0.02, gt, 0.03, gasketMat, cx, cy - doorH / 2 + gt, -0.012))
  g.add(box(gt, doorH - 0.02, 0.03, gasketMat, cx - w / 2 + gt, cy, -0.012))
  g.add(box(gt, doorH - 0.02, 0.03, gasketMat, cx + w / 2 - gt, cy, -0.012))

  // Door shelves (inner face)
  for (let i = 0; i < 3; i++) {
    const y = cy - 0.42 + i * 0.42
    g.add(box(w - 0.14, 0.02, 0.08, mat.glass(), cx, y, -0.05))
    g.add(box(w - 0.14, 0.09, 0.012, mat.glass(), cx, y + 0.045, -0.088))
  }

  // Vertical bar handle on the right edge, in chrome
  const handle = new THREE.Group()
  const barGeo = new THREE.CylinderGeometry(0.022, 0.022, doorH * 0.55, 20)
  const bar = new THREE.Mesh(barGeo, mat.chrome())
  bar.position.set(cx + w / 2 - 0.07, cy + 0.12, doorT + 0.055)
  handle.add(bar)
  for (const dy of [-1, 1]) {
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.06, 14), mat.chrome())
    stand.rotation.x = Math.PI / 2
    stand.position.set(cx + w / 2 - 0.07, cy + 0.12 + dy * (doorH * 0.25), doorT + 0.028)
    handle.add(stand)
  }
  g.add(handle)

  // Freezer / fresh-food split line embossed on the door face
  g.add(box(w - 0.04, 0.008, 0.004, mat.darker(), cx, 0.38, doorT + 0.002))

  pivot.add(g)
  return tagPart(pivot, 'door')
}

// ---------------------------------------------------------------------------
// Interior fittings: freezer housing, shelves, crisper
// ---------------------------------------------------------------------------
function buildInterior() {
  const g = new THREE.Group()
  g.name = 'interior'
  const shelfMat = mat.glass()

  // Freezer compartment housing (top 30 % of the interior)
  const freezerMat = new THREE.MeshStandardMaterial({
    color: 0xdce9f7,
    metalness: 0.15,
    roughness: 0.6,
    side: THREE.DoubleSide,
  })
  g.add(box(1.04, 0.012, 0.66, freezerMat, 0, 0.34, 0)) // freezer floor
  // Freezer flap door (translucent)
  const flap = box(1.02, 0.5, 0.01, mat.glass(), 0, 0.6, 0.33)
  flap.material.opacity = 0.22
  g.add(flap)

  // Fresh-food shelves
  for (const y of [0.06, -0.24, -0.52]) {
    g.add(box(1.02, 0.014, 0.64, shelfMat, 0, y, 0))
  }

  // Crisper / vegetable drawer just above the interior floor
  const crisperMat = new THREE.MeshStandardMaterial({
    color: 0xa8d8e8,
    transparent: true,
    opacity: 0.42,
    roughness: 0.25,
    metalness: 0.1,
  })
  const crisper = new THREE.Group()
  crisper.add(box(1.0, 0.006, 0.6, crisperMat, 0, -0.63, 0))
  crisper.add(box(1.0, 0.16, 0.008, crisperMat, 0, -0.55, 0.3))
  crisper.add(box(1.0, 0.16, 0.008, crisperMat, 0, -0.55, -0.3))
  crisper.add(box(0.008, 0.16, 0.6, crisperMat, -0.5, -0.55, 0))
  crisper.add(box(0.008, 0.16, 0.6, crisperMat, 0.5, -0.55, 0))
  g.add(crisper)

  // Interior lamp housing at the top-front
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0xfff4d6,
      emissive: 0xfff0c0,
      emissiveIntensity: 0,
    })
  )
  lamp.position.set(0.4, 0.9, 0.24)
  lamp.name = 'interiorLamp'
  g.add(lamp)

  return { group: tagPart(g, 'interior'), lamp }
}

// ---------------------------------------------------------------------------
// COMPRESSOR — hermetic dome in the machine compartment, bottom rear
// ---------------------------------------------------------------------------
function buildCompressor() {
  const g = new THREE.Group()
  g.name = 'compressor'
  const shell = mat.dark()

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 32), shell)
  g.add(body)
  const domeTop = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    shell
  )
  domeTop.position.y = 0.09
  g.add(domeTop)
  const domeBot = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    shell
  )
  domeBot.position.y = -0.09
  g.add(domeBot)

  // Weld seam
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.121, 0.006, 8, 40), mat.darker())
  seam.rotation.x = Math.PI / 2
  g.add(seam)

  // Mounting feet / rubber grommets
  for (const [x, z] of [
    [-0.09, -0.09],
    [0.09, -0.09],
    [-0.09, 0.09],
    [0.09, 0.09],
  ]) {
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.026, 0.05, 12),
      new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: 0.95 })
    )
    foot.position.set(x, -0.15, z)
    g.add(foot)
  }

  // Terminal box + suction/discharge stubs
  const term = box(0.07, 0.05, 0.05, mat.darker(), 0, 0.02, 0.12)
  g.add(term)
  const suction = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 12), mat.copper())
  suction.rotation.z = Math.PI / 2
  suction.position.set(-0.15, 0.05, 0.04)
  g.add(suction)
  const discharge = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.1, 12), mat.copper())
  discharge.rotation.z = Math.PI / 2
  discharge.position.set(0.15, 0.05, -0.05)
  g.add(discharge)

  g.position.set(0.14, -0.82, -0.14)
  return tagPart(g, 'compressor')
}

// ---------------------------------------------------------------------------
// CONDENSER — natural-convection wire-and-tube grid on the rear panel
// ---------------------------------------------------------------------------
const COND = { z: -0.47, yTop: 0.86, yBot: -0.44, passes: 9, xL: -0.46, xR: 0.46 }

/** Serpentine centre-line of the condenser coil (also used by the flow particles). */
export function condenserPathPoints() {
  const { z, yTop, yBot, passes, xL, xR } = COND
  const gap = (yTop - yBot) / (passes - 1)
  const r = gap / 2
  const pts = []
  for (let i = 0; i < passes; i++) {
    const y = yTop - i * gap
    const leftToRight = i % 2 === 1 // pass 0 runs right → left, from the inlet
    const xStart = leftToRight ? xL : xR
    const xEnd = leftToRight ? xR : xL
    pts.push(new THREE.Vector3(xStart, y, z))
    pts.push(new THREE.Vector3(xEnd, y, z))
    if (i < passes - 1) {
      const sign = xEnd > 0 ? 1 : -1
      const yc = y - r
      for (let k = 1; k < 8; k++) {
        const phi = Math.PI / 2 - (k / 8) * Math.PI
        pts.push(
          new THREE.Vector3(xEnd + sign * r * Math.cos(phi), yc + r * Math.sin(phi), z)
        )
      }
    }
  }
  return pts
}

function buildCondenser() {
  const g = new THREE.Group()
  g.name = 'condenser'
  const { z, yTop, yBot, xL, xR } = COND

  // Shared material so the whole coil can glow together when running
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0x23272e,
    metalness: 0.75,
    roughness: 0.38,
    emissive: 0xff4400,
    emissiveIntensity: 0,
  })
  g.userData.tubeMat = tubeMat

  const curve = new THREE.CatmullRomCurve3(condenserPathPoints(), false, 'catmullrom', 0.5)
  g.userData.curve = curve
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 900, 0.013, 10, false), tubeMat))

  // Vertical support wires
  const wireMat = new THREE.MeshStandardMaterial({
    color: 0x30353d,
    metalness: 0.6,
    roughness: 0.5,
  })
  const wireGeo = new THREE.CylinderGeometry(0.0045, 0.0045, yTop - yBot + 0.06, 8)
  for (let i = 0; i <= 12; i++) {
    const x = xL + ((xR - xL) * i) / 12
    const wire = new THREE.Mesh(wireGeo, wireMat)
    wire.position.set(x, (yTop + yBot) / 2, z - 0.019)
    g.add(wire)
  }

  return tagPart(g, 'condenser')
}

// ---------------------------------------------------------------------------
// CAPILLARY TUBE (expansion device) — coiled copper line, condenser → evaporator
// ---------------------------------------------------------------------------
export function capillaryPoints() {
  const p = [
    new THREE.Vector3(-0.46, -0.44, -0.47),
    new THREE.Vector3(-0.55, -0.38, -0.44),
    new THREE.Vector3(-0.57, -0.3, -0.42),
  ]
  // Coiled section: 3 turns climbing the left rear corner
  const turns = 3
  const steps = turns * 18
  const cx = -0.55
  const cz = -0.42
  const rad = 0.045
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * turns * Math.PI * 2
    p.push(
      new THREE.Vector3(cx + Math.cos(a) * rad, -0.28 + t * 0.5, cz + Math.sin(a) * rad * 0.8)
    )
  }
  p.push(new THREE.Vector3(-0.55, 0.3, -0.42))
  p.push(new THREE.Vector3(-0.5, 0.42, -0.36))
  p.push(PORTS.evaporatorIn.clone())
  return p
}

function buildExpansionValve() {
  const g = new THREE.Group()
  g.name = 'expansionValve'

  const curve = new THREE.CatmullRomCurve3(capillaryPoints(), false, 'catmullrom', 0.4)
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 320, 0.008, 10, false), mat.copper())
  g.add(tube)

  // Drier / strainer at the condenser outlet
  const drier = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.028, 0.13, 20),
    new THREE.MeshStandardMaterial({ color: 0xa8823a, metalness: 0.8, roughness: 0.35 })
  )
  drier.position.set(-0.53, -0.36, -0.44)
  drier.rotation.z = -0.5
  g.add(drier)

  // Invisible fat proxy so the thin tube is easy to click
  const proxy = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 90, 0.05, 6, false),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  )
  proxy.userData.isHitProxy = true
  g.add(proxy)

  const part = tagPart(g, 'expansionValve')
  proxy.castShadow = false
  proxy.receiveShadow = false
  return part
}

// ---------------------------------------------------------------------------
// EVAPORATOR — plate coil forming the freezer, plus frost layer & defrost heater
// ---------------------------------------------------------------------------
const EVAP = { y: 0.415, zStart: -0.24, pitch: 0.11, passes: 5, xL: -0.45, xR: 0.45 }

/** Serpentine centre-line of the evaporator coil, inlet → outlet. */
export function evaporatorPathPoints() {
  const { y, zStart, pitch, passes, xL, xR } = EVAP
  const r = pitch / 2
  const pts = [
    PORTS.evaporatorIn.clone(),
    new THREE.Vector3(-0.45, 0.44, -0.27),
    new THREE.Vector3(xL, y, zStart),
  ]
  for (let i = 0; i < passes; i++) {
    const z = zStart + i * pitch
    const leftToRight = i % 2 === 0
    const xStart = leftToRight ? xL : xR
    const xEnd = leftToRight ? xR : xL
    pts.push(new THREE.Vector3(xStart, y, z))
    pts.push(new THREE.Vector3(xEnd, y, z))
    if (i < passes - 1) {
      const sign = xEnd > 0 ? 1 : -1
      const zc = z + r
      for (let k = 1; k < 8; k++) {
        const phi = -Math.PI / 2 + (k / 8) * Math.PI
        pts.push(
          new THREE.Vector3(xEnd + sign * r * Math.cos(phi), y, zc + r * Math.sin(phi))
        )
      }
    }
  }
  // Riser back to the rear-right corner, where the suction line leaves
  pts.push(new THREE.Vector3(0.47, 0.43, 0.21))
  pts.push(new THREE.Vector3(0.47, 0.46, -0.05))
  pts.push(PORTS.evaporatorOut.clone())
  return pts
}

function buildEvaporator() {
  const g = new THREE.Group()
  g.name = 'evaporator'

  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xd7e6f5,
    metalness: 0.55,
    roughness: 0.35,
    emissive: 0x88ccff,
    emissiveIntensity: 0.2,
  })
  g.userData.plateMat = plateMat

  const W = 0.9
  const D = 0.56
  const plate = box(W, 0.03, D, plateMat, 0, 0.62, -0.02) // top plate
  g.add(plate)
  g.add(box(W, 0.03, D, plateMat, 0, 0.44, -0.02)) // bottom plate
  g.add(box(W, 0.2, 0.03, plateMat, 0, 0.53, -0.29)) // rear wall
  g.add(box(0.03, 0.2, D, plateMat, -W / 2, 0.53, -0.02)) // left wall
  g.add(box(0.03, 0.2, D, plateMat, W / 2, 0.53, -0.02)) // right wall

  // Serpentine tubing bonded to the bottom plate
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xc9d8e8,
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0x66bbff,
    emissiveIntensity: 0.15,
  })
  g.userData.tubeMat = tubeMat
  const curve = new THREE.CatmullRomCurve3(evaporatorPathPoints(), false, 'catmullrom', 0.5)
  g.userData.curve = curve
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 700, 0.012, 10, false), tubeMat))

  return tagPart(g, 'evaporator')
}

/** Frost shell that grows over the evaporator as frostThickness rises. */
function buildFrost() {
  const g = new THREE.Group()
  g.name = 'frost'
  const frostMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })
  g.userData.frostMat = frostMat

  const shell = box(0.96, 0.26, 0.62, frostMat, 0, 0.53, -0.02)
  shell.castShadow = false
  g.add(shell)

  // Icicle-ish crystals under the coil for texture at high frost levels
  for (let i = 0; i < 22; i++) {
    const s = 0.012 + Math.random() * 0.02
    const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), frostMat)
    crystal.position.set(
      -0.42 + Math.random() * 0.84,
      0.4 - Math.random() * 0.03,
      -0.26 + Math.random() * 0.5
    )
    crystal.castShadow = false
    g.add(crystal)
  }

  g.userData.partName = 'evaporator' // clicking the frost selects the evaporator
  g.traverse((o) => (o.userData.partName = 'evaporator'))
  return g
}

/** Electric defrost heater rod below the evaporator. */
function buildDefrostHeater() {
  const g = new THREE.Group()
  g.name = 'defrostHeater'
  const heaterMat = new THREE.MeshStandardMaterial({
    color: 0x4a4038,
    metalness: 0.5,
    roughness: 0.6,
    emissive: 0xff2200,
    emissiveIntensity: 0,
  })
  g.userData.heaterMat = heaterMat

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.88, 14), heaterMat)
  rod.rotation.z = Math.PI / 2
  rod.position.set(0, 0.37, -0.02)
  g.add(rod)
  for (const x of [-0.42, 0.42]) {
    const bracket = box(0.02, 0.05, 0.02, mat.darker(), x, 0.395, -0.02)
    g.add(bracket)
  }
  return tagPart(g, 'defrostHeater')
}

// ---------------------------------------------------------------------------
// THERMOSTAT — sensing bulb clamped to the evaporator + capillary lead
// ---------------------------------------------------------------------------
function buildThermostat() {
  const g = new THREE.Group()
  g.name = 'thermostat'

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xb87333,
    metalness: 0.85,
    roughness: 0.25,
    emissive: 0xf59e0b,
    emissiveIntensity: 0,
  })
  g.userData.bulbMat = bulbMat

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 24, 16), bulbMat)
  g.add(bulb)

  // Clamp holding the bulb against the coil
  const clamp = new THREE.Mesh(
    new THREE.TorusGeometry(0.045, 0.008, 8, 20, Math.PI * 1.4),
    mat.chrome()
  )
  clamp.rotation.y = Math.PI / 2
  g.add(clamp)

  // Capillary lead running out to the thermostat body
  const lead = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.1, 0.06, 0.02),
    new THREE.Vector3(-0.2, 0.14, -0.02),
    new THREE.Vector3(-0.24, 0.2, -0.1),
  ])
  g.add(new THREE.Mesh(new THREE.TubeGeometry(lead, 40, 0.005, 8, false), mat.copper()))

  g.position.set(-0.28, 0.66, 0.16)
  return tagPart(g, 'thermostat')
}

/** Status lamp on the door face: green = running, amber = idle, off = no supply. */
function buildStatusLamp() {
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0x223026,
    emissive: 0x22c55e,
    emissiveIntensity: 0,
    metalness: 0.2,
    roughness: 0.4,
  })
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), lampMat)
  lamp.position.set(0.42, 0.86, 0.5)
  lamp.name = 'statusLamp'
  lamp.userData.lampMat = lampMat
  return lamp
}

// ---------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------
export function buildRefrigerator() {
  const group = new THREE.Group()
  group.name = 'refrigerator'

  const { group: cabinet } = buildCabinet()
  const door = buildDoor()
  const { group: interior, lamp } = buildInterior()
  const compressor = buildCompressor()
  const condenser = buildCondenser()
  const expansionValve = buildExpansionValve()
  const evaporator = buildEvaporator()
  const frost = buildFrost()
  const defrostHeater = buildDefrostHeater()
  const thermostat = buildThermostat()
  const statusLamp = buildStatusLamp()

  // Frost and heater ride with the evaporator (including in exploded view)
  evaporator.add(frost)
  evaporator.add(defrostHeater)

  group.add(cabinet, door, interior, compressor, condenser, expansionValve, evaporator, thermostat)
  door.add(statusLamp)

  const parts = {
    cabinet,
    door,
    interior,
    compressor,
    condenser,
    expansionValve,
    evaporator,
    thermostat,
  }

  // Record home transforms for the exploded-view animation
  Object.values(parts).forEach((p) => {
    p.userData.homePosition = p.position.clone()
  })

  const materials = {
    condenserTube: condenser.userData.tubeMat,
    evaporatorPlate: evaporator.userData.plateMat,
    evaporatorTube: evaporator.userData.tubeMat,
    frost: frost.userData.frostMat,
    heater: defrostHeater.userData.heaterMat,
    thermostatBulb: thermostat.userData.bulbMat,
    statusLamp: statusLamp.userData.lampMat,
    interiorLamp: lamp.material,
  }

  return { group, parts, materials, frost, defrostHeater, statusLamp, interiorLamp: lamp }
}

export default buildRefrigerator
