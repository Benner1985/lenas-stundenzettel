import { useMemo } from 'react'
import { useStore } from '../lib/store'
import { summarizeWeek } from '../lib/week'
import { hours, hoursLabel, shortDate, todayISO } from '../lib/format'
import { Bar, Card, SectionLabel } from '../components/ui'

export function WeekScreen() {
  const store = useStore()
  const week = useMemo(
    () => summarizeWeek(store.entries, todayISO(), store.goal),
    [store.entries, store.goal],
  )

  const bioZOpen = Math.max(0, week.goal.bioZHours - week.bioZHours)
  const emptyDay = week.days.find((d) => d.totalHours === 0 && isWeekday(d.date))

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <SectionLabel>Diese Woche</SectionLabel>
        <h1 className="text-xl font-bold">KW {week.week}</h1>
      </div>

      {/* Ziel-Balken */}
      <Card className="p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">Gesamt</span>
          <span className="tabular-nums">
            <b className="text-lg">{hours(week.totalHours)}</b>{' '}
            <span className="text-ink-soft">von {hours(week.goal.totalHours)} h</span>
          </span>
        </div>
        <div className="mt-2">
          <Bar value={week.totalHours} goal={week.goal.totalHours} color="var(--color-total)" />
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="font-semibold">davon BioZ</span>
          <span className="tabular-nums">
            <b className="text-lg">{hours(week.bioZHours)}</b>{' '}
            <span className="text-ink-soft">von {hours(week.goal.bioZHours)} h</span>
          </span>
        </div>
        <div className="mt-2">
          <Bar value={week.bioZHours} goal={week.goal.bioZHours} color="var(--color-bioz)" />
        </div>

        {bioZOpen > 0 && (
          <div className="mt-4 rounded-xl bg-warn px-3 py-2.5 text-sm font-medium text-warn-ink">
            Noch {hours(bioZOpen)} h BioZ offen.
            {emptyDay ? ` ${shortDate(emptyDay.date).split(' ')[0]}?` : ''}
          </div>
        )}
      </Card>

      {/* Tage */}
      <Card className="p-4">
        <SectionLabel>Tage</SectionLabel>
        <ul className="mt-1 divide-y divide-line">
          {week.days.filter((d) => isWeekday(d.date)).map((d) => (
            <li key={d.date} className="flex items-center justify-between py-2.5">
              <span className="font-medium">{shortDate(d.date)}</span>
              {d.totalHours === 0 ? (
                <span className="text-sm text-ink-faint">noch leer</span>
              ) : (
                <span className="flex items-center gap-4 tabular-nums">
                  <span className="inline-flex min-w-7 items-center justify-center rounded-lg bg-bioz/15 px-2 py-0.5 text-sm font-bold text-bioz-ink">
                    {hours(d.bioZHours)}
                  </span>
                  <span className="min-w-12 text-right font-semibold">
                    {hoursLabel(d.totalHours)}
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-faint">
          Grün = BioZ-Stunden · rechts = Tagessumme
        </p>
      </Card>
    </div>
  )
}

function isWeekday(iso: string): boolean {
  const day = new Date(iso).getDay()
  return day >= 1 && day <= 5
}
