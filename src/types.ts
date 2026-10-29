// Domänen-Typen für Lenas Stundenzettel (Variante 1)

/** Ein "Hut" / Block, dem eine Tätigkeit zugeordnet wird. */
export interface Block {
  /** Kürzel wie im Notizbuch, z. B. "BZ", "Ö1". */
  id: string
  /** Ausgeschriebener Name, z. B. "BioZ / TW (hinten)". */
  name: string
  /** Kurzer Zusatz, z. B. "Podcast, Zeitung, TW 2.0 …". */
  hint: string
  /** CSS-Farbe für Chips und Balken. */
  color: string
  /** Zählt dieser Block zum BioZ-Ziel (10 h/Woche)? */
  isBioZ: boolean
  /** Stichworte, aus denen die Automatik den Block erkennt. */
  keywords: string[]
}

/** Ein Termin aus dem Kalender (wird vorausgefüllt). */
export interface CalendarEvent {
  id: string
  /** ISO-Datum, z. B. "2026-10-27". */
  date: string
  title: string
  /** Dauer in Stunden. */
  hours: number
  start?: string // "18:30"
  end?: string // "19:30"
}

/** Eine einzelne erfasste Tätigkeit an einem Tag. */
export interface Entry {
  id: string
  date: string // ISO-Datum
  title: string
  hours: number
  /** Zugeordneter Block (Kürzel) – null, solange offen. */
  blockId: string | null
  /** Woher kommt der Eintrag? */
  source: 'calendar' | 'manual'
  /** Automatik unsicher → wandert in "Welcher Hut?". */
  needsReview: boolean
  start?: string
  end?: string
}

/** Eine gelernte Regel: "dieser Text gehört immer zu diesem Block". */
export interface Rule {
  /** Normalisiertes Stichwort. */
  keyword: string
  blockId: string
  /** Wie oft bestätigt (für spätere Priorisierung). */
  count: number
}

export interface WeekGoal {
  totalHours: number // 27
  bioZHours: number // 10
}
