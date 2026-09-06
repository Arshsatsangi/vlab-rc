import { useCallback, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Landing from './pages/Landing.jsx'
import Manual from './pages/Manual.jsx'
import Simulation from './pages/Simulation.jsx'
import Navbar from './components/ui/Navbar.jsx'
import BootSplash from './components/ui/BootSplash.jsx'
import PageShell from './motion/PageShell.jsx'

/**
 * Routes wrapped so a change of page reads as a crossfade, not a swap.
 * The key on <Routes> is what lets AnimatePresence hold the outgoing page
 * for the 0.28s the curtain needs.
 */
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageShell>
              <Landing />
            </PageShell>
          }
        />
        <Route
          path="/manual"
          element={
            <PageShell>
              <Manual />
            </PageShell>
          }
        />
        <Route
          path="/simulation"
          element={
            <PageShell>
              <Simulation />
            </PageShell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  // The boot sequence runs once per page load; it also masks the three.js
  // scene's first paint on deep links into /simulation.
  const [booted, setBooted] = useState(false)
  const finishBoot = useCallback(() => setBooted(true), [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-lab-bg">
      <AnimatePresence>
        {!booted && <BootSplash key="boot" onDone={finishBoot} />}
      </AnimatePresence>

      {/* The shell persists; only the room behind it changes. */}
      <Navbar />
      {booted && <AnimatedRoutes />}
    </div>
  )
}
