// Zuordnung von Lenas Hüten zu den echten Spalten in
// "250303_Erfassung_Projekt-Arbeitszeit_Lena.xlsx", Blatt "Tabelle gesamt".
//
// Aufbau der Datei (ausgelesen 2026-10):
//  - Spalte A          = Datum (für Blöcke 1–7)
//  - Zeile 9           = Spaltenüberschriften
//  - Daten ab Zeile 10
//  - je Block 6 Spalten: Beginn, Ende, Stunden(=Ende−Beginn), Tagessatz, Verantw., Tätigkeit
//  - Summenzeilen unten (u. a. Zeile 1155) mit SUM(...)-Formeln je Spalte
//
// "BioZ / TW (hinten)" → BioSuL (CA–CF). Von Lena bestätigt (29.10.2026):
// BioZ ist das Folgeprojekt von BioSuL, wird aber weiterhin so genannt.
// Passt zu Zeile 1160 "SUMME TW" = CC1155.

export interface ColumnGroup {
  /** Spalte für Beginn (z. B. "B"). */
  begin: string
  end: string
  hours: string
  taetigkeit: string
}

/** blockId (aus data/blocks.ts) -> Spaltengruppe in der Excel. */
export const EXCEL_COLUMNS: Record<string, ColumnGroup> = {
  'Ö1': { begin: 'B', end: 'C', hours: 'D', taetigkeit: 'G' },
  'Ö2': { begin: 'I', end: 'J', hours: 'K', taetigkeit: 'N' },
  'Ö3': { begin: 'P', end: 'Q', hours: 'R', taetigkeit: 'U' },
  'Ö4': { begin: 'W', end: 'X', hours: 'Y', taetigkeit: 'AB' },
  'Ö7': { begin: 'AR', end: 'AS', hours: 'AT', taetigkeit: 'AW' },
  // noch zu bestätigen:
  'BZ': { begin: 'CA', end: 'CB', hours: 'CC', taetigkeit: 'CF' },
}

export const EXCEL_SHEET = 'Tabelle gesamt'
export const EXCEL_DATE_COLUMN = 'A'
export const EXCEL_FIRST_DATA_ROW = 10
