import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/ui/Navbar.jsx'
import Sidebar from '../components/ui/Sidebar.jsx'
import Modal from '../components/ui/Modal.jsx'
import SceneCanvas from '../components/simulation/SceneCanvas.jsx'
import ComponentLabels from '../components/simulation/ComponentLabels.jsx'
import ComponentInfoPanel from '../components/simulation/ComponentInfoPanel.jsx'
import VCRCycleFlow from '../components/simulation/VCRCycleFlow.jsx'
import RefrigeratorModel from '../components/simulation/RefrigeratorModel.jsx'
import ControlPanel from '../components/simulation/ControlPanel.jsx'
import DataReadings from '../components/simulation/DataReadings.jsx'
import ObservationTable from '../components/simulation/ObservationTable.jsx'
import useThreeScene from '../hooks/useThreeScene.js'
import useSimulation from '../hooks/useSimulation.js'
import { useLabStore } from '../store/labStore.js'
import { viva } from '../data/componentInfo.js'

export default function Simulation() {
  const { canvasRef, engineRef, ready } = useThreeScene()
  useSimulation()

  const [tableOpen, setTableOpen] = useState(false)
  const [vivaOpen, setVivaOpen] = useState(false)
  const reset = useLabStore((s) => s.reset)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-lab-bg">
      <Navbar
        right={
          <>
            <button onClick={() => setVivaOpen(true)} className="lab-btn ml-2 !py-1.5">
              🎓 Viva
            </button>
            <Link to="/manual" className="lab-btn !py-1.5">
              📖 Manual
            </Link>
          </>
        }
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <SceneCanvas canvasRef={canvasRef} ready={ready}>
          {ready && <ComponentLabels engineRef={engineRef} />}
          <ComponentInfoPanel />
          <VCRCycleFlow />
          <RefrigeratorModel />
        </SceneCanvas>
        <ControlPanel
          onOpenTable={() => setTableOpen(true)}
          onReset={reset}
          engineRef={engineRef}
        />
      </div>

      <DataReadings />
      <Modal
        open={tableOpen}
        onClose={() => setTableOpen(false)}
        title="Observation Table"
        subtitle="Experiment 1 — Study of Household / Domestic Refrigerator"
      >
        <ObservationTable />
      </Modal>

      <Modal
        open={vivaOpen}
        onClose={() => setVivaOpen(false)}
        title="Viva Questions"
        subtitle="Expected questions for this experiment"
      >
        <ol className="space-y-3">
          {viva.map((v, i) => (
            <li key={i} className="lab-card px-4 py-3">
              <p className="text-[13px] font-semibold text-white">
                {i + 1}. {v.q}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-gray-300">{v.a}</p>
            </li>
          ))}
        </ol>
      </Modal>
    </div>
  )
}
