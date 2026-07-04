# Spec — Schritt 1c: Statische Timeline

> Status: **umgesetzt** (2026-07-04). Erfolgskriterien erfüllt.

## Befunde aus der Umsetzung

- Die Achsen-Position ist **dynamisch** geworden (`axisY` rückt nach unten,
  wenn Punkte hoch stapeln) — mit fixem `axisY` wären gestapelte Punkte oben
  aus dem SVG gewachsen. Erst beim Implementieren aufgefallen.
- Rand-Ticks („1400"/„1700") brauchen `text-anchor` start/end statt middle,
  sonst werden sie an den SVG-Kanten abgeschnitten.
- Erste Spannen-Lane braucht eigenen Abstand (`spanOffset` 30 statt
  `axisGap` 18), sonst kollidiert sie mit den Tick-Beschriftungen.
- Kappung live bestätigt: das Känozoikum (−66 Mio – 2026) zieht sich korrekt
  als randloser Balken über die volle Breite.
- Mutations-Stichprobe: verfälschte Skalenformel (+7) riss 6 Tests über
  L1 und L2 — das Netz greift ebenenübergreifend.
> Bau-Zyklus: Spec → Code+Tests → Handbuch → Abschluss (`WORKFLOW.md`).

## Ziel (ein Satz)

Die geladenen Ereignisse erscheinen zum ersten Mal als **gezeichnete
Zeitachse** (SVG): Punkte für Zeitpunkte, Balken für Zeitspannen, ein fester
Zeitausschnitt — korrekt und getestet, aber bewusst noch ohne Zoom (1d),
Filter (1e) und Gestaltungs-Ehrgeiz (1g).

## Leitplanke: korrekt, nicht schön

1c darf wüst aussehen (überlappende Beschriftungen, viele Lanes). Der
Anspruch ist **geometrische Korrektheit**: jedes sichtbare Event an der
richtigen Stelle, jede Spanne mit richtiger Länge. Das Schöne ist 1g —
und soll dort aus dem Herumspielen mit 1c–1f entstehen.

## Was 1c kann

1. **Layout als reine Funktionen** (`src/app/timeline/layout/`, Kategorie T
   aus `testing.md`) — die Architektur-Entscheidung wird ernst:

   ```
   layoutTimeline(events, viewport) → {
     points: { event, x, lane }[]        // Zeitpunkte
     spans:  { event, x1, x2, lane }[]   // Zeitspannen (an Viewport-Rändern gekappt)
     ticks:  { x, label }[]              // Achsenbeschriftung
   }
   ```

   - baut auf `yearToX` (1a) auf; `HistoricalDate` → Jahresbruchteil
     (Monat/Tag anteilig), damit z. B. Jan. und Okt. 1492 unterscheidbar sind
   - Events außerhalb des Viewports werden weggelassen; hineinragende
     Spannen an den Rändern gekappt
   - **Lane-Packing** (einfachster Greedy-Algorithmus): überlappende
     Spannen/Punkte weichen in die nächste freie Zeile aus — deterministisch,
     damit testbar
   - **Ticks**: feste Schrittweite passend zum Ausschnitt (z. B. alle
     50 Jahre), Beschriftung über `formatYear`

2. **Timeline-Komponente** (`src/app/timeline/timeline.ts`): bekommt Events +
   Viewport als Inputs, ruft `layoutTimeline` auf und zeichnet stumpf ab:
   `<line>` für die Achse, `<circle>` für Punkte, `<rect>` für Spannen,
   `<text>` für Titel und Ticks. Natives `<title>` je Marker (Hover zeigt
   Titel + Jahr) — mehr Interaktion kommt in 1f.
   SVG mit `role="img"` + `aria-label` (AXE-Basics, s. testing.md).

3. **Einbindung:** Die Timeline **ersetzt die Liste** aus 1b. Start-Viewport
   fest: **1400–1700** (das dichte Kernfenster des Datensatzes). Was außerhalb
   liegt (Erdzeitalter, Anker), ist in 1c unsichtbar und wird mit dem Zoom
   (1d) erreichbar. Darunter eine Zeile: „N von M Ereignissen im Ausschnitt".

4. **Darstellung bewusst neutral:** eine Farbe für alles, keine
   Kategorie-Farben (das ist Q1a und gehört in 1g).

## Was 1c bewusst NICHT kann

- Kein Zoom/Pan (1d), kein Filtern (1e), keine Detailansicht (1f).
- Keine Kategorie-Farben, kein Clustering, keine Überlapp-Vermeidung bei
  Beschriftungen (1g).
- Keine Lösung für Q6/Q7 (offene Enden, große Jahreszahlen) — bei
  Viewport 1400–1700 drängt beides noch nicht.

## Woran man Erfolg erkennt

- [ ] Live-URL zeigt die Achse 1400–1700 mit Ticks, Punkten und Balken;
      Stichproben stimmen: Lepanto (1571) sitzt rechts der Mitte, die
      Italienischen Kriege (1494–1559) als Balken, das 1492er-Cluster dicht
      beieinander, Konzil von Trient (1545–1563) als Balken in eigener Lane,
      wo es sich mit anderen Spannen überschneidet.
- [ ] Die Layout-Funktionen sind mit den fiesen Fällen L1-getestet:
      Spanne ragt links/rechts hinaus, Spanne umschließt den Viewport
      komplett (Italienische Kriege bei engem Ausschnitt), Punkt exakt auf
      der Grenze, Lane-Packing bei Überlappung, Monatsanteile.
- [ ] L2 (Kategorie T): berechnete Positionen kommen als SVG-Attribute im
      DOM an; AXE-Basics bestehen.
- [ ] L3: die Seite zeigt das SVG mit Markern; ein bekannter Titel ist als
      `<title>` vorhanden.
- [ ] Mutations-Stichprobe: Layout-Formel absichtlich verfälschen → L1 rot.
- [ ] CI grün, Deploy aktuell.

## Technische Festlegungen

- Feste SVG-Breite über `viewBox` (z. B. 1000 Einheiten), skaliert per CSS
  auf Containerbreite — die Layout-Mathematik bleibt von Pixeln entkoppelt.
- Lane-Höhen/Abstände als Konstanten im Layout-Modul, nicht im Template.
- Der Start-Viewport (1400–1700) lebt als Konstante in der App — 1d macht
  ihn dann beweglich (Signal).
