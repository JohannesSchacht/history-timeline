# Architektur

> Status: **abgestimmt** (Grundsatz). Der Technologie-Stack im Detail ist
> Entwurf — siehe Markierungen.

## Grundsatz: drei Ausbaustufen

**Stufe 1 — jetzt: Frontend-only**

```
┌────────────────────────────────┐
│  Angular SPA (Browser)         │
│  ┌──────────┐   ┌───────────┐  │
│  │ Timeline │ ← │ EventRepo │←── events.json, taxonomy.json
│  │ + Filter │   │ (Service) │  │   (statische Dateien im Repo)
│  └──────────┘   └───────────┘  │
└────────────────────────────────┘
        gehostet auf GitHub Pages
```

- Daten = JSON-Dateien im Git-Repo. Versionierter Datenbestand: Taxonomie-
  Verfeinerungen sind Commits, die Migrationshistorie ist die Git-History.
- Keine Datenbank. Bei hunderten bis wenigen tausend Events filtert der
  Browser im Speicher.

**Stufe 2 — später:** Erfassen/Editieren in der App; Speichern weiter Richtung
JSON oder gegen ein sehr dünnes Backend.

**Stufe 3 — Nordstern:** echtes Backend + DB für Accounts, Sharing,
KI-Recherche. Kandidaten (bewusst offen): BaaS (Supabase/Firebase) vs.
eigene API (Node/NestJS oder .NET + PostgreSQL).

## Eiserne Regel

**Alle Datenzugriffe laufen durch einen einzigen Service (`EventRepository`).**
Komponenten wissen nie, woher Daten kommen. Beim Übergang zu Stufe 2/3 wird
nur die Repository-Implementierung getauscht — der Rest der App merkt nichts.
Das ist der gesamte „Vorbau", den der Nordstern in Stufe 1 kosten darf.

## Timeline-Rendering: SVG, selbst gebaut

Keine fertige Timeline-Bibliothek. Begründung: Das Herzstück des Projekts
(Q1 — optische Gestaltung der gefilterten Ansicht, inkl. KI-errechneter
Gestaltung Q1b) braucht volle Freiheit im Rendering. Eine Bibliothek wäre
schneller fertig, würde aber genau dort einzäunen, wo wir experimentieren
wollen.

## Technologie-Stack Stufe 1 (Entwurf, zum Anecken)

| Bereich | Wahl | Begründung |
|---|---|---|
| Framework | Angular, aktuelle Version (`ng new`-Stand) | gesetzt; Standalone Components, Signals, zoneless |
| Sprache | TypeScript, `strict` | Fehler früh, KI-generierter Code wird prüfbarer |
| State | Signals pur; ab 1e `@ngrx/signals` SignalStore | kein Full-NgRx; Store erst, wenn echter koordinierter State entsteht (Filter) |
| Styling | SCSS, **keine** Component-Library vorerst | Timeline ist Eigenbau; Filter-UI zunächst schlicht |
| Unit-Tests | der aktuelle `ng new`-Default (Vitest) | Standard-Weg, wenig Reibung |
| E2E-Tests | Playwright | de-facto-Standard; vorhandene Playwright-Workflows nutzbar |
| Lint/Format | ESLint + Prettier | Konsistenz, gerade bei KI-generiertem Code |
| CI/Deploy | GitHub Actions → GitHub Pages | deployt direkt aus dem Repo, kostenlos |

## Datenhaltung Stufe 1

- `data/events.json` — der Event-Bestand (flacher Kern, s. decisions.md)
- `data/taxonomy.json` — Kategorien-Baum (startet fast leer) + Typen-Liste
- Events referenzieren Taxonomie-Knoten per stabiler ID.
