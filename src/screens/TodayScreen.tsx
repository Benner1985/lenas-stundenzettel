import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { getCalendarEvents, QUICK_ACTIVITIES } from '../data/mockCalendar'
import { DEMO_TODAY } from '../data/seed'
import { BLOCKS, getBlock } from '../data/blocks'
import { longDate, hoursLabel, toISO, parseISO } from '../lib/format'
import { Button, Card, SectionLabel, BlockOption } from '../components/ui'

function shiftDay(iso: string, delta: number): string {
  const d = parseISO(iso)
  d.setDate(d.getDate() + delta)
  return toISO(d)
}

export function TodayScreen({ goToWeek }: { goToWeek: () => void }) {
  const store = useStore()
  const [date, setDate] = useState(DEMO_TODAY)
  const [draft, setDraft] = useState('')
  const [hours, setHours] = useState(1)
  const [pickFor, setPickFor] = useState<string | null>(null) // Eintrag-id, für den der Hut gewählt wird
  const [saved, setSaved] = useState(false)

  const dayEntries = useMemo(
    () => store.entries.filter((e) => e.date === date),
    [store.entries, date],
  )
  const calendar = getCalendarEvents(date)

  // bereits als Eintrag übernommene Kalendertermine (per Titel)
  const addedTitles = new Set(dayEntries.map((e) => e.title.toLowerCase()))

  const dayTotal = dayEntries.reduce((s, e) => s + e.hours, 0)

  function addCalendar(ev: (typeof calendar)[number]) {
    const s = store.suggest(ev.title)
    store.addEntry({
      date,
      title: ev.title,
      hours: ev.hours,
      blockId: s.confident ? s.blockId : s.blockId,
      source: 'calendar',
      needsReview: !s.confident,
      start: ev.start,
      end: ev.end,
    })
  }

  function addManual() {
    const title = draft.trim()
    if (!title) return
    const s = store.suggest(title)
    store.addEntry({
      date,
      title,
      hours,
      blockId: s.blockId,
      source: 'manual',
      needsReview: !s.confident,
    })
    setDraft('')
    setHours(1)
    setSaved(false)
  }

  return (
    <div className="space-y-4 p-4">
      {/* Datum */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setDate(shiftDay(date, -1))}
          className="rounded-lg px-2 py-1 text-ink-faint hover:text-ink"
          aria-label="Tag zurück"
        >
          ‹
        </button>
        <div className="text-center">
          <SectionLabel>Tag eintragen</SectionLabel>
          <h1 className="text-xl font-bold">{longDate(date)}</h1>
        </div>
        <button
          onClick={() => setDate(shiftDay(date, 1))}
          className="rounded-lg px-2 py-1 text-ink-faint hover:text-ink"
          aria-label="Tag vor"
        >
          ›
        </button>
      </div>

      {/* Aus dem Kalender */}
      {calendar.length > 0 && (
        <Card className="p-4">
          <SectionLabel>Aus deinem Kalender (Beispiel)</SectionLabel>
          <div className="mt-2 space-y-2">
            {calendar.map((ev) => {
              const added = addedTitles.has(ev.title.toLowerCase())
              return (
                <button
                  key={ev.id}
                  onClick={() => !added && addCalendar(ev)}
                  disabled={added}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                    added
                      ? 'border-bioz/30 bg-bioz/5'
                      : 'border-line bg-paper hover:bg-canvas'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                        added
                          ? 'border-bioz-ink bg-bioz-ink text-white'
                          : 'border-ink-faint text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span className="font-medium">{ev.title}</span>
                  </span>
                  <span className="text-sm text-ink-soft">{hoursLabel(ev.hours)}</span>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Was noch? */}
      <Card className="p-4">
        <SectionLabel>Was noch? (antippen)</SectionLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_ACTIVITIES.map((a) => (
            <button
              key={a}
              onClick={() => setDraft(a)}
              className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm font-medium hover:bg-canvas"
            >
              {a}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addManual()}
            placeholder="eigener Text …"
            className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2.5 outline-none focus:border-brand"
          />
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-20 rounded-xl border border-line bg-paper px-3 py-2.5 text-center tabular-nums outline-none focus:border-brand"
          />
          <span className="flex items-center text-sm text-ink-soft">h</span>
        </div>
        <div className="mt-2">
          <Button variant="ghost" onClick={addManual} disabled={!draft.trim()}>
            + Hinzufügen
          </Button>
        </div>
      </Card>

      {/* Einträge des Tages */}
      {dayEntries.length > 0 && (
        <Card className="p-4">
          <SectionLabel>Heute erfasst</SectionLabel>
          <ul className="mt-2 divide-y divide-line">
            {dayEntries.map((e) => {
              const block = getBlock(e.blockId)
              return (
                <li key={e.id} className="flex items-center gap-3 py-2.5">
                  <button
                    onClick={() => setPickFor(pickFor === e.id ? null : e.id)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ background: block?.color ?? '#cbd5e1' }}
                    title="Hut ändern"
                  >
                    {block?.id ?? '?'}
                  </button>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{e.title}</span>
                    {e.needsReview ? (
                      <span className="text-xs font-medium text-warn-ink">
                        Hut unklar – wird nachgefragt
                      </span>
                    ) : block ? (
                      <span className="text-xs text-ink-faint">
                        {block.id} · {block.name}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-sm tabular-nums text-ink-soft">
                    {hoursLabel(e.hours)}
                  </span>
                  <button
                    onClick={() => store.removeEntry(e.id)}
                    className="px-1 text-lg text-ink-faint hover:text-rose-500"
                    aria-label="Löschen"
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Inline-Hut-Auswahl */}
          {pickFor && (
            <div className="mt-2 space-y-1.5 rounded-xl bg-canvas p-2">
              {BLOCKS.map((b) => (
                <BlockOption
                  key={b.id}
                  blockId={b.id}
                  onClick={() => {
                    store.updateEntry(pickFor, { blockId: b.id, needsReview: false })
                    setPickFor(null)
                  }}
                />
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
            <span className="font-semibold">Summe heute</span>
            <span className="font-bold tabular-nums">{hoursLabel(dayTotal)}</span>
          </div>
        </Card>
      )}

      <Button
        onClick={() => {
          setSaved(true)
          goToWeek()
        }}
      >
        {saved ? 'Tag gespeichert ✓' : 'Tag speichern'}
      </Button>
    </div>
  )
}
