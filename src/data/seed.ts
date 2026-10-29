import type { Entry } from '../types'

// Beispiel-Daten, damit die App "mit Einträgen" startet.
// Demo-Woche KW 44 (Mo 26.10.–Fr 30.10.2026), exakt die Zahlen aus der
// Konzeptskizze: Gesamt 22,5 / 27 h, davon BioZ 8 / 10 h, Freitag leer.

let n = 0
const id = () => `seed-${++n}`

export const DEMO_TODAY = '2026-10-27' // Dienstag, wie in der Skizze

const week44: Entry[] = [
  // Mo 26.10.  → BioZ 2 · sonst 2,5
  { id: id(), date: '2026-10-26', title: 'Podcast schneiden', hours: 2, blockId: 'BZ', source: 'manual', needsReview: false },
  { id: id(), date: '2026-10-26', title: 'Team', hours: 2.5, blockId: 'Ö1', source: 'calendar', needsReview: false },

  // Di 27.10.  → BioZ 3 · sonst 1,5
  { id: id(), date: '2026-10-27', title: 'TW 2.0 Runde', hours: 1, blockId: 'BZ', source: 'calendar', needsReview: false, start: '10:00', end: '11:00' },
  { id: id(), date: '2026-10-27', title: 'Podcast schneiden', hours: 1, blockId: 'BZ', source: 'calendar', needsReview: false, start: '14:00', end: '15:00' },
  { id: id(), date: '2026-10-27', title: 'Zeitung', hours: 1, blockId: 'BZ', source: 'manual', needsReview: false },
  { id: id(), date: '2026-10-27', title: 'Kisterl LRA Rechnung', hours: 1.5, blockId: 'Ö2', source: 'manual', needsReview: false },

  // Mi 28.10.  → BioZ 2 · sonst 7
  { id: id(), date: '2026-10-28', title: 'Zeitungssitzung', hours: 1, blockId: 'BZ', source: 'calendar', needsReview: false },
  { id: id(), date: '2026-10-28', title: 'Zeitung: Frauen i. d. LW', hours: 1, blockId: 'BZ', source: 'manual', needsReview: false },
  { id: id(), date: '2026-10-28', title: 'Lenkungskreis + Team', hours: 4, blockId: 'Ö1', source: 'calendar', needsReview: false },
  { id: id(), date: '2026-10-28', title: 'Homepage Termine', hours: 2, blockId: 'Ö4', source: 'manual', needsReview: false },
  { id: id(), date: '2026-10-28', title: 'WSK Kartoffeln Ecksberg', hours: 1, blockId: 'Ö3', source: 'manual', needsReview: false },

  // Do 29.10.  → BioZ 1 · sonst 3,5
  { id: id(), date: '2026-10-29', title: 'Videoportraits Andrea', hours: 1, blockId: 'BZ', source: 'manual', needsReview: false },
  { id: id(), date: '2026-10-29', title: 'Mails', hours: 1.5, blockId: 'Ö1', source: 'manual', needsReview: false },
  { id: id(), date: '2026-10-29', title: 'Infobrief', hours: 2, blockId: 'Ö4', source: 'manual', needsReview: false },

  // Fr 30.10.  → bewusst leer ("noch leer")
]

// Rückstand aus Mai–Oktober: offene "Welcher Hut?"-Fragen (6 Stück).
const openQuestions: Entry[] = [
  { id: id(), date: '2026-07-08', title: 'TW Vorstand', hours: 1, blockId: null, source: 'calendar', needsReview: true, start: '18:30', end: '19:30' },
  { id: id(), date: '2026-05-26', title: 'Verbundpartner Call', hours: 1, blockId: null, source: 'calendar', needsReview: true },
  { id: id(), date: '2026-08-20', title: 'Bio auf der Wiesn Vorbereitung', hours: 2, blockId: null, source: 'manual', needsReview: true },
  { id: id(), date: '2026-09-15', title: 'Simon Treffen', hours: 1.5, blockId: null, source: 'calendar', needsReview: true },
  { id: id(), date: '2026-10-06', title: 'AHV Austausch', hours: 1, blockId: null, source: 'manual', needsReview: true },
  { id: id(), date: '2026-09-28', title: 'Presse Interview bioregio', hours: 1, blockId: null, source: 'manual', needsReview: true },
]

export const SEED_ENTRIES: Entry[] = [...week44, ...openQuestions]
