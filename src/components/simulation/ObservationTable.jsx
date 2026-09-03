import { useLabStore } from '../../store/labStore.js'
import { downloadObservationPdf } from '../../utils/observationPdf.js'

const COLUMNS = [
  ['sn', 'S.N.'],
  ['time', 'Time (min)'],
  ['cabinetTemp', 'Cabinet Temp (°C)'],
  ['freezerTemp', 'Freezer Temp (°C)'],
  ['evaporatorTemp', 'Evaporator (°C)'],
  ['condenserTemp', 'Condenser (°C)'],
  ['frost', 'Frost (%)'],
  ['status', 'Compressor'],
]

/** Observation table — record, review, export. */
export default function ObservationTable() {
  const rows = useLabStore((s) => s.observations)
  const record = useLabStore((s) => s.recordReading)
  const clear = useLabStore((s) => s.clearObservations)
  const isPowered = useLabStore((s) => s.isPowered)

  // Read the run conditions at click time — no need to re-render on every tick
  const exportPdf = () => {
    const s = useLabStore.getState()
    downloadObservationPdf(s.observations, {
      thermostatSetting: s.thermostatSetting,
      cycleCount: s.cycleCount,
      runSeconds: s.runSeconds,
      frostThickness: s.frostThickness,
    })
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={record}
          disabled={!isPowered}
          title={isPowered ? 'Record the present readings' : 'Switch the supply ON to record readings'}
          className={`lab-btn ${isPowered ? 'lab-btn-active' : ''}`}
        >
          ✚ Record Reading
        </button>
        <button
          onClick={exportPdf}
          disabled={rows.length === 0}
          className="lab-btn"
        >
          ⭳ Download PDF
        </button>
        <button onClick={clear} disabled={rows.length === 0} className="lab-btn">
          ✕ Clear Table
        </button>
        {!isPowered && (
          <span className="text-[11px] text-lab-amber">
            Supply is OFF — switch the refrigerator ON to record readings.
          </span>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-lab-border px-4 py-8 text-center text-[12.5px] text-lab-muted">
          No readings yet. Start the refrigerator and press <strong>Record Reading</strong> at
          regular intervals to build your observation table.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-lab-border">
          <table className="w-full border-collapse text-left">
            <thead className="bg-lab-card">
              <tr>
                {COLUMNS.map(([key, label]) => (
                  <th
                    key={key}
                    className="whitespace-nowrap px-3 py-2 text-[10px] uppercase tracking-wider text-lab-muted"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lab-border/70">
              {rows.map((r) => (
                <tr key={r.sn} className="hover:bg-lab-card/60">
                  {COLUMNS.map(([key]) => (
                    <td key={key} className="whitespace-nowrap px-3 py-1.5">
                      {key === 'status' ? (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            r.status === 'ON'
                              ? 'bg-lab-green/20 text-lab-green'
                              : r.status === 'DEFROST'
                                ? 'bg-lab-amber/20 text-lab-amber'
                                : 'bg-lab-border/60 text-gray-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      ) : (
                        <span className="lab-readout text-[12px] text-gray-200">{r[key]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[11px] leading-relaxed text-lab-muted">
        Time is measured from the moment the supply was switched ON. Note the cabinet temperature at
        cut-out and at the following cut-in; their difference is the thermostat differential.
      </p>
    </div>
  )
}
