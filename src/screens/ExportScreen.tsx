import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { getBlock } from '../data/blocks'
import { hours as fmtHours } from '../lib/format'
import {
  type PeriodScope,
  monthLabel,
  quarterLabel,
  inMonth,
  inQuarter,
  inCustom,
  shiftMonth,
  shiftQuarter,
} from '../lib/period'
import { writeIntoWorkbook, downloadBlob } from '../lib/excel'
import { loadTemplate, saveTemplate, type StoredFile } from '../lib/fileStore'
import { Button, Card, SectionLabel } from '../components/ui'
import { OpenQuestions } from '../components/OpenQuestions'

export function ExportScreen() {
  const store = useStore()
  const [scope, setScope] = useState<PeriodScope>('month')
  const [anchor, setAnchor] = useState(() => new Date())
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  // Vorlage ist lokal auf dem Gerät gespeichert – nur einmal auswählen.
  const [template, setTemplate] = useState<StoredFile | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadTemplate().then(setTemplate)
  }, [])

  const scoped = useMemo(() => {
    return store.entries.filter((e) => {
      if (scope === 'all') return true
      if (scope === 'month') return inMonth(e.date, anchor)
      if (scope === 'quarter') return inQuarter(e.date, anchor)
      return inCustom(e.date, from, to)
    })
  }, [store.entries, scope, anchor, from, to])

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
    return { days, total, bioZ, oemr }
  }, [scoped])

  // offene Nachfragen NUR im gewählten Zeitraum (für Export relevant)
  const scopedOpen = useMemo(() => scoped.filter((e) => e.needsReview), [scoped])

  async function handleDownload() {
    if (!template) {
      inputRef.current?.click()
      return
    }
    setBusy(true)
    setStatus(null)
    try {
      // Kopie der gespeicherten Vorlage füllen (Original bleibt unberührt)
      const res = await writeIntoWorkbook(template.data.slice(0), scoped)
      downloadBlob(res.blob, template.name)
      setStatus(`${res.written} Einträge eingetragen. Datei heruntergeladen.`)
    } catch (err) {
      setStatus(`Fehler: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  async function pickFile(file: File) {
    const data = await file.arrayBuffer()
    await saveTemplate(file.name, data)
    setTemplate({ name: file.name, data, savedAt: Date.now() })
    setStatus(null)
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
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          <ScopeButton active={scope === 'month'} onClick={() => setScope('month')}>
            Monat
          </ScopeButton>
          <ScopeButton active={scope === 'quarter'} onClick={() => setScope('quarter')}>
            Quartal
          </ScopeButton>
          <ScopeButton active={scope === 'custom'} onClick={() => setScope('custom')}>
            Eigener
          </ScopeButton>
          <ScopeButton active={scope === 'all'} onClick={() => setScope('all')}>
            Alles
          </ScopeButton>
        </div>

        {(scope === 'month' || scope === 'quarter') && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-line px-1.5 py-1">
            <button
              onClick={() =>
                setAnchor((a) => (scope === 'month' ? shiftMonth(a, -1) : shiftQuarter(a, -1)))
              }
              className="rounded-lg px-3 py-1.5 text-ink-faint hover:text-ink"
              aria-label="zurück"
            >
              ‹
            </button>
            <span className="font-semibold">
              {scope === 'month' ? monthLabel(anchor) : quarterLabel(anchor)}
            </span>
            <button
              onClick={() =>
                setAnchor((a) => (scope === 'month' ? shiftMonth(a, 1) : shiftQuarter(a, 1)))
              }
              className="rounded-lg px-3 py-1.5 text-ink-faint hover:text-ink"
              aria-label="vor"
            >
              ›
            </button>
          </div>
        )}

        {scope === 'custom' && (
          <div className="mt-3 flex items-end gap-2">
            <label className="flex-1 text-sm text-ink-soft">
              von
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-2 outline-none focus:border-brand"
              />
            </label>
            <label className="flex-1 text-sm text-ink-soft">
              bis
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-2 outline-none focus:border-brand"
              />
            </label>
          </div>
        )}

        <dl className="mt-4 space-y-2.5">
          <Stat label="Arbeitstage" value={String(stats.days)} />
          <Stat label="Stunden gesamt" value={`${fmtHours(stats.total)} h`} />
          <Stat label="BioZ / TW" value={`${fmtHours(stats.bioZ)} h`} accent="var(--color-bioz-ink)" />
          <Stat label="ÖMR" value={`${fmtHours(stats.oemr)} h`} />
        </dl>
      </Card>

      {/* Offene Nachfragen im Zeitraum direkt hier klären */}
      {scopedOpen.length > 0 ? (
        <div className="space-y-2">
          <div className="rounded-xl bg-warn px-4 py-3 text-sm font-medium text-warn-ink">
            Noch {scopedOpen.length} Nachfrage(n) offen – jetzt klären:
          </div>
          <OpenQuestions questions={scopedOpen} />
        </div>
      ) : (
        <div className="rounded-xl bg-bioz/15 px-4 py-3 text-sm font-medium text-bioz-ink">
          ✓ Alle Fragen beantwortet
        </div>
      )}

      {/* Vorlage (lokal auf dem Gerät gespeichert) */}
      <Card className="p-4">
        <SectionLabel>Excel-Vorlage</SectionLabel>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) pickFile(f)
          }}
        />
        {template ? (
          <>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {template.name}
                </span>
                <span className="text-xs text-bioz-ink">
                  ✓ auf diesem Gerät gespeichert
                </span>
              </span>
              <button
                onClick={() => inputRef.current?.click()}
                className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:bg-canvas"
              >
                Ändern
              </button>
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              Die Einträge werden in diese Datei geschrieben (Summen bleiben
              erhalten). Du musst sie nie wieder auswählen.
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-soft">
              Wähle Lenas Excel einmalig aus. Sie wird nur auf diesem Gerät
              gespeichert – nicht hochgeladen, nicht öffentlich.
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm font-semibold hover:bg-canvas"
            >
              Excel-Vorlage auswählen
            </button>
          </>
        )}
      </Card>

      {status && (
        <p className="rounded-xl bg-canvas px-4 py-3 text-sm">{status}</p>
      )}

      <Button onClick={handleDownload} disabled={busy}>
        {busy ? 'Schreibe …' : template ? 'Excel herunterladen' : 'Vorlage wählen'}
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
      className={`w-full rounded-xl px-1 py-2 text-sm font-semibold transition ${
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
