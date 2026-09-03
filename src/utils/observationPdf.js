import { createPdf, saveBlob } from './pdfWriter.js'
import { experimentMeta } from '../data/experimentData.js'
import { DIFFERENTIAL, ROOM_TEMP } from '../store/labStore.js'

const DEG = '°'

const COLUMNS = [
  { key: 'sn', label: 'S.N.', width: 34, align: 'center' },
  { key: 'time', label: 'Time (min)', width: 62, align: 'right' },
  { key: 'cabinetTemp', label: `Cabinet (${DEG}C)`, width: 68, align: 'right' },
  { key: 'freezerTemp', label: `Freezer (${DEG}C)`, width: 68, align: 'right' },
  { key: 'evaporatorTemp', label: `Evaporator (${DEG}C)`, width: 78, align: 'right' },
  { key: 'condenserTemp', label: `Condenser (${DEG}C)`, width: 78, align: 'right' },
  { key: 'frost', label: 'Frost (%)', width: 54, align: 'right' },
  { key: 'status', label: 'Compressor', width: 72, align: 'center' },
]

const INK = [0.09, 0.11, 0.15]
const MUTED = [0.42, 0.45, 0.51]
const RULE = [0.74, 0.77, 0.81]
const HEADER_FILL = [0.87, 0.9, 0.94]
const BAND_FILL = [0.955, 0.965, 0.975]

const MARGIN = 40
const ROW_HEIGHT = 17
const HEADER_HEIGHT = 20
const PAD = 6

const NOTE =
  'Time is measured from the moment the supply was switched ON. Note the cabinet temperature at ' +
  'cut-out and at the following cut-in; their difference is the thermostat differential.'

