/**
 * Motion tokens — the app's single motion vocabulary.
 *
 * Durations and curves mirror the skill's motion guidance: entrances land in
 * 300–500ms on a strong ease-out, micro-interactions stay under 250ms, and
 * everything degrades to stillness under `prefers-reduced-motion` (handled
 * globally by <MotionConfig reducedMotion="user"> in main.jsx plus the CSS
 * guard in index.css).
 */

/** The signature ease — matches the `rise`/`draw` curves in tailwind.config.js. */
export const EASE_OUT = [0.2, 0.7, 0.3, 1]

/** The drawing ease — used when schematic strokes pull themselves in. */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1]

/**
 * riseIn — one element entering. Kept to 10px of travel so it reads as a
 * fade that settles, not a slide (skill rule: y offset 8–16px max).
 */
export const riseIn = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
}

/**
 * staggerContainer — wrap a group; children carrying `riseIn` enter in
 * circuit order. `delayChildren` buys a beat for the element above it.
 */
export const staggerContainer = (staggerChildren = 0.07, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})