/**
 * Where AR mounts its DOM.
 *
 * The video feed lives behind the canvas and the HUD lives above it, both owned
 * by React components, while the session that needs them is a module singleton
 * started from a third component. A shared slot object is the smallest honest
 * answer: there is exactly one canvas and one HUD in this app.
 *
 * It is a separate module so that `SceneCanvas` can fill a slot without pulling
 * the AR controller — and the whole AR chunk — into the initial bundle.
 */
export const arDom = {
  /** Full-bleed layer behind the transparent canvas, for the camera feed. */
  videoLayer: null,
  /** Overlay root passed to WebXR as `domOverlay`, and the Tier 1 gesture surface. */
  hudRoot: null,
}

export default arDom
