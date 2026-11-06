import { useState } from 'react'
import { useStore } from '../lib/store'
import { BLOCKS, getBlock } from '../data/blocks'
import type { Entry } from '../types'
import { shortDate, hours as fmtHours, todayISO } from '../lib/format'

// Desktop: Excel-Vorschau + einfacher Editor in einem.
// Zeigt genau die Einträge, die in die Excel geschrieben werden, und
// lässt sie direkt bearbeiten (Hut, Stunden, Tätigkeit, löschen, neu).
export function EntryTable({ entries }: { entries: Entry[] }) {
  const store = useStore()
  const sorted = [...entries].sort(
    (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title),
  )

  const total = sorted.reduce((s, e) => s + e.hours, 0)
  const bioZ = sorted
    .filter((e) => getBlock(e.blockId)?.isBioZ)
    .reduce((s, e) => s + e.hours, 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-ink-faint">
            <th className="px-3 py-2 font-semibold">Datum</th>
            <th className="px-3 py-2 font-semibold">Hut</th>
            <th className="px-3 py-2 text-right font-semibold">Std</th>
            <th className="px-3 py-2 font-semibold">Tätigkeit</th>
            <th className="w-8 px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-ink-faint">
                Noch keine Einträge in diesem Zeitraum.
              </td>
            </tr>
          )}
          {sorted.map((e, i) => {
            const newDay = i === 0 || sorted[i - 1].date !== e.date
            return (
              <tr
                key={e.id}
                className={`border-b border-line/70 ${e.needsReview ? 'bg-warn/40' : ''}`}
              >
                <td className="whitespace-nowrap px-3 py-1.5 text-ink-soft">
                  {newDay ? shortDate(e.date) : ''}
                </td>
                <td className="px-3 py-1.5">
                  <HutSelect
                    value={e.blockId}
                    onChange={(id) => store.updateEntry(e.id, { blockId: id, needsReview: false })}
                  />
                </td>
                <td className="px-2 py-1.5 text-right">
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={e.hours}
                    onChange={(ev) => store.updateEntry(e.id, { hours: Number(ev.target.value) })}
                    className="w-16 rounded-md border border-line bg-paper px-2 py-1 text-right tabular-nums outline-none focus:border-brand"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    value={e.title}
                    onChange={(ev) => store.updateEntry(e.id, { title: ev.target.value })}
                    className="w-full min-w-40 rounded-md border border-transparent bg-transparent px-2 py-1 outline-none hover:border-line focus:border-brand"
                  />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button
                    onClick={() => store.removeEntry(e.id)}
                    className="text-ink-faint hover:text-rose-500"
                    aria-label="Löschen"
                  >
                    ×
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="bg-canvas font-semibold">
            <td className="px-3 py-2" colSpan={2}>
              Summe ({sorted.length} Einträge)
            </td>
            <td className="px-2 py-2 text-right tabular-nums">{fmtHours(total)} h</td>
            <td className="px-3 py-2 text-ink-soft" colSpan={2}>
              davon BioZ {fmtHours(bioZ)} h
            </td>
          </tr>
        </tfoot>
      </table>

      <AddRow />
    </div>
  )
}

function HutSelect({
  value,
  onChange,
}: {
  value: string | null
  onChange: (id: string) => void
}) {
  const block = getBlock(value)
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: block?.color ?? '#cbd5e1' }}
      />
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-md border px-2 py-1 outline-none focus:border-brand ${
          value ? 'border-line' : 'border-warn-ink/40 text-warn-ink'
        }`}
      >
        <option value="" disabled>
          — offen —
        </option>
        {BLOCKS.map((b) => (
          <option key={b.id} value={b.id}>
            {b.id} · {b.name}
          </option>
        ))}
      </select>
    </span>
  )
}

function AddRow() {
  const store = useStore()
  const [date, setDate] = useState(todayISO())
  const [title, setTitle] = useState('')
  const [hrs, setHrs] = useState(1)

  function add() {
    const t = title.trim()
    if (!t) return
    const s = store.suggest(t)
    store.addEntry({
      date,
      title: t,
      hours: hrs,
      blockId: s.confident ? s.blockId : null,
      source: 'manual',
      needsReview: !s.confident,
    })
    setTitle('')
    setHrs(1)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-line bg-paper px-3 py-2">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-md border border-line bg-paper px-2 py-1.5 text-sm outline-none focus:border-brand"
      />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && add()}
        placeholder="Neue Tätigkeit …"
        className="min-w-48 flex-1 rounded-md border border-line bg-paper px-2 py-1.5 text-sm outline-none focus:border-brand"
      />
      <input
        type="number"
        min={0}
        step={0.5}
        value={hrs}
        onChange={(e) => setHrs(Number(e.target.value))}
        className="w-16 rounded-md border border-line bg-paper px-2 py-1.5 text-right text-sm tabular-nums outline-none focus:border-brand"
      />
      <span className="text-sm text-ink-soft">h</span>
      <button
        onClick={add}
        disabled={!title.trim()}
        className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-brand-ink hover:brightness-110 disabled:opacity-40"
      >
        + Eintragen
      </button>
    </div>
  )
}
