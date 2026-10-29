import { monthName } from './format'

// Zeiträume für den Export. Quartale folgen Lenas Excel-Schema
// (Geschäftsjahr ab Juni): Jun–Aug, Sep–Nov, Dez–Feb, Mär–Mai.

export type PeriodScope = 'month' | 'quarter' | 'custom' | 'all'

const SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

export function monthLabel(d: Date): string {
  return `${monthName(d.getMonth())} ${d.getFullYear()}`
}

export function inMonth(iso: string, d: Date): boolean {
  return iso.startsWith(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
}

export function shiftMonth(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(1)
  x.setMonth(x.getMonth() + n)
  return x
}

/** Die drei Monate {y, m(1–12)} des Quartals, in dem `d` liegt. */
function quarterMonths(d: Date): { y: number; m: number }[] {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  let sm: number
  let sy: number
  if (m >= 6 && m <= 8) { sm = 6; sy = y }
  else if (m >= 9 && m <= 11) { sm = 9; sy = y }
  else if (m === 12) { sm = 12; sy = y }
  else if (m <= 2) { sm = 12; sy = y - 1 } // Jan/Feb gehören zum Dez-Feb-Quartal
  else { sm = 3; sy = y }
  const out: { y: number; m: number }[] = []
  for (let i = 0; i < 3; i++) {
    let mm = sm + i
    let yy = sy
    if (mm > 12) { mm -= 12; yy += 1 }
    out.push({ y: yy, m: mm })
  }
  return out
}

export function inQuarter(iso: string, d: Date): boolean {
  const [yy, mm] = iso.split('-').map(Number)
  return quarterMonths(d).some((q) => q.y === yy && q.m === mm)
}

export function quarterLabel(d: Date): string {
  const qm = quarterMonths(d)
  const a = qm[0]
  const b = qm[2]
  if (a.y === b.y) return `${SHORT[a.m - 1]}–${SHORT[b.m - 1]} ${a.y}`
  return `${SHORT[a.m - 1]} ${a.y} – ${SHORT[b.m - 1]} ${b.y}`
}

export function shiftQuarter(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(1)
  x.setMonth(x.getMonth() + n * 3)
  return x
}

export function inCustom(iso: string, from: string, to: string): boolean {
  return (!from || iso >= from) && (!to || iso <= to)
}
