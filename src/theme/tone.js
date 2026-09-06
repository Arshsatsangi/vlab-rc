/**
 * The two colour vocabularies the interface speaks, as plain data.
 *
 * These live outside both the store and the components because both need them:
 * the store derives a status colour, the instrument panel paints with it, and
 * neither should have to import the other to agree on what "Running" looks like.
 * The hexes here are the same ones declared in tailwind.config.js — this module
 * is for the places that need a colour as a *value* (SVG attributes, canvas,
 * three.js materials) rather than as a class.
 */

/**
 * SIDE — which side of the refrigeration circuit a number belongs to. This is
 * the gauge-manifold convention a technician already reads: blue on the low
 * side, red on the high side, copper for the throttling step, frost for the
 * evaporator skin. Colour here is information, not decoration.
 */
export const SIDE = {
  suction: '#4fa8c4',
  discharge: '#d2452c',
  copper: '#c48a4a',
  frost: '#b9d3d6',
  enamel: '#e8ebe4',
  muted: '#8a9690',
  plant: '#121815',
  border: '#2c3831',
}

/**
 * STATUS_TONE — machine state. State is not a circuit side, so these stay
 * deliberately quieter than the manifold colours: a desaturated machine green
 * for running, frost for the cold wait between cycles, copper for the warm
 * defrost wash, muted grey for off.
 */
export const STATUS_TONE = {
  Running: '#7ba870',
  'Idle (cut-out)': '#b9d3d6',
  Defrosting: '#c48a4a',
  Off: '#8a9690',
}

/** The tone for a status label, falling back to muted for anything unknown. */
export const statusTone = (label) => STATUS_TONE[label] || SIDE.muted
