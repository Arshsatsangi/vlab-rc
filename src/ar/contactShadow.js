import * as THREE from 'three'

/**
 * A soft blob under the unit so it reads as standing on the floor rather than
 * floating. A real shadow map would need a receiver surface, which AR does not
 * have — this is a radial-gradient texture on a ground-facing plane instead.
 *
 * It is added to the placement group, so it inherits the AR scale for free.
 */
export function createContactShadow({ width = 1.34, depth = 0.98, opacity = 0.4 } = {}) {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(0,0,0,0.9)')
  g.addColorStop(0.45, 'rgba(0,0,0,0.45)')
  g.addColorStop(0.75, 'rgba(0,0,0,0.12)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity,
      // Draw flat on the floor without punching a hole in the depth buffer, so
      // the legs still occlude it where they overlap.
      depthWrite: false,
      toneMapped: false,
    })
  )
  mesh.rotation.x = -Math.PI / 2
  // The model's base sits at y = -1 in local units; keep the blob just under it
  mesh.position.y = -0.998
  mesh.name = 'arContactShadow'
  mesh.renderOrder = -1

  return {
    mesh,
    dispose() {
      mesh.geometry.dispose()
      texture.dispose()
      mesh.material.dispose()
      mesh.removeFromParent()
    },
  }
}

export default createContactShadow
