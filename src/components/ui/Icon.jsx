/**
 * The app's drawn glyph set — sixteen pixels, 1.5 stroke, `currentColor`.
 *
 * These exist so the interface never leans on emoji: an emoji is a sticker whose
 * artwork changes with the platform, while these are part of the instrument panel
 * they sit on. Colour is inherited, so a glyph tints with the state of its button.
 */
const GLYPHS = {
  power: (
    <>
      <path d="M8 1.9v5.35" />
      <path d="M11.75 4.2a5.2 5.2 0 1 1-7.5 0" />
    </>
  ),
  door: (
    <>
      <rect x="3.25" y="2.25" width="9.5" height="11.5" rx="1" />
      <path d="M10.7 8.4h.01" />
    </>
  ),
  snowflake: (
    <>
      <path d="M8 1.75v12.5" />
      <path d="M2.9 4.9l10.2 6.2" />
      <path d="M13.1 4.9L2.9 11.1" />
    </>
  ),
  camera: (
    <>
      <rect x="2.25" y="4.75" width="11.5" height="8.5" rx="1.25" />
      <path d="M5.6 4.75l.9-1.85h3l.9 1.85" />
      <circle cx="8" cy="8.75" r="2.4" />
    </>
  ),
  record: (
    <>
      <circle cx="8" cy="8" r="5.75" />
      <circle cx="8" cy="8" r="2.1" fill="currentColor" stroke="none" />
    </>
  ),
  table: (
    <>
      <rect x="2.25" y="3.25" width="11.5" height="9.5" rx="1" />
      <path d="M2.25 6.75h11.5M6.1 6.75v6M10 6.75v6" />
    </>
  ),
  book: (
    <>
      <path d="M8 3.9C6.7 2.9 4.7 2.65 2.4 3v9.4c2.3-.35 4.3-.1 5.6.9 1.3-1 3.3-1.25 5.6-.9V3c-2.3-.35-4.3-.1-5.6.9z" />
      <path d="M8 3.9v9.4" />
    </>
  ),
  play: <path d="M5.1 3.1v9.8l8-4.9-8-4.9z" />,
  cursor: (
    <path d="M4.4 2.4l8 6-3.6.5 2 3.9-1.7.9-2-3.9-2.7 2.4z" fill="currentColor" stroke="none" />
  ),
  target: (
    <>
      <circle cx="8" cy="8" r="5.4" />
      <circle cx="8" cy="8" r="2.1" />
      <path d="M8 1.4v1.9M8 12.7v1.9M1.4 8h1.9M12.7 8h1.9" />
    </>
  ),
  gauge: (
    <>
      <path d="M2.5 11.25a5.5 5.5 0 0 1 11 0" />
      <path d="M8 11.25l2.6-3.6" />
      <path d="M2.5 11.25h11" />
    </>
  ),
  zoom: (
    <>
      <circle cx="7.25" cy="7.25" r="4.5" />
      <path d="M10.6 10.6l3.15 3.15" />
      <path d="M5.4 7.25h3.7M7.25 5.4v3.7" />
    </>
  ),
  reset: (
    <>
      <path d="M2.9 8.2a5.2 5.2 0 1 0 1.55-3.7" />
      <path d="M2.9 2v3h3" />
    </>
  ),
  close: (
    <>
      <path d="M3.75 3.75l8.5 8.5" />
      <path d="M12.25 3.75l-8.5 8.5" />
    </>
  ),
  arrow: <path d="M2.5 8h10M9.25 4.75L12.5 8l-3.25 3.25" />,
}

export default function Icon({ name, size = 16, className, ...rest }) {
  const glyph = GLYPHS[name]
  if (!glyph) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {glyph}
    </svg>
  )
}
