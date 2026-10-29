import { useState } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { TodayScreen } from './screens/TodayScreen'
import { WeekScreen } from './screens/WeekScreen'
import { QuestionsScreen } from './screens/QuestionsScreen'
import { ExportScreen } from './screens/ExportScreen'
import { useStore } from './lib/store'

export default function App() {
  const [tab, setTab] = useState<Tab>('heute')
  const store = useStore()
  const openCount = store.openQuestions.length

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-canvas">
      <header
        className="sticky top-0 z-10 px-4 py-2 shadow-sm"
        style={{ background: '#27205b' }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <img
            src={`${import.meta.env.BASE_URL}tagwerk-logo.png`}
            alt="Tagwerk – Unsere Bio Nachbarn"
            className="h-10 w-auto"
          />
          <span className="text-sm font-semibold text-white/80">
            Lenas Stundenzettel
          </span>
        </div>
      </header>

      <main className="flex-1 pb-2">
        {tab === 'heute' && <TodayScreen goToWeek={() => setTab('woche')} />}
        {tab === 'woche' && <WeekScreen />}
        {tab === 'fragen' && <QuestionsScreen />}
        {tab === 'excel' && <ExportScreen goToQuestions={() => setTab('fragen')} />}
      </main>

      <BottomNav
        active={tab}
        onChange={setTab}
        badge={{ fragen: openCount || undefined }}
      />
    </div>
  )
}
