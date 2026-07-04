# Spec — Schritt 1a: Walking Skeleton

> Status: **abgestimmt** — Umsetzung läuft.
> Bau-Zyklus: Spec → Code+Tests → Handbuch → Abschluss (`WORKFLOW.md`).

## Ziel (ein Satz)

Eine inhaltlich leere Angular-App, die bei jedem Push automatisch gebaut,
getestet und auf GitHub Pages deployt wird — damit ab jetzt jeder weitere
Schritt sofort online sichtbar ist und die gesamte Test-Infrastruktur
bewiesen funktioniert.

## Was 1a kann

1. **App:** `ng new` (aktuelle Version), Standalone Components, zoneless,
   SCSS, TypeScript `strict`. Sichtbarer Inhalt: eine Seite mit „history-timeline"
   und einem Platzhaltertext — mehr nicht.
2. **Qualitäts-Gerüst:** ESLint + Prettier eingerichtet, laufen lokal
   (`npm run lint`) und in der CI.
3. **Test-Infrastruktur bewiesen** — je ein minimaler Beispieltest pro Schicht:
   - **L1:** eine triviale reine Funktion + Test (Platzhalter für die spätere
     Layout-Geometrie).
   - **L2:** die App-Komponente rendert den Titel; inkl. einer
     AXE-Prüfung (`expectNoAxeViolations`-Helfer wird hier eingerichtet).
   - **L3:** ein Playwright-Test öffnet die App und sieht den Titel
     (Projekt `chromium`, headless).
4. **CI/CD (GitHub Actions):** bei jedem Push auf `main`:
   lint → unit-tests (mit Coverage-Messung, noch ohne Schwelle) →
   build → e2e gegen den Build → Deploy auf GitHub Pages.
5. **Handbuch beginnt:** `docs/handbook.md` mit Kapitel „Die App aufrufen"
   (öffentliche URL).

## Was 1a bewusst NICHT kann

- Kein Datenmodell, kein `EventRepository`, keine Timeline (alles 1b/1c).
- Kein Routing über den Default hinaus, keine Component-Library, kein Theme.
- Keine Coverage-Schwelle (kommt, sobald nennenswerter Code existiert),
  kein Branch-Schutz.

## Woran man Erfolg erkennt

- [ ] `https://johannesschacht.github.io/history-timeline/` zeigt die Seite.
- [ ] Ein Push auf `main` läuft die komplette Pipeline grün durch.
- [ ] Lokal: `npm test`, `npm run lint`, `npm run e2e` — alle grün.
- [ ] Die drei Beispieltests existieren und schlagen fehl, wenn man sie
      mutwillig bricht (Stichprobe: Titel ändern → L2/L3 rot).

## Technische Festlegungen (klein, aber explizit)

- **Paketmanager:** npm. **Node:** aktuelle LTS.
- **Repo-Layout:** Angular-Projekt im Repo-Wurzelverzeichnis (kein Monorepo —
  bei Ausbaustufe 3 ggf. umziehen, Rückholpunkt).
- **GitHub Pages:** Deploy über GitHub Actions (`actions/deploy-pages`),
  `--base-href /history-timeline/`. SPA-Fallback (404.html) erst nötig,
  wenn echtes Routing kommt.
- **e2e in CI:** Playwright läuft gegen den Produktions-Build
  (`ng build` + statischer Server), nicht gegen `ng serve` — testet das,
  was deployt wird.

## Offene Punkte für die Umsetzung

- Exakte Angular-Version = was `ng new` liefert; Abweichungen vom hier
  Beschriebenen (z.B. Test-Runner-Default) werden beim Bauen dokumentiert.
