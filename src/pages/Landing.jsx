import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/ui/Navbar.jsx'
import { experimentMeta } from '../data/experimentData.js'

const experiments = [
  {
    n: 1,
    title: 'Study of Household / Domestic Refrigerator',
    tag: 'Vapour Compression Cycle',
    ready: true,
  },
  { n: 2, title: 'Study of Window / Split Air Conditioner', tag: 'Air Conditioning', ready: false },
  { n: 3, title: 'Study of Ice Plant / Cold Storage', tag: 'Refrigeration Plant', ready: false },
  { n: 4, title: 'Determination of COP of a Refrigeration Test Rig', tag: 'Performance', ready: false },
]

function ExpBody({ e }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-lab-blue/20 text-[11px] font-bold text-lab-blue">
          {e.n}
        </span>
        <span className="lab-label">{e.tag}</span>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            e.ready ? 'bg-lab-green/20 text-lab-green' : 'bg-lab-card text-lab-muted'
          }`}
        >
          {e.ready ? 'Available' : 'Coming soon'}
        </span>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-white">{e.title}</h3>
    </>
  )
}

export default function Landing() {
  return (
    <div className="flex h-screen flex-col bg-lab-bg">
      <Navbar />
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-5xl"
        >
          <p className="lab-label">{experimentMeta.subject}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Virtual Refrigeration &amp; Air&nbsp;Conditioning Lab
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-gray-300">
            An interactive 3D laboratory. Read the digital manual, then run the animated vapour
            compression cycle on a full refrigerator model — thermostat cycling, refrigerant flow,
            frost build-up and defrosting, with live readings you can export for your journal.
          </p>
          <p className="mt-2 text-[13px] text-lab-muted">Faculty: {experimentMeta.faculty}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/manual"
              className="rounded-xl bg-lab-blue px-6 py-3 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-blue-500"
            >
              📖 Open Lab Manual
            </Link>
            <Link
              to="/simulation"
              className="rounded-xl border border-lab-border bg-lab-card px-6 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-lab-cold hover:text-white"
            >
              ▶ Go straight to Simulation
            </Link>
          </div>

          <h2 className="lab-label mt-10">Experiment list</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {experiments.map((e) => (
              <li key={e.n}>
                {e.ready ? (
                  <Link
                    to="/manual"
                    className="lab-card block h-full px-5 py-4 transition-all hover:border-lab-blue hover:shadow-glow"
                  >
                    <ExpBody e={e} />
                  </Link>
                ) : (
                  <div className="lab-card h-full cursor-not-allowed px-5 py-4 opacity-50">
                    <ExpBody e={e} />
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ['🧊', 'Full 3D model', 'Compressor, condenser, capillary tube, evaporator and thermostat — all clickable.'],
              ['🌡️', 'Real cycling', 'Thermostat cut-in / cut-out with a 6 °C differential and frost-dependent efficiency.'],
              ['📊', 'Lab record', 'Record readings at intervals and export the observation table as a PDF.'],
            ].map(([icon, t, d]) => (
              <div key={t} className="lab-panel px-5 py-4">
                <div className="text-lg" aria-hidden="true">
                  {icon}
                </div>
                <h3 className="mt-1.5 text-sm font-semibold text-white">{t}</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-gray-400">{d}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  )
}
