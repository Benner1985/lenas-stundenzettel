import type { CalendarEvent } from '../types'

// Kalender-Termine. Sobald der echte Kalender-Import gebaut ist, kommen
// die Termine hier rein. Für den leeren Start ist die Liste bewusst leer
// (keine Beispiel-Termine mehr).
const EVENTS: CalendarEvent[] = []

export function getCalendarEvents(dateISO: string): CalendarEvent[] {
  return EVENTS.filter((e) => e.date === dateISO)
}

/** Schnelle Tätigkeiten zum Antippen auf dem Tages-Screen ("Was noch?"). */
export const QUICK_ACTIVITIES = [
  'Zeitung',
  'Kisterl',
  'Team',
  'Mails',
  'Homepage',
  'Podcast',
  'Presse',
  'WSK',
]
