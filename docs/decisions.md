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
