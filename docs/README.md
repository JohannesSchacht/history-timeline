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
- Noch kein Angular-Code — Start mit Schritt 1a (Walking Skeleton) steht bevor.

## Nächste Schritte
- **Spec für Schritt 1a** entwerfen (Bau-Zyklus: Spec → Code+Tests → Handbuch).
- Johannes schreibt eigene Gedanken zum Herzstück (Q1) auf (parallel, eilt
  erst zu Schritt 1g).

## Git
- Branch `main`, Remote `origin` = github.com/JohannesSchacht/history-timeline
- KI committet/pusht an sinnvollen Checkpoints selbstständig.