const mmss = (seconds) => {
  const s = Math.max(0, Math.round(seconds))
  return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`
}

const stamp = (date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/` +
  `${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:` +
  `${String(date.getMinutes()).padStart(2, '0')}`

/**
 * Render the recorded observations as a printable A4 report.
 *
 * @param {Array<object>} rows  observations from the store
 * @param {object} summary      run conditions shown above the table
 */
export function buildObservationPdf(rows, summary = {}) {
  const doc = createPdf({
    title: `Experiment ${experimentMeta.number} - ${experimentMeta.title}`,
    author: experimentMeta.faculty,
  })
  const right = doc.width - MARGIN
  const tableWidth = COLUMNS.reduce((sum, c) => sum + c.width, 0)

  const conditions = [
    ['Thermostat setting', `${summary.thermostatSetting ?? '-'} ${DEG}C`],
    ['Thermostat differential', `${DIFFERENTIAL} ${DEG}C`],
    ['Room temperature', `${ROOM_TEMP} ${DEG}C`],
    ['Cut-out / cut-in', `${summary.thermostatSetting ?? '-'} ${DEG}C / ${(summary.thermostatSetting ?? 0) + DIFFERENTIAL} ${DEG}C`],
    ['Completed cycles', String(summary.cycleCount ?? 0)],
    ['Compressor run time', mmss(summary.runSeconds ?? 0)],
    ['Frost on evaporator', `${Math.round((summary.frostThickness ?? 0) * 100)} %`],
    ['Readings recorded', String(rows.length)],
  ]

  /** Page furniture. Returns the y coordinate the table may start at. */
  const startPage = (withConditions) => {
    doc.addPage()
    let y = doc.height - MARGIN - 6

    doc.text('Virtual Refrigeration & Air Conditioning Lab', MARGIN, y, { size: 14.5, bold: true })
    doc.text(`Experiment No. ${experimentMeta.number}`, right, y, {
      size: 10,
      bold: true,
      color: MUTED,
      align: 'right',
    })
    y -= 15
    doc.text(experimentMeta.title, MARGIN, y, { size: 10.5, color: INK })
    doc.text(experimentMeta.subject, right, y, { size: 9, color: MUTED, align: 'right' })
    y -= 9
    doc.line(MARGIN, y, right, y, { color: RULE, lineWidth: 1 })
    y -= 20

    if (withConditions) {
      doc.text('OBSERVATION CONDITIONS', MARGIN, y, { size: 8.5, bold: true, color: MUTED })
      y -= 13
      const colWidth = (right - MARGIN) / 2
      for (let i = 0; i < conditions.length; i += 2) {
        conditions.slice(i, i + 2).forEach(([label, value], col) => {
          const x = MARGIN + col * colWidth
          doc.text(`${label}:`, x, y, { size: 9.5, color: MUTED })
          doc.text(value, x + 118, y, { size: 9.5, bold: true, color: INK })
        })
        y -= 14
      }
      y -= 6
      doc.text('OBSERVATION TABLE', MARGIN, y, { size: 8.5, bold: true, color: MUTED })
      y -= 14
    }
    return y
  }

  /** Column header band, drawn at the top of the table on every page. */
  const drawHead = (y) => {
    doc.rect(MARGIN, y - HEADER_HEIGHT, tableWidth, HEADER_HEIGHT, HEADER_FILL)
    let x = MARGIN
    for (const col of COLUMNS) {
      const anchor =
        col.align === 'right' ? x + col.width - PAD : col.align === 'center' ? x + col.width / 2 : x + PAD
      doc.text(col.label, anchor, y - HEADER_HEIGHT + 6.5, {
        size: 8.2,
        bold: true,
        align: col.align,
        color: INK,
      })
      x += col.width
    }
    return y - HEADER_HEIGHT
  }

  const drawRow = (y, row, index) => {
    const top = y
    const bottom = y - ROW_HEIGHT
    if (index % 2 === 1) doc.rect(MARGIN, bottom, tableWidth, ROW_HEIGHT, BAND_FILL)
    let x = MARGIN
    for (const col of COLUMNS) {
      const value = row[col.key]
      const anchor =
        col.align === 'right' ? x + col.width - PAD : col.align === 'center' ? x + col.width / 2 : x + PAD
      doc.text(value === undefined || value === null ? '-' : String(value), anchor, bottom + 5.5, {
        size: 9,
        align: col.align,
        color: INK,
      })
      x += col.width
    }
    doc.line(MARGIN, bottom, MARGIN + tableWidth, bottom, { color: RULE, lineWidth: 0.4 })
    return bottom
  }

  const bodyLimit = MARGIN + 96 // leave room for the note and the signature block
  let y = startPage(true)
  y = drawHead(y)
  let index = 0

  for (const row of rows) {
    if (y - ROW_HEIGHT < bodyLimit) {
      y = startPage(false)
      y = drawHead(y)
    }
    y = drawRow(y, row, index)
    index += 1
  }

  if (rows.length === 0) {
    doc.text('No readings were recorded.', MARGIN + PAD, y - 12, { size: 9, color: MUTED })
    y -= ROW_HEIGHT
  }

  // Table outline
  doc.line(MARGIN, y, MARGIN + tableWidth, y, { color: RULE, lineWidth: 0.8 })

  // Closing note and signature block, on the final page
  y -= 24
  for (const line of doc.wrap(NOTE, right - MARGIN, 9)) {
    doc.text(line, MARGIN, y, { size: 9, color: MUTED })
    y -= 12
  }
  y -= 16
  doc.text('Date: ______________________', MARGIN, y, { size: 9.5, color: INK })
  doc.text('Signature of the faculty: ______________________', right, y, {
    size: 9.5,
    color: INK,
    align: 'right',
  })

  // Footer on every page
  const generated = `Generated by the Virtual Refrigeration & AC Lab on ${stamp(new Date())}`
  const pages = doc.pageCount
  for (let i = 0; i < pages; i++) {
    doc.selectPage(i)
    doc.line(MARGIN, MARGIN + 22, right, MARGIN + 22, { color: RULE, lineWidth: 0.4 })
    doc.text(generated, MARGIN, MARGIN + 10, { size: 8, color: MUTED })
    doc.text(`Page ${i + 1} of ${pages}`, right, MARGIN + 10, { size: 8, color: MUTED, align: 'right' })
  }

  return doc.toBlob()
}

/** Build the report and hand it to the browser as a download. */
export function downloadObservationPdf(rows, summary) {
  saveBlob(buildObservationPdf(rows, summary), `observation_table_experiment_${experimentMeta.number}.pdf`)
}

export default downloadObservationPdf
