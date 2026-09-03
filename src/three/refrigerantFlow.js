import * as THREE from 'three'
import { PORTS, capillaryPoints, condenserPathPoints, evaporatorPathPoints } from './refrigerator.js'

const HOT = new THREE.Color('#ff4d4d')
const WARM = new THREE.Color('#ff8a3d')
const COLD = new THREE.Color('#4f8cff')
const CHILL = new THREE.Color('#22d3ee')

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1e-6)))
  return t * t * (3 - 2 * t)
}

/** Suction line: evaporator outlet → compressor inlet (low pressure vapour). */
function suctionPoints() {
  return [
    PORTS.evaporatorOut.clone(),
    new THREE.Vector3(0.5, 0.42, -0.42),
    new THREE.Vector3(0.52, 0.1, -0.45),
    new THREE.Vector3(0.52, -0.28, -0.45),
    new THREE.Vector3(0.4, -0.62, -0.4),
    new THREE.Vector3(0.15, -0.72, -0.2),
    new THREE.Vector3(0.0, -0.74, -0.1),
    PORTS.compressorSuction.clone(),
  ]
}

/** Discharge line: compressor outlet → condenser inlet (high pressure vapour). */
function dischargePoints() {
  return [
    PORTS.compressorDischarge.clone(),
    new THREE.Vector3(0.4, -0.72, -0.36),
    new THREE.Vector3(0.56, -0.55, -0.48),
    new THREE.Vector3(0.58, 0.0, -0.52),
    new THREE.Vector3(0.58, 0.55, -0.52),
    new THREE.Vector3(0.54, 0.86, -0.5),
    PORTS.condenserIn.clone(),
  ]
}

// Four thermodynamic processes of the VCR cycle. Process 3→4 carries the
// particles through the capillary and on through the evaporator coil.
function buildSegments() {
  return [
    {
      key: 'suction',
      label: '4 → 1  Evaporator → Compressor (L.P. vapour)',
      points: suctionPoints(),
      from: CHILL,
      to: COLD,
      ramp: [0, 1],
      size: [1.0, 1.0],
      count: 15,
      speed: 1.25,
      pipe: 0x3f6fbf,
      drawPipe: true,
    },
    {
      key: 'discharge',
      label: '1 → 2  Compressor → Condenser (H.P. vapour)',
      points: dischargePoints(),
      from: HOT,
      to: HOT,
      ramp: [0, 1],
      size: [1.35, 1.35],
      count: 15,
      speed: 1.15,
      pipe: 0xa83b3b,
      drawPipe: true,
    },
    {
      key: 'condensing',
      label: '2 → 3  Condensation (H.P. vapour → liquid)',
      points: condenserPathPoints(),
      from: HOT,
      to: WARM,
      ramp: [0.15, 0.95],
      size: [1.3, 0.95],
      count: 26,
      speed: 0.85,
      drawPipe: false,
    },
    {
      key: 'expansion',
      label: '3 → 4  Throttling + evaporation (L.P. mixture → vapour)',
      points: [...capillaryPoints(), ...evaporatorPathPoints().slice(1)],
      from: WARM,
      to: CHILL,
      ramp: [0.28, 0.52],
      size: [0.85, 1.15],
      count: 30,
      speed: 0.95,
      drawPipe: false,
    },
  ]
}

/**
 * Animated refrigerant flow: colour-coded particles running along the real
 * circuit centre-lines, plus the suction and discharge pipes themselves.
 */
export function createRefrigerantFlow() {
  const flowGroup = new THREE.Group()
  flowGroup.name = 'refrigerantFlow'
  const pipesGroup = new THREE.Group()
  pipesGroup.name = 'refrigerantPipes'

  const sphereGeo = new THREE.SphereGeometry(0.014, 12, 10)
  const segments = buildSegments().map((seg) => {
    const curve = new THREE.CatmullRomCurve3(seg.points, false, 'catmullrom', 0.45)
    curve.arcLengthDivisions = 600

    if (seg.drawPipe) {
      const pipeMat = new THREE.MeshStandardMaterial({
        color: seg.pipe,
        metalness: 0.75,
        roughness: 0.35,
        emissive: seg.pipe,
        emissiveIntensity: 0.12,
      })
      const pipe = new THREE.Mesh(new THREE.TubeGeometry(curve, 220, 0.0135, 10, false), pipeMat)
      pipe.castShadow = true
      pipe.userData.partName = seg.key === 'suction' ? 'evaporator' : 'compressor'
      pipesGroup.add(pipe)
      seg.pipeMat = pipeMat
    }

    const particles = []
    for (let i = 0; i < seg.count; i++) {
      const t = i / seg.count
      const mat = new THREE.MeshStandardMaterial({
        color: seg.from.clone().lerp(seg.to, smoothstep(seg.ramp[0], seg.ramp[1], t)),
        emissive: seg.from.clone().lerp(seg.to, smoothstep(seg.ramp[0], seg.ramp[1], t)),
        emissiveIntensity: 1.1,
        roughness: 0.35,
        metalness: 0,
        transparent: true,
        opacity: 0,
      })
      const m = new THREE.Mesh(sphereGeo, mat)
      m.userData = { offset: t, seg }
      m.renderOrder = 3
      flowGroup.add(m)
      particles.push(m)
    }
    return { ...seg, curve, particles }
  })

  let running = false
  let speed = 1 // user multiplier: 0.5 | 1 | 2
  let ramp = 0 // eased 0 → 1 so flow spins up and coasts down
  let phase = 0
  let visible = true

  const BASE = 0.075 // cycle fractions per second at 1x

  function update(dt) {
    const target = running && visible ? 1 : 0
    ramp += (target - ramp) * Math.min(1, dt * 2.4)
    if (ramp < 0.001 && target === 0) ramp = 0

    phase = (phase + dt * BASE * speed * ramp) % 1

    for (const seg of segments) {
      if (seg.pipeMat) seg.pipeMat.emissiveIntensity = 0.12 + 0.33 * ramp
      for (const p of seg.particles) {
        const t = (phase * seg.speed + p.userData.offset) % 1
        seg.curve.getPointAt(t, p.position)
        const k = smoothstep(seg.ramp[0], seg.ramp[1], t)
        const s = seg.size[0] + (seg.size[1] - seg.size[0]) * k
        p.scale.setScalar(s * (0.35 + 0.65 * ramp))
        p.material.opacity = ramp * 0.96
        p.material.emissiveIntensity = 0.5 + 1.1 * ramp
      }
    }
  }

  return {
    flowGroup,
    pipesGroup,
    segments,
    update,
    startFlow: () => {
      running = true
    },
    stopFlow: () => {
      running = false
    },
    setSpeed: (v) => {
      speed = v
    },
    setVisible: (v) => {
      visible = v
      flowGroup.visible = v
    },
    isRunning: () => running,
    dispose: () => {
      segments.forEach((s) => {
        s.particles.forEach((p) => p.material.dispose())
        if (s.pipeMat) s.pipeMat.dispose()
      })
      sphereGeo.dispose()
      pipesGroup.traverse((o) => o.geometry && o.geometry.dispose())
    },
  }
}

export default createRefrigerantFlow
