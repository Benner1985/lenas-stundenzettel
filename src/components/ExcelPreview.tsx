import { useEffect, useMemo, useState } from 'react'
import type { Entry } from '../types'
import { EXCEL_COLUMNS } from '../data/excelMapping'
import { getBlock } from '../data/blocks'
import {
  parseTemplateBase,
  buildPreviewRows,
  type TemplateBase,
} from '../lib/excelPreview'
import { shortDate } from '../lib/format'

// Zeigt, wie Lenas Excel-Datei nach dem Eintragen aussieht:
// echte Spalten (mit Excel-Buchstaben), neue Zeilen und mitgerechnete Summen.
export function ExcelPreview({
  templateData,
  entries,
}: {
  templateData: ArrayBuffer
  entries: Entry[]
}) {
  const [base, setBase] = useState<TemplateBase | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setBase(null)
    setError(null)
    parseTemplateBase(templateData.slice(0))
      .then((b) => active && setBase(b))
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)))
    return () => {
      active = false
    }
  }, [templateData])

  const preview = useMemo(
    () => (base ? buildPreviewRows(entries, base) : null),
    [base, entries],
  )

  if (error) {
    return (
      <p className="rounded-xl bg-warn px-4 py-3 text-sm text-warn-ink">
        Vorschau nicht möglich: {error}
      </p>
    )
  }
  if (!base || !preview) {
    return <p className="px-1 py-3 text-sm text-ink-soft">Vorschau wird erstellt …</p>
  }
  if (preview.usedBlocks.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-paper px-4 py-6 text-center text-sm text-ink-faint">
        Noch keine zugeordneten Einträge in diesem Zeitraum.
      </p>
    )
  }

  const blocks = preview.usedBlocks

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-paper">
      <table className="min-w-full border-collapse text-xs">
        {/* Block-Namen */}
        <thead>
          <tr className="bg-canvas">
            <th className="border border-line px-2 py-1 text-ink-faint">Zeile</th>
            <th className="border border-line px-2 py-1 text-left">A · Datum</th>
            {blocks.map((b) => {
              const block = getBlock(b)
              return (
                <th
                  key={b}
                  colSpan={4}
                  className="border border-line px-2 py-1 text-center text-white"
                  style={{ background: block?.color }}
                >
                  {block?.id} · {block?.name}
                </th>
              )
            })}
          </tr>
          {/* Spalten-Buchstaben + Felder */}
          <tr className="bg-canvas text-ink-faint">
            <th className="border border-line px-2 py-1" />
            <th className="border border-line px-2 py-1" />
            {blocks.map((b) => {
              const c = EXCEL_COLUMNS[b]
              return (
                <SubHead key={b} cols={[
                  [c.begin, 'Beginn'],
                  [c.end, 'Ende'],
                  [c.hours, 'Std'],
                  [c.taetigkeit, 'Tätigkeit'],
                ]} />
              )
            })}
          </tr>
        </thead>
        <tbody>
          {preview.rows.map((r) => (
            <tr key={r.excelRow} className="bg-bioz/5">
              <td className="border border-line px-2 py-1 text-center text-ink-faint tabular-nums">
                {r.excelRow}
              </td>
              <td className="whitespace-nowrap border border-line px-2 py-1">
                {shortDate(r.date)}
              </td>
              {blocks.map((b) =>
                b === r.blockId ? (
                  <Cells
                    key={b}
                    values={[r.begin, r.end, hm(r.hours), r.title]}
                  />
                ) : (
                  <EmptyCells key={b} />
                ),
              )}
            </tr>
          ))}
          {/* Summenzeile */}
          <tr className="bg-canvas font-semibold">
            <td className="border border-line px-2 py-1 text-center text-ink-faint">
              {base.sumRow}
            </td>
            <td className="whitespace-nowrap border border-line px-2 py-1">Summe</td>
            {blocks.map((b) => {
              const t = preview.totals[b]
              return (
                <td
                  key={b}
                  colSpan={4}
                  className="border border-line px-2 py-1 text-right tabular-nums"
                >
                  {t.old > 0 ? (
                    <>
                      {hm(t.old)} <span className="text-ink-faint">→</span>{' '}
                      <span className="text-bioz-ink">{hm(t.neu)}</span>
                    </>
                  ) : (
                    <span className="text-bioz-ink">+ {hm(t.add)}</span>
                  )}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function SubHead({ cols }: { cols: [string, string][] }) {
  return (
    <>
      {cols.map(([letter, label]) => (
        <th key={letter} className="border border-line px-2 py-1 font-medium">
          <span className="block text-[10px] text-ink-faint">{letter}</span>
          {label}
        </th>
      ))}
    </>
  )
}

function Cells({ values }: { values: string[] }) {
  return (
    <>
      {values.map((v, i) => (
        <td
          key={i}
          className={`border border-line px-2 py-1 ${i === 2 ? 'text-right tabular-nums' : ''}`}
        >
          {v}
        </td>
      ))}
    </>
  )
}

function EmptyCells() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <td key={i} className="border border-line px-2 py-1" />
      ))}
    </>
  )
}

/** Dezimalstunden -> "H:MM" (wie in der Excel). */
function hm(hours: number): string {
  const total = Math.round(hours * 60)
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${h}:${String(m).padStart(2, '0')}`
}
