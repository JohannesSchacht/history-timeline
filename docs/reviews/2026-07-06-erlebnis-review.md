# Erlebnis-Review #1 — 2026-07-06

> Erstes förmliches Review nach WORKFLOW (Validierung gegen `erwartung.md`).
> Werkzeug: `tools/erlebnis-review.mjs` (Playwright, Persona-A-Missionen,
> Screenshots + Messwerte unter `.review/`). Stand: nach 1f + Kinken-Fixes.

## Befunde (nach Erwartungs-Prinzip)

### P1 — „Jede Ansicht erzählt etwas Sinnvolles"

- **F1 · Tiefzoom in der Erdgeschichte** *(Johannes' Fall, reproduziert)*:
  1-Jahres-Fenster bei 2,8 Mrd. v. Chr. — leere Achse, ein Tick, ein graues
  Band. Semantisch leer, aber erreichbar. → **Q8**: minimale Zoomspanne
  bedeutungsabhängig (aus Dichte + precision der Events in der Zeitregion).
- **F2 · Punkteturm** in der Vollansicht: gesamte Menschheitsgeschichte als
  senkrechte Punktsäule am rechten Rand. Bekannt → 1g (Clustering).

### P2 — „Auflösung folgt Bedeutung"

- **F3 · Achsen-Ticks im Tiefzoom** tragen identische Labels („2,8 Mrd.
  v. Chr.") — die Beschriftung kann Zoomstufen unterhalb ihrer eigenen
  Auflösung nicht ausdrücken. Löst sich mit F1/Q8 von selbst.

### P3 — „Bewegung fühlt sich mühelos an"

- **F5 · Gezieltes Reisen ist mühsam.** Selbst mein Review-Skript hat beim
  Versuch, aus der Vollansicht das Jahr 1492 anzusteuern, um Größenordnungen
  daneben gegriffen (26 Mio. v. Chr.). Es fehlt mindestens ein
  **„Startansicht"-Knopf** (Reset); Kandidaten darüber hinaus: Sprungziele
  (Erdgeschichte / Antike / Neuzeit), Jahr-Eingabe.

### P4 — „Der Bildschirm gehört der Geschichte"

- **F7 · Vollansicht verschwendet Fläche:** der Punkteturm erzwingt große
  Höhe, die Achse klebt unten, links oben riesige Leere. → 1g (folgt aus F2).
- **F8 · Filter-Panel** beansprucht prominent zwei Zeilen für eine
  Zweitfunktion. → 1g (kompaktere Form).

### P5 — „Orientierung geht nie verloren"

- **F9 · Im Tiefzoom kein Kontext**, wo in der Zeit man ist (ein einzelner
  Tick). Kandidat: Übersichtsleiste/Minimap. → 1g.

### P6 — „Die Darstellung lügt nicht"

- **F4 · aria-label/Bereichsangabe mit Bruchjahren:** „Zeitachse
  2825519529.543784 v. Chr." — Monsterzahl mit Dezimalstellen
  (formatYear statt formatAxisYear). **Kleiner Sofort-Fix.**
- **F10 · Der Zähler verschweigt Gefiltertes:** Bei Filter „nur Natur" +
  Vollansicht steht „8 von 8 Ereignissen im Ausschnitt" — die 49
  weggefilterten sind unsichtbar unterschlagen. **Kleiner Sofort-Fix**
  (z. B. „8 sichtbar · 49 gefiltert").
- **F11 · Gekappte Balken enden hart am Rand**, als endete die Epoche dort
  (Känozoikum wirkt in der Startansicht wie 1400–1700). **Kleiner
  Sofort-Fix** (offene Enden andeuten: Ausfransen/Pfeil).
- **F12 · Unschärfe unsichtbar:** circa-Events sehen exakt aus wie
  tagesgenaue. → 1g (Marker-Optik), aber P6-relevant.

## Empfehlung

1. **Sofort (Kinken-Paket, klein):** F4, F10, F11 + „Startansicht"-Knopf
   (F5 minimal).
2. **Q8 als eigener Baustein** (bedeutungsabhängige Zoom-Grenzen) — vor
   oder mit 1g.
3. **Alles Übrige ist 1g-Futter** (F2, F7, F8, F9, F12) und wartet auf
   Johannes' Q1-Gedanken.
