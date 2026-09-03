import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Manual from './pages/Manual.jsx'
import Simulation from './pages/Simulation.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/manual" element={<Manual />} />
      <Route path="/simulation" element={<Simulation />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
