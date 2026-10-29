import { useState } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { TodayScreen } from './screens/TodayScreen'
import { WeekScreen } from './screens/WeekScreen'
import { QuestionsScreen } from './screens/QuestionsScreen'
import { ExportScreen } from './screens/ExportScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { useStore } from './lib/store'

export default function App() {
  const [tab, setTab] = useState<Tab>('heute')
  const [settings, setSettings] = useState(false)
  const store = useStore()
  const openCount = store.openQuestions.length

  function goTab(t: Tab) {
    setSettings(false)
    setTab(t)
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-canvas">
      <header
        className="sticky top-0 z-10 px-4 py-2 shadow-sm"
        style={{ background: '#27205b' }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-2">
          <img
            src={`${import.meta.env.BASE_URL}tagwerk-logo.png`}
            alt="Tagwerk – Unsere Bio Nachbarn"
            className="h-10 w-auto"
          />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white/80">
            Lenas Stundenzettel
          </span>
          <button
            onClick={() => setSettings((s) => !s)}
            aria-label="Einstellungen"
            className={`shrink-0 rounded-lg p-1.5 transition hover:bg-white/10 ${
              settings ? 'text-white' : 'text-white/80'
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 pb-2">
        {settings ? (
          <SettingsScreen onClose={() => setSettings(false)} />
        ) : (
          <>
            {tab === 'heute' && <TodayScreen goToWeek={() => setTab('woche')} />}
            {tab === 'woche' && <WeekScreen />}
            {tab === 'fragen' && <QuestionsScreen />}
            {tab === 'excel' && <ExportScreen goToQuestions={() => setTab('fragen')} />}
          </>
        )}
      </main>

      <BottomNav
        active={tab}
        onChange={goTab}
        badge={{ fragen: openCount || undefined }}
      />
    </div>
  )
}
