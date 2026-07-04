# Entscheidungs-Log

Je Eintrag: Entscheidung — kurze Begründung. (Zeitstempel trägt die Git-Historie.)

- **Frontend: Angular** — vom Nutzer gesetzt, Teil des Lernziels.
- **Hosting: GitHub, öffentlich** (`JohannesSchacht/history-timeline`) — als Portfolio/Referenz.
- **Vision-Prozess: KI schreibt Entwurf, Mensch korrigiert** — Reagieren ist präziser als aus dem Nichts spezifizieren.
- **Darstellung: eine Zeitachse** (keine parallelen Stränge) — Fokus auf Gleichzeitigkeit und Abfolge auf einer Achse.
- **Ereignis-Typen: Zeitpunkte UND Zeitspannen** — Geschichte braucht beides (Schlacht vs. Epoche).
- **Erster Fokus: Persona A (Erkunder)** — neugierig/lernend, „was passierte gleichzeitig?". B (Rechercheur) und C (kuratierte Story) kommen später.
- **B/C erst nach Hands-on** — sie lassen sich nicht am Reißbrett entwerfen; man muss erst mit dem Produkt herumspielen. Das Produkt bringt die nächsten Anforderungen selbst hervor.
- **Kategorien: mehrere pro Event (`categories[]`)** — Ereignisse sind mehrthemig (Lepanto: Militär+Religion). Typ dagegen bleibt genau einer (ein Event IST eine Geburt).
- **Komposition geparkt** — zusammengesetzte Events (z.B. Lebenslauf) kommen erst nach Hands-on; Start mit flachem Event-Kern.
- **Taxonomie: iterativ statt Reißbrett** — Events referenzieren Kategorie-Knoten per stabiler ID; Verfeinern = Kinder anhängen (Eltern-Zuordnung bleibt gültig, nur „gröber"). Harte Umbauten (Split/Merge) über deprecated-Knoten + KI-gestützte Umklassifizierung.
- **Start-Taxonomie: fast leer** — nur wenige grobe Wurzelknoten (Politik, Militär, Kultur, Wissenschaft, Religion, Wirtschaft …); alles Weitere wächst aus den erfassten Events.
- **Architektur Stufe 1: Frontend-only** — Angular-SPA, Daten als JSON-Dateien im Repo, keine DB, Hosting auf GitHub Pages. Backend erst mit dem Nordstern (Stufe 3).
- **Eiserne Regel: alle Datenzugriffe durch `EventRepository`** — die App weiß nie, woher Daten kommen (JSON heute, Backend/KI später austauschbar).
- **Timeline-Rendering: SVG selbst gebaut** — keine fertige Timeline-Bibliothek, damit das Herzstück (Q1) nicht von Bibliotheksgrenzen eingezäunt wird.
- **State: Signals pur bis 1d, `@ngrx/signals` SignalStore ab 1e (Filter)** — kein Full-NgRx (Actions/Reducer/Effects). Lerneffekt: erst nackte Signals, dann was der Store zusätzlich gibt.
- **Handbuch = Nutzerhandbuch** (`docs/handbook.md`) — wächst je Bau-Schritt. Entwickler-Wissen lebt in CLAUDE.md + Code.
- **Testkonzept: kommt von Johannes** aus einem anderen Projekt (Ausgangsbasis neben den vorhandenen Playwright-Skills). Test-Setup in 1a bewusst minimal halten.
- **Commit/Push: KI darf an sinnvollen Checkpoints selbst committen und pushen** (Doku-Stände, abgeschlossene Schritte) — von Johannes freigegeben („zwischendurch").
- **Test-Strategie: Destillat aus `Testing-Long-Spec.md`** (eigenes Dokument `testing.md`; die Quelle bleibt unverändert als Referenz). Drei Schichten L1/L2/L3, hermetisch by construction.
- **MSW erst mit Ausbaustufe 3** — in Stufe 1 gibt es keine HTTP-Grenze, die sich zu mocken lohnt; Fake-`EventRepository` per DI. Rückholpunkt dokumentiert.
- **Tier-Prinzip geschrumpft auf P/C/T** — neue Komponentensorten (Dialog, Tastatur-Nav) werden bei Bedarf aus dem Quell-Katalog nachdestilliert.
- **Layout-Logik als reine Funktionen** — Geometrie (Zeit↔Pixel, Zoom, Anordnung) getrennt vom SVG-Rendering: `(Events, Viewport) → Positionen`. Macht das Herzstück auf L1 testbar und Layout-Strategien austauschbar (Q1/Q1b).
- **AXE als leichte Pflicht** — eine Prüfung je Komponente; für die Timeline nur Basics (role/label), echte SVG-Erkundbarkeit geparkt (Q5).
- **Coverage: nur ein globaler Boden (~80 % Statements)** — kein Ratcheting, keine Bereichs-Matrix; inhaltliche Qualität sichert die Definition-of-Done.
