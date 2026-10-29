import { useState } from 'react'
import { useStore } from '../lib/store'
import { BLOCKS } from '../data/blocks'
import { shortDate } from '../lib/format'
import type { Entry } from '../types'
import { Card, BlockOption } from './ui'

// Löst offene "Welcher Hut?"-Nachfragen – eine nach der anderen.
// Wird dort eingeblendet, wo sie gebraucht wird (z. B. im Excel-Screen).
// `questions` kann eine eingegrenzte Liste sein (z. B. nur der Export-Zeitraum);
// ohne Angabe werden alle offenen Fragen gelöst.
export function OpenQuestions({ questions }: { questions?: Entry[] }) {
  const store = useStore()
  const open = questions ?? store.openQuestions
  const [idx, setIdx] = useState(0)
  const [always, setAlways] = useState(true)

  if (open.length === 0) return null

  const current = open[Math.min(idx, open.length - 1)]

  return (
    <Card className="p-4">
      <p className="text-sm text-ink-soft">
        {shortDate(current.date)}
        {current.start ? ` · ${current.start}–${current.end}` : ''}
      </p>
      <h2 className="mt-0.5 text-lg font-bold">{current.title}</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Welchem Block gehört das? Deine Antwort wird zur Regel.
      </p>

      <div className="mt-3 space-y-2">
        {BLOCKS.map((b) => (
          <BlockOption
            key={b.id}
            blockId={b.id}
            onClick={() => store.answerQuestion(current.id, b.id, always)}
          />
        ))}
        <button
          onClick={() => store.removeEntry(current.id)}
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-3 text-left text-ink-soft hover:bg-canvas"
        >
          Privat / nicht zählen
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={always}
            onChange={(e) => setAlways(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Immer so zuordnen
        </label>
        {open.length > 1 && (
          <button
            onClick={() => setIdx((i) => (i + 1) % open.length)}
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            Später ›
          </button>
        )}
      </div>
    </Card>
  )
}
