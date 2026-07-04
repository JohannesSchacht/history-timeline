# Handbuch — history-timeline

Nutzerhandbuch. Wächst mit jedem Bau-Schritt (`WORKFLOW.md`, Bau-Zyklus).

## Die App aufrufen

Die App läuft im Browser, ohne Installation:

**https://johannesschacht.github.io/history-timeline/**

Jede Änderung, die das Projekt auf dem `main`-Branch erreicht, ist nach
wenigen Minuten automatisch dort sichtbar.

## Was die App zeigt (Stand: Schritt 1d)

Die App zeigt eine **bewegliche Zeitachse** (Start: 1400–1700):

- **Mausrad** zoomt hinein und heraus — um die Position des Mauszeigers:
  Das Jahr unter dem Zeiger bleibt stehen, die Umgebung dehnt/staucht sich.
- **Ziehen mit gedrückter Maustaste** verschiebt den Ausschnitt.
- Der erreichbare Bereich: von der Entstehung der Erde (4,6 Mrd. Jahre,
  Achse zeigt „Mrd./Mio. v. Chr.") bis in einzelne Jahre hinein.

- **Punkte über der Achse** sind Zeitpunkt-Ereignisse (z. B. die Seeschlacht
  von Lepanto 1571); bei dichtem Gedränge stapeln sie sich nach oben.
- **Balken unter der Achse** sind Zeitspannen (z. B. der Dreißigjährige
  Krieg); Spannen, die über den Ausschnitt hinausreichen, laufen bis zum Rand.
- **Mauszeiger über einem Marker** zeigt Titel und Jahr(e).
- Die Zeile über der Achse nennt, wie viele der geladenen Ereignisse im
  Ausschnitt sichtbar sind.

Der Datensatz (57 Ereignisse) reicht von der Entstehung der Erde bis zur
Mondlandung; außerhalb des Ausschnitts liegende Ereignisse werden mit dem
Zoom (Schritt 1d) erreichbar. Beschriftungen dürfen sich derzeit noch
überlappen — die optische Gestaltung ist Schritt 1g.

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
