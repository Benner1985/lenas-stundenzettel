# Lenas Stundenzettel

Eine kleine **Handy-App (PWA)**, die Lenas Arbeitstage in ihre bestehende
Excel-Liste bringt – ohne Abtippen und ohne Grübeln, welcher „Hut" wohin
gehört. Umgesetzt ist **Variante 1** aus dem Konzept: *täglich kurz im
Handy eintragen, Excel auf Knopfdruck.*

## Was die App kann

- **Heute** – Tag eintragen. Kalendertermine sind vorausgefüllt; Tätigkeiten
  per Chip oder freiem Text antippen. Die App ordnet automatisch den Block zu.
- **Woche** – Wochenziel live: 27 h gesamt / 10 h BioZ als Balken, pro Tag
  die Stunden, Hinweise wie „Noch 2 h BioZ offen. Fr?".
- **Fragen** – „Welcher Hut?": nur bei Unklarem. Jede Antwort wird zur Regel
  („Immer so zuordnen").
- **Excel** – schreibt die Einträge in Lenas **bestehende** Datei (gleiche
  Spalten, Summen bleiben erhalten) und gibt **dieselbe** Datei zurück –
  keine neue.

Alle Daten liegen lokal im Browser (`localStorage`), die App läuft auch
offline.

## Die Hüte (Blöcke)

| Hut | Bedeutung | Spalten in der Excel |
|-----|-----------|----------------------|
| BZ  | BioZ / TW (hinten) | „BioSuL" (CA–CF) · Folgeprojekt von BioSuL |
| Ö1  | Koordination | Block 1 (B–G) |
| Ö2  | bio-regional | Block 2 (I–N) |
| Ö3  | Wertschöpfung | Block 3 (P–U) |
| Ö4  | Kommunen / ÖA | Block 4 (W–AB) |
| Ö7  | Netzwerk ÖMR | Block 7 (AR–AW) |

Grundlage ist `250303_Erfassung_Projekt-Arbeitszeit_Lena.xlsx`,
Blatt „Tabelle gesamt" (Spalte A = Datum, je Block 6 Spalten
Beginn/Ende/Stunden/Tagessatz/Verantw./Tätigkeit, Stunden = `Ende − Beginn`).

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # Produktions-Build nach dist/
npm run preview  # Build lokal ansehen
```

Stack: Vite + React + TypeScript + Tailwind CSS v4, `exceljs` für den
Excel-Export (wird erst beim Export nachgeladen).

## Auf dem Handy installieren

Keine App Store nötig – die Seite im Browser öffnen und zum Home-Bildschirm
hinzufügen:

- **iPhone (Safari):** Teilen-Symbol → „Zum Home-Bildschirm"
- **Android (Chrome):** Menü → „App installieren"

## Veröffentlichung

Wird per GitHub Actions automatisch auf **GitHub Pages** veröffentlicht
(siehe `.github/workflows/deploy.yml`). Adresse nach dem ersten Deploy:
`https://benner1985.github.io/lenas-stundenzettel/`

## Noch offen

- Excel-Schreiben mit Lenas echter Datei durchtesten (Uhrzeiten, Summenzeilen
  je Zeitraum – neue Einträge gehören in einen neuen Zeitraum-Abschnitt).
- Echte Kalender-Anbindung statt Beispiel-Termine.
