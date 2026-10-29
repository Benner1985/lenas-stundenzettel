import { useMemo, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { getBlock } from '../data/blocks'
import { hours as fmtHours, monthName } from '../lib/format'
import { writeIntoWorkbook, downloadBlob } from '../lib/excel'
import { Button, Card, SectionLabel } from '../components/ui'

type Scope = 'month' | 'all'

export function ExportScreen({ goToQuestions }: { goToQuestions: () => void }) {
  const store = useStore()
  const [scope, setScope] = useState<Scope>('month')
  const [file, setFile] = useState<{ name: string; data: ArrayBuffer } | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Demo-Monat: Oktober 2026
  const monthPrefix = '2026-10'

  const scoped = useMemo(() => {
    return store.entries.filter((e) =>
      scope === 'month' ? e.date.startsWith(monthPrefix) : true,
    )
  }, [store.entries, scope])

  const stats = useMemo(() => {
    const assigned = scoped.filter((e) => e.blockId && !e.needsReview)
    const days = new Set(assigned.map((e) => e.date)).size
    let total = 0
    let bioZ = 0
    let oemr = 0
    for (const e of assigned) {
      total += e.hours
      if (getBlock(e.blockId)?.isBioZ) bioZ += e.hours
      else oemr += e.hours
    }
    const open = scoped.filter((e) => e.needsReview).length
    return { days, total, bioZ, oemr, open }
  }, [scoped])

  async function handleDownload() {
    if (!file) {
      inputRef.current?.click()
      return
    }
    setBusy(true)
    setStatus(null)
    try {
      const res = await writeIntoWorkbook(file.data, scoped)
      downloadBlob(res.blob, file.name)
      setStatus(`${res.written} Einträge ab Zeile ${res.startRow} eingetragen.`)
    } catch (err) {
      setStatus(`Fehler: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <SectionLabel>Abrechnung</SectionLabel>
        <h1 className="text-xl font-bold">Excel erstellen</h1>
      </div>

      {/* Zeitraum */}
      <Card className="p-4">
        <SectionLabel>Zeitraum</SectionLabel>
        <div className="mt-2 flex gap-2">
          <ScopeButton active={scope === 'month'} onClick={() => setScope('month')}>
            {monthName(9)} 2026
          </ScopeButton>
          <ScopeButton active={scope === 'all'} onClick={() => setScope('all')}>
            Alles
          </ScopeButton>
        </div>

        <dl className="mt-4 space-y-2.5">
          <Stat label="Arbeitstage" value={String(stats.days)} />
          <Stat label="Stunden gesamt" value={`${fmtHours(stats.total)} h`} />
          <Stat label="BioZ / TW" value={`${fmtHours(stats.bioZ)} h`} accent="var(--color-bioz)" />
          <Stat label="ÖMR" value={`${fmtHours(stats.oemr)} h`} />
        </dl>
      </Card>

      {/* Status der Fragen */}
      {stats.open > 0 ? (
        <button
          onClick={goToQuestions}
          className="flex w-full items-center justify-between rounded-xl bg-warn px-4 py-3 text-left text-sm font-medium text-warn-ink"
        >
          <span>Noch {stats.open} Frage(n) offen – erst klären?</span>
          <span>›</span>
        </button>
      ) : (
        <div className="rounded-xl bg-bioz/10 px-4 py-3 text-sm font-medium text-bioz">
          ✓ Alle Fragen beantwortet
        </div>
      )}

      {/* Datei */}
      <Card className="p-4">
        <SectionLabel>Lenas Original-Datei</SectionLabel>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            setFile({ name: f.name, data: await f.arrayBuffer() })
            setStatus(null)
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-sm text-ink-soft">
            {file ? file.name : 'Noch keine Datei gewählt'}
          </span>
          <button
            onClick={() => inputRef.current?.click()}
            className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:bg-canvas"
          >
            {file ? 'Andere' : 'Datei wählen'}
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          Die Einträge werden in diese Datei geschrieben, Summen bleiben
          erhalten. Du bekommst dieselbe Datei aktualisiert zurück.
        </p>
      </Card>

      {status && (
        <p className="rounded-xl bg-canvas px-4 py-3 text-sm">{status}</p>
      )}

      <Button onClick={handleDownload} disabled={busy}>
        {busy ? 'Schreibe …' : file ? 'Excel herunterladen' : 'Datei wählen & herunterladen'}
      </Button>
    </div>
  )
}

function ScopeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        active ? 'bg-brand text-brand-ink' : 'bg-paper border border-line text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-bold tabular-nums" style={accent ? { color: accent } : undefined}>
        {value}
      </dd>
    </div>
  )
}
