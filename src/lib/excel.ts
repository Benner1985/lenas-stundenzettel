import type ExcelJSNamespace from 'exceljs'
import type { Entry } from '../types'
import { EXCEL_COLUMNS, EXCEL_SHEET, EXCEL_DATE_COLUMN } from '../data/excelMapping'

// Schreibt Einträge in Lenas BESTEHENDE Datei und gibt dieselbe Datei
// zurück – keine neue.
//
// Vorgehen (an Lenas echter Datei getestet):
//  1. Echte letzte Datenzeile finden = letztes *Datum* in Spalte A
//     (die Summen-Beschriftungen darunter zählen nicht als Daten).
//  2. Für die neuen Einträge so viele Zeilen EINFÜGEN – direkt vor den
//     Summen. Dadurch rückt der Summenblock nach unten.
//  3. Einträge in die neuen Zeilen schreiben (Datum, Beginn/Ende als
//     Uhrzeit, Stunden = "=Ende−Beginn", Tätigkeit).
//  4. Die Summen-Formeln mitziehen: Bereiche, die an der alten letzten
//     Zeile endeten, bis zur neuen letzten Zeile erweitern; alle Bezüge
//     auf verschobene Zeilen entsprechend erhöhen.
// So rechnen die Summen (z. B. Zeile 1155) mit den neuen Zeilen weiter.

const MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const FIRST_DATA_ROW = 10

function timeFraction(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h + m / 60) / 24
}

function colNum(letters: string): number {
  let n = 0
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n
}

/** Zeilenbezüge >= insertAt um n erhöhen (wie Excel beim Einfügen). */
function bumpFormula(f: string, insertAt: number, n: number): string {
  return f.replace(/(\$?)([A-Z]{1,3})(\$?)(\d+)/g, (m, d1, col, d2, rs) => {
    const r = parseInt(rs, 10)
    return r >= insertAt ? `${d1}${col}${d2}${r + n}` : m
  })
}

/** Summenbereiche, die an `lastData` endeten, bis `lastData+n` erweitern. */
function extendRanges(f: string, lastData: number, n: number): string {
  const re = new RegExp(`:(\\$?[A-Z]{1,3}\\$?)${lastData}(?!\\d)`, 'g')
  return f.replace(re, `:$1${lastData + n}`)
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

  // nur zugeordnete Einträge, chronologisch
  const toWrite = entries
    .filter((e) => e.blockId && !e.needsReview && EXCEL_COLUMNS[e.blockId])
    .sort((a, b) => a.date.localeCompare(b.date))
  const skipped = entries.filter(
    (e) => e.blockId && !e.needsReview && !EXCEL_COLUMNS[e.blockId],
  )

  const dateCol = colNum(EXCEL_DATE_COLUMN)

  // 1) echte letzte Datenzeile = letztes Datum in Spalte A
  let lastData = FIRST_DATA_ROW - 1
  for (let r = FIRST_DATA_ROW; r <= ws.rowCount; r++) {
    if (ws.getRow(r).getCell(dateCol).value instanceof Date) lastData = r
  }

  const n = toWrite.length
  const insertAt = lastData + 1

  if (n > 0) {
    // 2) n leere Zeilen einfügen (Summenblock rückt um n nach unten)
    ws.spliceRows(insertAt, 0, ...Array.from({ length: n }, () => []))

    // 3) Einträge in die neuen Zeilen schreiben
    let row = insertAt
    for (const e of toWrite) {
      const cols = EXCEL_COLUMNS[e.blockId as string]
      const r = ws.getRow(row)
      const [y, mo, d] = e.date.split('-').map(Number)
      const dc = r.getCell(dateCol)
      dc.value = new Date(y, mo - 1, d)
      dc.numFmt = 'dd.mm.yyyy'

      const beginFrac = timeFraction(e.start ?? '08:00')
      const endFrac = e.end ? timeFraction(e.end) : beginFrac + e.hours / 24
      const bc = r.getCell(colNum(cols.begin))
      bc.value = beginFrac
      bc.numFmt = 'h:mm'
      const ec = r.getCell(colNum(cols.end))
      ec.value = endFrac
      ec.numFmt = 'h:mm'
      const hc = r.getCell(colNum(cols.hours))
      hc.value = { formula: `${cols.end}${row}-${cols.begin}${row}` }
      hc.numFmt = 'h:mm'
      r.getCell(colNum(cols.taetigkeit)).value = e.title
      row++
    }

    // 4) verschobene Summen-Formeln korrigieren (alles unter den neuen Zeilen)
    for (let r = lastData + n + 1; r <= ws.rowCount; r++) {
      ws.getRow(r).eachCell({ includeEmpty: false }, (cell) => {
        if (cell.formula) {
          let f = bumpFormula(cell.formula, insertAt, n)
          f = extendRanges(f, lastData, n)
          cell.value = { formula: f }
        }
      })
    }
  }

  const buffer = await wb.xlsx.writeBuffer()
  return {
    blob: new Blob([buffer], { type: MIME }),
    written: n,
    skipped,
    startRow: insertAt,
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
