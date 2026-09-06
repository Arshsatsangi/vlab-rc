import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../components/ui/Icon.jsx'
import CycleHero from '../components/landing/CycleHero.jsx'
import CountUp from '../components/landing/CountUp.jsx'
import FrostAmbient from '../components/landing/FrostAmbient.jsx'
import { experimentMeta } from '../data/experimentData.js'
import { riseIn, staggerContainer } from '../motion/tokens.js'

const experiments = [
  {
    n: 1,
    title: 'Study of Household / Domestic Refrigerator',
    tag: 'Vapour compression cycle',
    ready: true,
  },
  { n: 2, title: 'Study of Window / Split Air Conditioner', tag: 'Air conditioning', ready: false },
  { n: 3, title: 'Study of Ice Plant / Cold Storage', tag: 'Refrigeration plant', ready: false },
  {
    n: 4,
    title: 'Determination of COP of a Refrigeration Test Rig',
    tag: 'Performance',
    ready: false,
  },
]

/* The numbers a technician would quote about this rig. */
const STATS = [
  { value: 5, pad: 2, label: 'components, every one clickable' },
  { value: 10, suffix: ' Hz', label: 'live instrument sampling' },
  { value: 6, suffix: ' °C', label: 'thermostat cut differential' },
  { text: 'PDF', label: 'observation journal export' },
]

function Chip({ ready }) {
  return (
    <span
      className={`rounded-inst border px-2 py-0.5 text-[10px] font-medium transition-colors duration-200 ${
        ready ? 'border-lab-copper/50 text-lab-copper' : 'border-lab-border text-lab-muted'
      }`}
    >
      {ready ? 'Available' : 'Coming soon'}
    </span>
  )
}

/** Machinist's registration marks on the hero panel's corners. */
function CornerTicks() {
  const tick = 'pointer-events-none absolute h-2.5 w-2.5 border-lab-copper/60'
  return (
    <>
      <span aria-hidden="true" className={`${tick} -left-px -top-px border-l border-t`} />
      <span aria-hidden="true" className={`${tick} -right-px -top-px border-r border-t`} />
      <span aria-hidden="true" className={`${tick} -bottom-px -left-px border-b border-l`} />
      <span aria-hidden="true" className={`${tick} -bottom-px -right-px border-b border-r`} />
    </>
  )
}

export default function Landing() {
  return (
    <main className="flex-1 overflow-y-auto px-4 py-8">
      <motion.div
        variants={staggerContainer(0.07, 0.05)}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-5xl"
      >
        <motion.p variants={riseIn} className="lab-label">
          {experimentMeta.subject}
        </motion.p>

        {/* The nameplate: metal type with one warm band of light across it. */}
        <motion.h1
          variants={riseIn}
          className="mt-2 max-w-2xl text-[27.5px] font-semibold leading-tight sm:text-[39px]"
        >
          <span className="text-metal">Virtual Refrigeration &amp; Air&nbsp;Conditioning Lab</span>
        </motion.h1>

        <motion.p
          variants={riseIn}
          className="mt-3 max-w-2xl text-[15px] leading-relaxed text-lab-muted"
        >
          An interactive 3D laboratory. Read the digital manual, then run the vapour compression
          cycle on a full refrigerator model — thermostat cycling, refrigerant flow, frost
          build-up and defrosting, with live readings you can export for your journal.
        </motion.p>
        <motion.p variants={riseIn} className="mt-2 text-[13px] text-lab-muted">
          Faculty: {experimentMeta.faculty}
        </motion.p>

        <motion.div variants={riseIn} className="mt-6 flex flex-wrap gap-3">
          <Link to="/manual" className="lab-cta">
            <Icon name="book" />
            Open the manual
          </Link>
          <Link
            to="/simulation"
            className="lab-btn group inline-flex items-center gap-2 px-6 py-3"
          >
            Go straight to the simulation
            <Icon
              name="arrow"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </motion.div>

        {/* The instrument strip: the numbers enter by counting up, once. */}
        <motion.div
          variants={riseIn}
          className="mt-8 grid grid-cols-2 gap-px border border-lab-border bg-lab-border sm:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label} className="bg-lab-panel px-5 py-4">
              <div className="lab-readout text-xl font-semibold text-lab-copper">
                {s.text ?? <CountUp to={s.value} pad={s.pad} suffix={s.suffix} />}
              </div>
              <div className="mt-1 text-[10.5px] leading-tight text-lab-muted">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* The hero: the most characteristic image in the subject's world, moving,
            with the cold side breathing behind it and frost motes off the coil. */}
        <motion.div variants={riseIn} className="lab-panel relative mt-8 p-4 sm:p-6">
          <CornerTicks />
          <FrostAmbient />
          <div className="relative flex items-center justify-between pb-3">
            <span className="lab-readout text-[10px] tracking-wide text-lab-muted">
              FIG. 01 — VAPOUR COMPRESSION CYCLE
            </span>
            <span className="lab-readout hidden text-[10px] text-lab-suction/80 sm:block">
              R-134a · CLOSED LOOP
            </span>
          </div>
          <div className="relative">
            <CycleHero />
          </div>
        </motion.div>

        <motion.h2 variants={riseIn} className="lab-label mt-10">
          Experiment list
        </motion.h2>
        <motion.ul
          variants={staggerContainer(0.06, 0.15)}
          className="lab-panel mt-3 divide-y divide-lab-border/70"
        >
            {experiments.map((e) => {
              const row = (
                <>
                  <span className="lab-readout w-7 shrink-0 text-[13px] text-lab-copper">
                    {String(e.n).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14px] font-semibold text-lab-enamel">
                      {e.title}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-lab-muted">{e.tag}</p>
                  </div>
                  <Chip ready={e.ready} />
                </>
              )
              return (
                <motion.li key={e.n} variants={riseIn} className="group relative">
                  {e.ready ? (
                    <Link
                      to="/manual"
                      className="relative flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-lab-card"
                    >
                      {/* A copper hairline waking up along the row's edge. */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-lab-copper transition-transform duration-200 ease-out group-hover:scale-y-100"
                      />
                      {row}
                      <Icon
                        name="arrow"
                        size={14}
                        className="shrink-0 text-lab-copper opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 px-5 py-4 opacity-50">{row}</div>
                  )}
                </motion.li>
              )
            })}
          </motion.ul>

          <motion.div
            variants={riseIn}
            className="mt-8 grid gap-px border border-lab-border bg-lab-border sm:grid-cols-3"
          >
            {[
              [
                'Full 3D model',
                'Compressor, condenser, capillary tube, evaporator and thermostat — all clickable.',
              ],
              [
                'Real cycling',
                'Thermostat cut-in / cut-out with a 6 °C differential and frost-dependent efficiency.',
              ],
              [
                'Lab record',
                'Record readings at intervals and export the observation table as a PDF.',
              ],
            ].map(([t, d]) => (
              <div
                key={t}
                className="group relative overflow-hidden bg-lab-panel px-5 py-4 transition-colors duration-200 hover:bg-lab-card"
              >
                {/* One pass of light along the card's top edge. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lab-copper/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <h3 className="text-[13px] font-semibold text-lab-enamel">{t}</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-lab-muted">{d}</p>
              </div>
            ))}
          </motion.div>

          <motion.p
            variants={riseIn}
            className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-lab-border/70 pt-4 text-[10px] text-lab-muted"
          >
            <span className="lab-readout tracking-wide">VCRC · EXP-01 · CLOSED LOOP</span>
            <span>Colour is information here — the gauge convention runs the palette.</span>
          </motion.p>
        </motion.div>
      </main>
  )
}
