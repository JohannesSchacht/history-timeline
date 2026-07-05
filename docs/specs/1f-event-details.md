# Spec — Schritt 1f: Event-Details

> Status: **umgesetzt** (2026-07-05). Erfolgskriterien erfüllt.

## Befunde aus der Umsetzung

- **Lint erzwang echte Barrierefreiheit:** `click-events-have-key-events`
  verlangte ein Tastatur-Pendant zum Hintergrund-Klick → **Escape wählt ab**,
  das SVG ist fokussierbar (`tabindex=0`). Die Regel war lästig und hatte
  recht — erster kleiner Riss in „Tastatur ist Q5, geparkt".
- **`formatAxisYear` umgezogen** von `timeline/layout/` nach `data/format.ts`
  (Schichtung: data darf nicht von timeline abhängen); Re-Export erhält
  bestehende Importe.
- **Playwright-Hit-Check im dichten Cluster:** `marker.click()` scheitert,
  weil das Bounding-Box-Zentrum der Gruppe (inkl. Label) auf leerem Raum
  liegt → `dispatchEvent('click')` im e2e; die echte Klick-Mechanik deckt
  der L2-Test ab.
- Mutations-Stichprobe („um"-Präfix entfernt): 2 Tests rot (L1 + Panel).
> Bau-Zyklus: Spec → Code+Tests → Handbuch → Abschluss (`WORKFLOW.md`).

## Ziel (ein Satz)

Klick auf einen Marker öffnet eine **Detailansicht** (Titel, Datum mit
Präzision, Typ, Kategorien, Orte, Beschreibung) — die App wird vom Diagramm
zum Erkundungswerkzeug, dem man *nachgehen* kann. Bewusst leichter Schritt
vor dem Herzstück 1g.

## Was 1f kann

1. **Auswahl:** Klick auf Punkt oder Balken wählt das Event
   (`selectedEventId` im `TimelineStore`); erneuter Klick auf dasselbe Event
   oder auf die freie Fläche wählt ab. Der gewählte Marker wird optisch
   hervorgehoben (kräftigere Farbe/Rand — bewusst schlicht, Feinschliff 1g).
2. **Detail-Panel unter der Timeline** (kein Dialog/Overlay — vermeidet
   die ganze Tier-D-Komplexität, passt zum Erkunder-Fluss):
   - Titel, **Typ** (Name aus Taxonomie), **Kategorien** (Namen),
   - **Datum präzisionsgerecht** formatiert (s. u.), bei Spannen „von – bis",
   - **Orte** (Namen; ohne Karte — nur Text),
   - Beschreibung.
3. **Präzisionsgerechte Datumsanzeige** als reine Funktion
   `formatHistoricalDate(date, precision)`:
   - `day` → „7. Oktober 1571" · `month` → „September 1529"
   - `year` → „1571" · `circa` → „um 1450" (bzw. „um 4,6 Mrd. v. Chr.")
   Erstmals wird `precision` überhaupt sichtbar — bisher schlummerte das
   Feld ungenutzt im Modell.
4. **Klick vs. Ziehen sauber getrennt:** Nach einem Pan-Drag löst das
   Loslassen keine Auswahl aus (Bewegungsschwelle).
5. **Auswahl überlebt Filter und Zoom:** Das Panel zeigt das gewählte Event
   auch dann weiter, wenn es durch Filter/Viewport gerade nicht auf der
   Achse liegt (Detail ist Nachschlagen, nicht Sichtbarkeit).

## Was 1f bewusst NICHT kann

- Kein Dialog/Drawer, keine Karte für Orte, keine Verlinkung zwischen
  Events (Komposition ist geparkt).
- Keine Tastatur-Navigation durch Marker (Q5 geparkt; AXE-Basics ja).
- Kein Editieren (Ausbaustufe 2).

## Woran man Erfolg erkennt

- [ ] Live: Klick auf Lepanto → Panel zeigt „Seeschlacht von Lepanto",
      „7. Oktober 1571", Schlacht, Militär/Religion, „Lepanto (Naupaktos)",
      Beschreibung. Erneuter Klick → Panel verschwindet.
- [ ] Ein circa-Event zeigt „um …", eine Spanne „von – bis", ein Event
      ohne Ort lässt die Ort-Zeile weg.
- [ ] Pan-Drag über einem Marker wählt NICHT aus.
- [ ] L1: `formatHistoricalDate` (alle Präzisionen, v. Chr., Spannen-Ränder);
      Store select/deselect. L2: Klick auf Marker wählt aus (Timeline),
      Panel rendert alle Felder + AXE. L3: der Lepanto-Ablauf.
- [ ] Mutations-Stichprobe; CI grün; Handbuch ergänzt.

## Technische Festlegungen

- Timeline bleibt „dumm" (Input/Output): neuer Output `eventSelected`;
  die Verdrahtung mit dem Store macht die App. Marker bekommen
  `data-event-id` (stabile e2e-Selektoren).
- Detail-Panel als eigene Komponente `src/app/detail/detail-panel.ts`
  (Kategorie C: liest aus dem Store).
- `formatHistoricalDate` in `src/app/data/format.ts` (rein), deutsche
  Monatsnamen als Konstante (kein Locale-/Intl-Risiko in Tests).
