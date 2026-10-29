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
      <header className="sticky top-0 z-10 border-b border-line bg-paper/95 px-4 py-2.5 backdrop-blur">
        <h1 className="text-center text-sm font-semibold tracking-tight text-ink-soft">
          Lenas Stundenzettel
        </h1>
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
