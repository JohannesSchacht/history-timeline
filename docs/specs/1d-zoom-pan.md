# Spec — Schritt 1d: Zoom & Pan

> Status: **umgesetzt** (2026-07-04). Zoomfaktor-Feintuning nach gemeinsamem
> Erspielen ggf. offen.

## Befunde aus der Umsetzung

- **maxSpan angepasst:** statt der spezifizierten 10 Mrd. Jahre gilt
  maxSpan = Fenstergröße (−5 Mrd. … +3000 ≈ 5 Mrd.) — eine größere Spanne
  als das erlaubte Fenster wäre widersprüchlich gewesen.
- **Zoomfaktor ist deltaY-proportional** (`wheelZoomFactor`): Trackpads
  liefern feine Deltas, Mausrasten ~100 — ein fester Faktor pro Event hätte
  Trackpads rasen lassen. Exponent gedeckelt (max. 10 Rasten pro Event).
- **jsdom-Fallback:** `getBoundingClientRect()` liefert in jsdom Breite 0 —
  die Komponente fällt dann auf Maßstab 1 zurück (clientX ≡ viewBox). Damit
  sind die L2-Interaktionstests deterministisch.
- **Lehrstück Testauswahl:** Die Mutations-Stichprobe (Fokus `t=0.5` fest)
  wurde nur vom L1-Test gefangen — der L2-Wheel-Test zielt auf die
  SVG-Mitte, wo die Mutation zufällig korrekt ist. Testpunkte bewusst
  asymmetrisch wählen.
> Bau-Zyklus: Spec → Code+Tests → Handbuch → Abschluss (`WORKFLOW.md`).

## Ziel (ein Satz)

Der feste Ausschnitt wird beweglich: **Mausrad zoomt um den Cursor**,
**Ziehen verschiebt** die Achse — die Timeline fühlt sich an „wie eine
Landkarte", von 4,6 Mrd. Jahren bis in einzelne Jahre.

## Kernidee: Interaktion ist auch nur Geometrie

Die Architektur-Entscheidung „Layout als reine Funktionen" wird auf die
Interaktion ausgedehnt. Event-Handler enthalten keine Mathematik; sie rufen
reine Funktionen:

```
zoomViewport(viewport, focusYear, factor) → Viewport
   // Invariante: das Jahr unter dem Cursor behält seine x-Position
panViewport(viewport, dxPx) → Viewport
   // Pixelverschiebung → Jahresverschiebung
clampViewport(viewport) → Viewport
   // Grenzen: minSpan 1 Jahr, maxSpan 10 Mrd. Jahre,
   // Fenster innerhalb [-5 Mrd., +3000]
```

Damit ist das Herz von 1d — inkl. der Fokus-Invariante — auf L1 testbar,
bevor irgendein Browser-Event existiert.

## Was 1d kann

1. **Zoom (Mausrad):** um die Cursorposition, fester Faktor pro Raste
   (Startwert 1.2 — wird gemeinsam am lebenden Objekt eingestellt).
2. **Pan (Ziehen):** Pointer-Drag verschiebt den Ausschnitt horizontal;
   Cursor zeigt „grabbing" während des Ziehens.
3. **State:** Der Viewport wird ein **Signal** in der App; die
   Timeline-Komponente meldet Änderungswünsche über einen Output
   (`viewportChange`). Kein SignalStore — der kommt planmäßig erst mit 1e.
4. **Dynamische Achse:** `buildTicks` arbeitet bereits mit beliebigen
   Spannen (1-2-5-Reihe); neu ist die **lesbare Beschriftung großer Zahlen**
   — damit wird **Q7 gelöst**:
   - `|Jahr| ≥ 1 Mrd.` → „4,6 Mrd. v. Chr."
   - `|Jahr| ≥ 1 Mio.` → „66 Mio. v. Chr."
   - `|Jahr| ≥ 10.000` → „300.000 v. Chr."
   - sonst wie bisher („480 v. Chr.", „1571")
   Als reine Funktion `formatAxisYear`, ersetzt `formatYear` in den Ticks
   (Tooltips behalten das exakte Jahr).
5. **Zähler-Zeile** bleibt und aktualisiert sich beim Zoomen/Schwenken —
   nebenbei ein gutes Debug-Instrument beim Erspielen.

## Was 1d bewusst NICHT kann

- **Kein Touch/Pinch** (Desktop-Maus zuerst; Touch als eigener Punkt, wenn
  die App mobil werden soll).
- **Keine Trägheit/Animation** (erst erspielen, ob man sie vermisst).
- **Keine Zoom-Buttons/Tastatur** (hängt an Q5-Bedienkonzept, geparkt).
- Kein Filtern (1e), keine Details (1f), keine Gestaltung (1g).

## Woran man Erfolg erkennt

- [ ] Live: Mausrad zoomt um den Cursor (das Jahr unterm Cursor bleibt
      stehen), Ziehen verschiebt; beides flüssig bei 57 Events.
- [ ] **Die große Reise funktioniert:** vom Start (1400–1700) herauszoomen
      bis die Erdzeitalter-Balken erscheinen (Achse: „4 Mrd. v. Chr." …),
      hineinzoomen bis das 1492er-Trio (Jan/März/Okt) einzeln steht.
- [ ] Zoom stoppt an den Grenzen (minSpan/maxSpan/Fenster) statt zu kippen.
- [ ] L1: Fokus-Invariante, Pan-Umrechnung, Clamping, `formatAxisYear` —
      inkl. Mutations-Stichprobe.
- [ ] L2: Wheel-/Pointer-Events am SVG führen zu korrekten
      `viewportChange`-Emissionen.
- [ ] L3: Herauszoomen per `mouse.wheel` macht Thermopylen sichtbar.
- [ ] CI grün, Deploy aktuell; Handbuch um Bedienung ergänzt.

## Technische Festlegungen

- `wheel`-Listener mit `preventDefault` (Seite darf nicht scrollen, solange
  der Cursor auf der Timeline ist); Pointer Events (`setPointerCapture`)
  fürs Ziehen.
- Umrechnung Maus-Pixel → viewBox-Einheiten über `getBoundingClientRect`
  (das SVG ist CSS-skaliert) — einzige Stelle mit DOM-Bezug, bewusst dünn.
- Zoomfaktor, Grenzen als Konstanten im Layout-/Interaktions-Modul
  (`timeline/layout/viewport-controls.ts`).
