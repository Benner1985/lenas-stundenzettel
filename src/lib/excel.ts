import type ExcelJSNamespace from 'exceljs'
import type { Entry } from '../types'
import {
  EXCEL_COLUMNS,
  EXCEL_SHEET,
  EXCEL_DATE_COLUMN,
  EXCEL_FIRST_DATA_ROW,
} from '../data/excelMapping'

// Schreibt Einträge in Lenas BESTEHENDE Datei und gibt dieselbe Datei
// zurück – keine neue. Es werden nur Zellen gefüllt; alle anderen
// Blätter, Formeln und Summen bleiben unberührt.
//
// Hinweis: Uhrzeiten werden als Excel-Bruchteil eines Tages geschrieben
// (08:00 = 8/24), damit die vorhandenen "=Ende−Beginn"-Formeln und die
// Summen weiterrechnen. Manuelle Einträge ohne Uhrzeit bekommen eine
// Startzeit (Standard 08:00) + Dauer. Diese Konvention stimmen wir final
// noch mit Lena ab.

const MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function timeFraction(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h + m / 60) / 24
}

function colNum(letters: string): number {
  let n = 0
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n
}

export interface WriteResult {
  blob: Blob
  written: number
  skipped: Entry[]
  startRow: number
}

export async function writeIntoWorkbook(
  fileData: ArrayBuffer,
  entries: Entry[],
): Promise<WriteResult> {
  // exceljs ist groß – erst beim Export nachladen (schnellerer Start)
  const ExcelJS = (await import('exceljs')).default as typeof ExcelJSNamespace
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(fileData)
  const ws = wb.getWorksheet(EXCEL_SHEET)
  if (!ws) throw new Error(`Blatt "${EXCEL_SHEET}" nicht gefunden`)

  // letzte belegte Datenzeile anhand der Datumsspalte finden
  const dateCol = colNum(EXCEL_DATE_COLUMN)
  let lastRow = EXCEL_FIRST_DATA_ROW - 1
  for (let r = EXCEL_FIRST_DATA_ROW; r <= ws.rowCount; r++) {
    if (ws.getRow(r).getCell(dateCol).value != null) lastRow = r
  }

  const startRow = lastRow + 1
  let row = startRow
  let written = 0
  const skipped: Entry[] = []

  // chronologisch, nur zugeordnete Einträge
  const toWrite = entries
    .filter((e) => e.blockId && !e.needsReview)
    .sort((a, b) => a.date.localeCompare(b.date))

  for (const e of toWrite) {
    const cols = e.blockId ? EXCEL_COLUMNS[e.blockId] : undefined
    if (!cols) {
      skipped.push(e)
      continue
    }
    const r = ws.getRow(row)
    // Datum
    const [y, mo, d] = e.date.split('-').map(Number)
    const dateCell = r.getCell(dateCol)
    dateCell.value = new Date(y, mo - 1, d)
    dateCell.numFmt = 'dd.mm.yyyy'

    // Beginn / Ende als Uhrzeit
    const begin = e.start ?? '08:00'
    const beginFrac = timeFraction(begin)
    const endFrac = e.end ? timeFraction(e.end) : beginFrac + e.hours / 24

    const beginCell = r.getCell(colNum(cols.begin))
    beginCell.value = beginFrac
    beginCell.numFmt = 'h:mm'
    const endCell = r.getCell(colNum(cols.end))
    endCell.value = endFrac
    endCell.numFmt = 'h:mm'

    // Stunden als Formel wie im Original (=Ende−Beginn)
    const hoursCell = r.getCell(colNum(cols.hours))
    hoursCell.value = { formula: `${cols.end}${row}-${cols.begin}${row}` }
    hoursCell.numFmt = 'h:mm'

    // Tätigkeit
    r.getCell(colNum(cols.taetigkeit)).value = e.title

    written++
    row++
  }

  const buffer = await wb.xlsx.writeBuffer()
  return {
    blob: new Blob([buffer], { type: MIME }),
    written,
    skipped,
    startRow,
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
