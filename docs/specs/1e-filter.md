# Spec — Schritt 1e: Filter

> Status: **umgesetzt** (2026-07-05). Erfolgskriterien erfüllt.

## Befunde aus der Umsetzung

- **`@ngrx/signals` gibt es erst bis v21** (Peer: Angular 21) — installiert
  mit `--legacy-peer-deps` unter Angular 22; alle Tests/Builds grün (die
  Bibliothek liegt dünn über den unveränderten Signals-APIs).
  **Rückholpunkt:** auf `@ngrx/signals@22` wechseln, sobald erschienen.
- **e2e-Denkfehler abgefangen:** Die erste Fassung prüfte „Thermopylen
  verschwindet nach Militär-Abwahl" — trivially wahr, weil Thermopylen
  außerhalb des 1400–1700-Ausschnitts liegt. Assertion durch Events im
  Ausschnitt ersetzt (95 Thesen weg, David bleibt). Lehre: e2e-Assertions
  gegen den sichtbaren Zustand denken, nicht gegen den Datenbestand.
- Mutations-Stichprobe (ODER→UND): 3 Tests rot über L1/Store/Panel.
> Bau-Zyklus: Spec → Code+Tests → Handbuch → Abschluss (`WORKFLOW.md`).

## Ziel (ein Satz)

Der Nutzer bestimmt, **welche** Ereignisse auf der Achse liegen — Auswahl
nach Kategorien und Typen —, und damit wird das Kernversprechen der Vision
(„filtern und anordnen") erstmals komplett erlebbar; zugleich zieht der
**SignalStore** als State-Lösung ein (Entscheidung aus `decisions.md`).

## Filter-Semantik (der inhaltliche Kern)

1. **Kategorien (Mehrfachauswahl, Startzustand: alle an).**
   Ein Event ist sichtbar, wenn **mindestens eine** seiner Kategorien
   ausgewählt ist (ODER-Semantik). Konsequenz für Mehrkategorien-Events:
   Lepanto (Militär+Religion) verschwindet erst, wenn *beide* abgewählt
   sind. Das ist die erkunder-freundliche Lesart von „Filtern = ausblenden".
2. **Baum-Semantik:** Eine gewählte Kategorie schließt ihre Nachfahren ein
   („Militär" umfasst künftige Kinder wie „Schlacht"). Bei der noch flachen
   Start-Taxonomie unsichtbar, aber von Anfang an korrekt implementiert —
   die Taxonomie wächst ja iterativ.
3. **Typen (Mehrfachauswahl, Startzustand: alle an).** Gleiche Logik,
   zweite unabhängige Achse: Kategorie- UND Typ-Filter müssen beide passen.
4. **Kein separater Zeitraum-Filter** — bewusste Abweichung von der
   Roadmap-Kurzbeschreibung: Der zoombare Viewport (1d) *ist* die
   Zeitraum-Auswahl des Erkunders. Ein zweites Zeitraum-UI wäre redundant;
   falls B/C (Rechercheur) es später braucht, ist es ein Rückholpunkt.

Die Filter-Logik lebt als **reine Funktion** `filterEvents(events, auswahl)`
— L1-testbar, und in 1g direkt wiederverwendbar (Q1: „Filtern ist mehr als
Ausblenden" baut darauf auf).

## SignalStore-Zuschnitt (das Lernziel)

`@ngrx/signals` zieht ein — ein **`TimelineStore`** hält den UI-Zustand:

```
withState:    viewport, selectedCategoryIds, selectedTypeIds
withComputed: filteredEvents (Repo-Events × Filter, Baum-expandiert),
              taxonomy (durchgereicht), Zählwerte
withMethods:  load(), setViewport(), toggleCategory(), toggleType()
```

- Das `EventRepository` bleibt unangetastet (eiserne Regel) — der Store
  *konsumiert* es. App/Timeline/Filter-Panel reden nur noch mit dem Store;
  die App-Komponente wird dünn.
- Lerneffekt sichtbar: dieselbe App, einmal „nackte Signals" (bis 1d,
  Git-History) vs. Store (ab 1e).

## UI (bewusst schlicht)

Eine **Filterleiste über der Timeline**: zwei beschriftete Gruppen
(„Kategorien", „Typen") mit Checkbox-Chips, dazu je Gruppe „alle/keine".
Semantisches HTML (`fieldset`/`legend`, echte Checkboxen — AXE-tauglich),
keine Component-Library. Schönheit ist 1g.

## Was 1e bewusst NICHT kann

- Kein Zeitraum-Filter (s. o.), keine Volltextsuche.
- Kein „Hervorheben statt Ausblenden" — das ist die Q1-Gestaltungsfrage (1g).
- Keine Orts-Filter (wenig Wert bei 35 Orten ohne Karte; Rückholpunkt).
- Filter überleben kein Neuladen (keine URL-/LocalStorage-Persistenz) —
  Rückholpunkt, wenn Teilen/Lesezeichen relevant wird (Persona C).

## Woran man Erfolg erkennt

- [ ] Live: Kategorie „Militär" abwählen → Schlachten verschwinden,
      Lepanto bleibt (Religion ist noch an); zusätzlich „Religion" abwählen
      → Lepanto verschwindet. Zähler passt sich an.
- [ ] Typ „Geburt" abwählen → Geburts-Events verschwinden, unabhängig von
      Kategorien.
- [ ] „keine" bei Kategorien → leere Achse (Achse + Ticks bleiben sichtbar).
- [ ] L1: `filterEvents` (ODER-Semantik, Baum-Expansion, Typ×Kategorie-
      Schnitt, Leerauswahl) + Store-Tests mit Fake-Repo (Zustand, Toggles).
- [ ] L2: Filter-Panel rendert aus der Taxonomie, Toggles wirken auf die
      Timeline; AXE (fieldset/legend/Labels).
- [ ] L3: der Lepanto-Ablauf von oben als e2e.
- [ ] Mutations-Stichprobe; CI grün; Handbuch ergänzt.

## Technische Festlegungen

- `@ngrx/signals` als Dependency (passend zur Angular-Version).
- Filter-Panel als eigene Komponente `src/app/filter/filter-panel.ts`
  (Kategorie C aus testing.md).
- `filterEvents` + Baum-Expansion in `src/app/data/filter.ts` (rein).
