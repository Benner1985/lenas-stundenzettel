import { useState } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { TodayScreen } from './screens/TodayScreen'
import { WeekScreen } from './screens/WeekScreen'
import { ExportScreen } from './screens/ExportScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { useMediaQuery } from './lib/useMediaQuery'

const TAB_LABELS: Record<Tab, string> = { heute: 'Heute', woche: 'Woche', excel: 'Excel' }

export default function App() {
  const [tab, setTab] = useState<Tab>('heute')
  const [settings, setSettings] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  function goTab(t: Tab) {
    setSettings(false)
    setTab(t)
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* Kopfzeile (volle Breite, Tagwerk-Navy) */}
      <header className="sticky top-0 z-10 shadow-sm" style={{ background: '#27205b' }}>
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-2">
          <img
            src={`${import.meta.env.BASE_URL}tagwerk-logo.png`}
            alt="Tagwerk – Unsere Bio Nachbarn"
            className="h-10 w-auto"
          />
          <span className="hidden text-sm font-semibold text-white/80 sm:inline">
            Lenas Stundenzettel
          </span>

          {/* Desktop-Navigation oben */}
          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {(['heute', 'woche', 'excel'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => goTab(t)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  !settings && tab === t
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setSettings((s) => !s)}
            aria-label="Einstellungen"
            className={`ml-auto shrink-0 rounded-lg p-1.5 transition hover:bg-white/10 ${
              settings ? 'text-white' : 'text-white/80'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Inhalt */}
      <main className="mx-auto w-full max-w-md flex-1 pb-2 lg:max-w-5xl lg:pb-6">
        {settings ? (
          <div className="mx-auto max-w-2xl">
            <SettingsScreen onClose={() => setSettings(false)} />
          </div>
        ) : isDesktop ? (
          tab === 'heute' ? (
            <div className="grid grid-cols-2 items-start gap-2">
              <TodayScreen goToWeek={() => setTab('woche')} />
              <WeekScreen />
            </div>
          ) : tab === 'woche' ? (
            <div className="mx-auto max-w-2xl">
              <WeekScreen />
            </div>
          ) : (
            <div className="mx-auto max-w-4xl">
              <ExportScreen />
            </div>
          )
        ) : tab === 'heute' ? (
          <TodayScreen goToWeek={() => setTab('woche')} />
        ) : tab === 'woche' ? (
          <WeekScreen />
        ) : (
          <ExportScreen />
        )}
      </main>

      {/* Navigation unten – nur Handy/Tablet */}
      <div className="lg:hidden">
        <BottomNav active={tab} onChange={goTab} />
      </div>
    </div>
  )
}
