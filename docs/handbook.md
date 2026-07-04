# Handbuch — history-timeline

Nutzerhandbuch. Wächst mit jedem Bau-Schritt (`WORKFLOW.md`, Bau-Zyklus).

## Die App aufrufen

Die App läuft im Browser, ohne Installation:

**https://johannesschacht.github.io/history-timeline/**

Jede Änderung, die das Projekt auf dem `main`-Branch erreicht, ist nach
wenigen Minuten automatisch dort sichtbar.

## Was die App zeigt (Stand: Schritt 1b)

Die App lädt einen kuratierten Beispieldatensatz (49 historische Ereignisse,
Schwerpunkt Europa 1450–1650, mit Ankern von der Antike bis zur Mondlandung)
und zeigt ihn als schlichte Liste: Jahr(e) und Titel je Ereignis, inklusive
v.-Chr.-Datierungen und Zeitspannen. Die grafische Zeitachse folgt in
Schritt 1c.

Die Daten liegen als JSON-Dateien im Repository (`public/data/`) und können
dort gepflegt werden; ein automatischer Test validiert sie bei jedem Push.

## Für Entwickler (Kurzreferenz)

| Befehl | Wirkung |
|---|---|
| `npm start` | Entwicklungs-Server auf http://localhost:4200 (Live-Reload) |
| `npm test` | Unit-Tests (L1/L2, Vitest) |
| `npm run test:verbose` | Unit-Tests mit Einzelauflistung aller Tests |
| `npm run e2e` | Produktions-Build + Browser-Tests (L3, Playwright) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier über src/ und e2e/ |
