# Handbuch — history-timeline

Nutzerhandbuch. Wächst mit jedem Bau-Schritt (`WORKFLOW.md`, Bau-Zyklus).

## Die App aufrufen

Die App läuft im Browser, ohne Installation:

**https://johannesschacht.github.io/history-timeline/**

Sie zeigt derzeit eine Platzhalterseite (Stand: Schritt 1a, Walking
Skeleton). Jede Änderung, die das Projekt auf dem `main`-Branch erreicht,
ist nach wenigen Minuten automatisch dort sichtbar.

## Für Entwickler (Kurzreferenz)

| Befehl | Wirkung |
|---|---|
| `npm start` | Entwicklungs-Server auf http://localhost:4200 (Live-Reload) |
| `npm test` | Unit-Tests (L1/L2, Vitest) |
| `npm run test:verbose` | Unit-Tests mit Einzelauflistung aller Tests |
| `npm run e2e` | Produktions-Build + Browser-Tests (L3, Playwright) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier über src/ und e2e/ |
