import { useState } from 'react'
import { useStore } from '../lib/store'
import { BLOCKS } from '../data/blocks'
import type { Block } from '../types'
import { Button, Card, SectionLabel } from '../components/ui'

export function SettingsScreen({ onClose }: { onClose: () => void }) {
  const store = useStore()

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-sm font-medium text-brand">
          ‹ Zurück
        </button>
        <h1 className="text-lg font-bold">Einstellungen</h1>
        <span className="w-14" />
      </div>

      {/* Wochenziel */}
      <Card className="p-4">
        <SectionLabel>Wochenziel</SectionLabel>
        <p className="mt-1 text-sm text-ink-soft">
          Wie viele Stunden pro Woche — und wie viel davon BioZ?
        </p>
        <div className="mt-3 flex gap-3">
          <GoalInput
            label="Gesamt"
            value={store.goal.totalHours}
            onChange={(v) => store.setGoal({ ...store.goal, totalHours: v })}
          />
          <GoalInput
            label="davon BioZ"
            value={store.goal.bioZHours}
            onChange={(v) => store.setGoal({ ...store.goal, bioZHours: v })}
          />
        </div>
      </Card>

      {/* Zuordnung je Hut */}
      <Card className="p-4">
        <SectionLabel>Zuordnung — welche Stichworte gehören wohin?</SectionLabel>
        <p className="mt-1 text-sm text-ink-soft">
          Tippt Lena ein Stichwort ein, ordnet die App es dem passenden Hut zu.
          Eigene Stichworte kannst du hier ergänzen oder entfernen.
        </p>
        <div className="mt-3 space-y-4">
          {BLOCKS.map((b) => (
            <BlockRules key={b.id} block={b} />
          ))}
        </div>
      </Card>

      {/* Daten */}
      <Card className="p-4">
        <SectionLabel>Daten</SectionLabel>
        <p className="mt-1 text-sm text-ink-soft">
          Beispiel-Daten entfernen und mit leerem Stand beginnen. (Eigene
          Stichworte und das Wochenziel bleiben erhalten.)
        </p>
        <div className="mt-3">
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm('Wirklich alle Einträge leeren?')) store.clearEntries()
            }}
          >
            Alle Einträge leeren
          </Button>
        </div>
      </Card>
    </div>
  )
}

function GoalInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex-1">
      <span className="block text-sm text-ink-soft">{label}</span>
      <span className="mt-1 flex items-center gap-1">
        <input
          type="number"
          min={0}
          step={0.5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-center tabular-nums outline-none focus:border-brand"
        />
        <span className="text-sm text-ink-soft">h</span>
      </span>
    </label>
  )
}

function BlockRules({ block }: { block: Block }) {
  const store = useStore()
  const [draft, setDraft] = useState('')

  // von Lena ergänzte Stichworte für genau diesen Hut
  const custom = store.rules.filter((r) => r.blockId === block.id)

  function add() {
    const kw = draft.trim()
    if (kw) store.addRule(kw, block.id)
    setDraft('')
  }

  return (
    <div className="rounded-xl border border-line p-3">
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ background: block.color }}
        >
          {block.id}
        </span>
        <span className="font-semibold">{block.name}</span>
      </div>

      {/* fest hinterlegte Stichworte */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {block.keywords.map((kw) => (
          <span
            key={kw}
            className="rounded-full bg-canvas px-2.5 py-1 text-xs text-ink-soft"
          >
            {kw}
          </span>
        ))}
        {/* eigene Stichworte (entfernbar) */}
        {custom.map((r) => (
          <button
            key={r.keyword}
            onClick={() => store.removeRule(r.keyword)}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white"
            style={{ background: block.color }}
            title="Entfernen"
          >
            {r.keyword} <span className="opacity-80">×</span>
          </button>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Stichwort ergänzen …"
          className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          onClick={add}
          disabled={!draft.trim()}
          className="shrink-0 rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-canvas disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  )
}
