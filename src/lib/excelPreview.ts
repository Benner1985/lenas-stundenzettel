import type ExcelJSNamespace from 'exceljs'
import type { Entry } from '../types'
import { EXCEL_COLUMNS, EXCEL_SHEET, EXCEL_DATE_COLUMN } from '../data/excelMapping'

// Liest aus Lenas echter Excel-Vorlage die Basis-Infos aus, damit wir eine
// Vorschau zeigen können, wie die Datei NACH dem Eintragen aussieht:
//  - wo die neuen Zeilen eingefügt werden (letzte Datenzeile)
//  - die aktuellen Summen je genutztem Block (zwischengespeicherter Wert)

const FIRST_DATA_ROW = 10

function colNum(letters: string): number {
  let n = 0
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n
}

export interface TemplateBase {
  lastDataRow: number
  sumRow: number
  /** aktuelle Summe je blockId, in Stunden (aus der Excel übernommen). */
  oldHoursByBlock: Record<string, number>
}

export async function parseTemplateBase(fileData: ArrayBuffer): Promise<TemplateBase> {
  const ExcelJS = (await import('exceljs')).default as typeof ExcelJSNamespace
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(fileData)
  const ws = wb.getWorksheet(EXCEL_SHEET)
  if (!ws) throw new Error(`Blatt "${EXCEL_SHEET}" nicht gefunden`)

  const dateCol = colNum(EXCEL_DATE_COLUMN)
  let lastDataRow = FIRST_DATA_ROW - 1
  for (let r = FIRST_DATA_ROW; r <= ws.rowCount; r++) {
    if (ws.getRow(r).getCell(dateCol).value instanceof Date) lastDataRow = r
  }

  // Summenzeile: erste Zeile darunter mit "Summe…" in Spalte A
  let sumRow = lastDataRow + 1
  for (let r = lastDataRow + 1; r <= ws.rowCount; r++) {
    const v = ws.getRow(r).getCell(dateCol).value
    if (typeof v === 'string' && v.includes('Summe')) {
      sumRow = r
      break
    }
  }

  const oldHoursByBlock: Record<string, number> = {}
  for (const [blockId, cols] of Object.entries(EXCEL_COLUMNS)) {
    const cell = ws.getCell(`${cols.hours}${sumRow}`)
    // zwischengespeicherter Formelwert (Bruchteil eines Tages) -> Stunden
    const frac = typeof cell.result === 'number' ? cell.result : 0
    oldHoursByBlock[blockId] = frac * 24
  }

  return { lastDataRow, sumRow, oldHoursByBlock }
}

export interface PreviewRow {
  excelRow: number
  date: string
  blockId: string
  begin: string
  end: string
  hours: number
  title: string
}

export interface PreviewData {
  rows: PreviewRow[]
  usedBlocks: string[]
  /** je blockId: alte Summe, neue Summe und der Zuwachs (Stunden) */
  totals: Record<string, { old: number; neu: number; add: number }>
}

function addHours(hhmm: string, hours: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  let total = h * 60 + m + Math.round(hours * 60)
  total = ((total % 1440) + 1440) % 1440
  const hh = Math.floor(total / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

/** Baut die Vorschau-Zeilen aus den Einträgen + der Vorlagen-Basis (ohne erneutes Parsen). */
export function buildPreviewRows(entries: Entry[], base: TemplateBase): PreviewData {
  const toWrite = entries
    .filter((e) => e.blockId && !e.needsReview && EXCEL_COLUMNS[e.blockId])
    .sort((a, b) => a.date.localeCompare(b.date))

  const rows: PreviewRow[] = toWrite.map((e, i) => {
    const begin = e.start ?? '08:00'
    return {
      excelRow: base.lastDataRow + 1 + i,
      date: e.date,
      blockId: e.blockId as string,
      begin,
      end: e.end ?? addHours(begin, e.hours),
      hours: e.hours,
      title: e.title,
    }
  })

  const usedBlocks = [...new Set(toWrite.map((e) => e.blockId as string))]
  const totals: Record<string, { old: number; neu: number; add: number }> = {}
  for (const b of usedBlocks) {
    const add = toWrite.filter((e) => e.blockId === b).reduce((s, e) => s + e.hours, 0)
    const old = base.oldHoursByBlock[b] ?? 0
    totals[b] = { old, neu: old + add, add }
  }

  return { rows, usedBlocks, totals }
}
