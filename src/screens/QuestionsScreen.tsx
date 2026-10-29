import { useState } from 'react'
import { useStore } from '../lib/store'
import { BLOCKS } from '../data/blocks'
import { shortDate } from '../lib/format'
import { Button, Card, SectionLabel, BlockOption } from '../components/ui'

export function QuestionsScreen() {
  const store = useStore()
  const open = store.openQuestions
  const [idx, setIdx] = useState(0)
  const [always, setAlways] = useState(true)

  if (open.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center">
          <SectionLabel>Welcher Hut?</SectionLabel>
          <h1 className="text-xl font-bold">Alles geklärt 🎉</h1>
        </div>
        <Card className="mt-4 p-6 text-center text-ink-soft">
          Gerade gibt es nichts nachzufragen. Neue unklare Tätigkeiten tauchen
          hier automatisch auf.
        </Card>
      </div>
    )
  }

  const current = open[Math.min(idx, open.length - 1)]

  function answer(blockId: string) {
    store.answerQuestion(current.id, blockId, always)
    setIdx((i) => i) // bleibt am Platz; Liste rückt nach
  }

  function skip() {
    setIdx((i) => (i + 1) % open.length)
  }

  function dontCount() {
    store.removeEntry(current.id)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <SectionLabel>Welcher Hut?</SectionLabel>
        <h1 className="text-xl font-bold">Kurz nachgefragt</h1>
        <p className="text-sm text-ink-soft">{open.length} offen</p>
      </div>

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
            <BlockOption key={b.id} blockId={b.id} onClick={() => answer(b.id)} />
          ))}
          <button
            onClick={dontCount}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-3 text-left text-ink-soft hover:bg-canvas"
          >
            Privat / nicht zählen
          </button>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={always}
            onChange={(e) => setAlways(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Immer so zuordnen
        </label>
      </Card>

      <Button variant="ghost" onClick={skip}>
        Später
      </Button>
    </div>
  )
}
