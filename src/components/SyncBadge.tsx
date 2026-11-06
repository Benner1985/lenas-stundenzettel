import type { SyncStatus } from '../lib/store'

// Kleiner Hinweis in der Kopfzeile: Ist alles in der Cloud gesichert?
const MAP: Record<SyncStatus, { dot: string; label: string; text: string }> = {
  synced: { dot: '#16a34a', label: 'Gesichert', text: 'text-white/80' },
  syncing: { dot: '#eab308', label: 'Sichern …', text: 'text-white/70' },
  offline: { dot: '#f87171', label: 'Offline', text: 'text-white/80' },
}

export function SyncBadge({ status }: { status: SyncStatus }) {
  const s = MAP[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 text-xs font-medium ${s.text}`}
      title={
        status === 'offline'
          ? 'Keine Verbindung – Eingaben werden lokal gespeichert und später synchronisiert.'
          : 'Synchronisierung mit der Cloud'
      }
    >
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.dot }} />
      <span className="hidden sm:inline">{s.label}</span>
    </span>
  )
}
