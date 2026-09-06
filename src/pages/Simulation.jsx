import { useState } from 'react'
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

/**
 * The simulation room. The shell (navbar, route curtain) lives in App.jsx;
 * this page is only the room itself — sidebar, 3D canvas, control panel,
 * the reading strip, and the observation-table dialog.
 */
export default function Simulation() {
  const { canvasRef, engineRef, ready } = useThreeScene()
  useSimulation()

  const [tableOpen, setTableOpen] = useState(false)
  const reset = useLabStore((s) => s.reset)

  return (
    <>
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
    </>
  )
}
