import type { Entry, WeekGoal } from '../types'
import { parseISO, toISO } from './format'
import { getBlock } from '../data/blocks'

export const DEFAULT_GOAL: WeekGoal = { totalHours: 27, bioZHours: 10 }

/** ISO-Kalenderwoche (KW) zu einem Datum. */
export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = (d.getUTCDay() + 6) % 7 // Mo=0 … So=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3) // Donnerstag dieser Woche
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3)
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000))
}

/** Montag der Woche, in der `date` liegt. */
export function mondayOf(date: Date): Date {
  const d = new Date(date)
  const dayNum = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - dayNum)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Die sieben ISO-Daten (Mo–So) der Woche, in der `iso` liegt. */
export function weekDays(iso: string): string[] {
  const monday = mondayOf(parseISO(iso))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return toISO(d)
  })
}

/** Liegen zwei Daten in derselben ISO-Woche desselben Jahres? */
export function sameWeek(isoA: string, isoB: string): boolean {
  const a = parseISO(isoA)
  const b = parseISO(isoB)
  return a.getFullYear() === b.getFullYear() && isoWeek(a) === isoWeek(b)
}

export interface DaySummary {
  date: string
  bioZHours: number
  otherHours: number
  get totalHours(): number
}

export interface WeekSummary {
  week: number
  days: DaySummary[]
  bioZHours: number
  otherHours: number
  totalHours: number
  goal: WeekGoal
}

/** Fasst alle Einträge einer Woche zu Tages- und Wochensummen zusammen. */
export function summarizeWeek(
  entries: Entry[],
  refISO: string,
  goal: WeekGoal = DEFAULT_GOAL,
): WeekSummary {
  const days = weekDays(refISO)
  const inWeek = entries.filter((e) => days.includes(e.date))

  const daySummaries: DaySummary[] = days.map((date) => {
    let bioZHours = 0
    let otherHours = 0
    for (const e of inWeek.filter((x) => x.date === date)) {
      if (getBlock(e.blockId)?.isBioZ) bioZHours += e.hours
      else otherHours += e.hours
    }
    return {
      date,
      bioZHours,
      otherHours,
      get totalHours() {
        return this.bioZHours + this.otherHours
      },
    }
  })

  const bioZHours = daySummaries.reduce((s, d) => s + d.bioZHours, 0)
  const otherHours = daySummaries.reduce((s, d) => s + d.otherHours, 0)

  return {
    week: isoWeek(parseISO(refISO)),
    days: daySummaries,
    bioZHours,
    otherHours,
    totalHours: bioZHours + otherHours,
    goal,
  }
}
