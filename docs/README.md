# history-timeline — Stand & Landkarte

## Dokumentenlandkarte
- `../CLAUDE.md` — Kurzorientierung je Session
- `../WORKFLOW.md` — Vorgehen inkl. Bau-Zyklus (Spec → Code+Tests → Handbuch)
- `vision.md` — abgestimmtes Grobbild
- `architecture.md` — Ausbaustufen, eiserne Regel, Technologie-Stack
- `roadmap.md` — Ausbau-Schritte 1a–1g (Stufe 1), grob 2–3
- `decisions.md` — getroffene Entscheidungen
- `open-questions.md` — bewusst geparkte offene Fragen

## Aktueller Stand
- Vision, Datenmodell-Kern (Event/Place, categories[], Taxonomie iterativ,
  Komposition geparkt), Architektur (Stufe 1 frontend-only, EventRepository-
  Regel, SVG-Eigenbau) und Stack sind abgestimmt.
- **Test-Strategie abgestimmt** (`testing.md`, destilliert aus
  `Testing-Long-Spec.md`): L1/L2/L3, kein MSW bis Stufe 3, Tiers P/C/T,
  Layout als reine Funktionen, AXE leichte Pflicht, Coverage-Boden ~80 %.
- Glossar angelegt (u.a. Ausbaustufe vs. Schritt).
- **Schritt 1a (Walking Skeleton):** Angular 22 (zoneless, SCSS, strict),
  ESLint+Prettier, Vitest, Playwright, CI mit Pages-Deploy.
  Live-URL: https://johannesschacht.github.io/history-timeline/
- **Schritt 1b (Datenmodell + Repository):** Modell (`HistoricalEvent`,
  Place, Taxonomie), `EventRepository` (abstrakt) + JSON-Implementierung,
  Fixtures + Fake-Repo, Datenvertrags-Test, Beispieldatensatz
  (57 Events: Erdzeitalter bis Mondlandung, Kern Europa 1450–1650).
- **Schritt 1c (statische Timeline):** `layoutTimeline` als reine Funktionen
  (Jahresbruchteile, Viewport-Kappung, Greedy-Lane-Packing, Ticks),
  SVG-Timeline-Komponente (Kategorie T), fester Ausschnitt 1400–1700.
  42 Unit-Tests + 2 e2e.

## Nächste Schritte
- **Spec für Schritt 1d** (Zoom & Pan) entwerfen — Viewport wird beweglich
  (Signal), Achsenbeschriftung dynamisch (dort werden Q7/große Zahlen und
  die Erdzeitalter praktisch relevant).
- Johannes schreibt eigene Gedanken zum Herzstück (Q1) auf (parallel, eilt
  erst zu Schritt 1g).

## Git
- Branch `main`, Remote `origin` = github.com/JohannesSchacht/history-timeline
- KI committet/pusht an sinnvollen Checkpoints selbstständig.
