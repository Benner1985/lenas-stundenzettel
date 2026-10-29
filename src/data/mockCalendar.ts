import type { CalendarEvent } from '../types'

// Beispiel-Kalender. In der echten App kommen diese Termine aus Lenas
// Kalender; hier sind sie fest hinterlegt, damit der Prototyp ohne
// Anbindung läuft. Termine der Demo-Woche 26.–30.10.2026.
const EVENTS: CalendarEvent[] = [
  // Dienstag 27.10. – entspricht der Skizze "Was war heute?"
  { id: 'cal-1', date: '2026-10-27', title: 'TW 2.0 Runde', hours: 1, start: '10:00', end: '11:00' },
  { id: 'cal-2', date: '2026-10-27', title: 'Podcast schneiden', hours: 1, start: '14:00', end: '15:00' },

  // Mittwoch 28.10.
  { id: 'cal-3', date: '2026-10-28', title: 'Lenkungskreis + Team', hours: 4, start: '08:00', end: '12:00' },
  { id: 'cal-4', date: '2026-10-28', title: 'Zeitungssitzung', hours: 1, start: '13:00', end: '14:00' },

  // Freitag 30.10. – der noch leere Tag
  { id: 'cal-5', date: '2026-10-30', title: 'LVÖ Forum', hours: 2, start: '08:00', end: '10:00' },
  { id: 'cal-6', date: '2026-10-30', title: 'Byodo Call', hours: 1, start: '11:00', end: '12:00' },
]

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
