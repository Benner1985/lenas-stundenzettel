// Kleine Helfer fürs deutsche Zahlen- und Datumsformat.

/** 2.5 -> "2,5"  ·  9 -> "9"  ·  0 -> "0" */
export function hours(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return n.toLocaleString('de-DE', { maximumFractionDigits: 2 })
}

/** 2.5 -> "2,5 h" */
export function hoursLabel(n: number): string {
  return `${hours(n)} h`
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
]

/** "2026-10-27" -> Date (lokal, ohne Zeitzonen-Verschiebung) */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "2026-10-27" -> "Di 27.10." */
export function shortDate(iso: string): string {
  const d = parseISO(iso)
  return `${WEEKDAYS[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}.${String(
    d.getMonth() + 1,
  ).padStart(2, '0')}.`
}

/** "2026-10-27" -> "Dienstag, 27. Oktober" */
export function longDate(iso: string): string {
  const d = parseISO(iso)
  const full = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  return `${full[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`
}

export function monthName(monthIndex: number): string {
  return MONTHS[monthIndex]
}
