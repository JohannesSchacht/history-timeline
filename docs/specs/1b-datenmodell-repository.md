# Spec — Schritt 1b: Datenmodell + Repository

> Status: **umgesetzt** (2026-07-04). Erfolgskriterien erfüllt.

## Befunde aus der Umsetzung

- **`HistoricalEvent` statt `Event`** (Kollision mit DOM-`Event`) — s. decisions.md.
- Der Datenvertrags-Test importiert die echten JSONs direkt (dafür
  `resolveJsonModule` in tsconfig aktiviert) und prüft zusätzlich die
  Kuratierungs-Absicht (v.Chr./Spannen/Mehrkategorien/… vorhanden).
- Mutations-Stichprobe bestanden: kaputte Kategorie-Referenz → Test nennt
  betroffene Events lesbar („ev-schlacht-lepanto → cat-tippfehler").
- Stolperer: deutsche Anführungszeichen mit geradem ASCII-Schluss (`„…"`)
  machen JSON unparsebar — beim Kuratieren auf `„…“` achten.
- Datensatz: 49 Events, 35 Orte geworden (statt ~40/~35 geplant).
> Bau-Zyklus: Spec → Code+Tests → Handbuch → Abschluss (`WORKFLOW.md`).

## Ziel (ein Satz)

Das abgestimmte Datenmodell wird Code, ein `EventRepository` lädt echte
JSON-Daten, und ein handkuratierter Beispieldatensatz macht das sichtbar —
als schlichte Liste, noch ohne Timeline-Grafik.

## Was 1b kann

1. **Datenmodell als TypeScript-Interfaces** (`src/app/data/model.ts`) —
   exakt der abgestimmte Kern:

   ```ts
   interface HistoricalDate {
     year: number;          // negativ = v. Chr.; Jahr 0 gibt es nicht
     month?: number;        // 1–12, optional
     day?: number;          // nur wenn month gesetzt
   }

   type DatePrecision = 'day' | 'month' | 'year' | 'circa';

   interface Event {
     id: string;
     title: string;
     start: HistoricalDate;
     end?: HistoricalDate;          // gesetzt = Zeitspanne, sonst Zeitpunkt
     precision: DatePrecision;
     type: string;                  // genau EIN Typ (ID aus der Taxonomie)
     categories: string[];          // 1..n Kategorie-IDs (Baum-Knoten)
     placeIds: string[];            // 0..n
     description: string;
   }

   interface Place {
     id: string;
     name: string;
     coordinate?: { lat: number; lon: number };
   }

   interface CategoryNode {
     id: string;
     name: string;
     children: CategoryNode[];      // Verfeinern = Kinder anhängen
   }

   interface Taxonomy {
     categories: CategoryNode[];    // Start: ~6 Wurzelknoten, fast leer
     types: { id: string; name: string }[];
   }
   ```

2. **Datendateien** unter `public/data/` (werden mit deployt):
   - `taxonomy.json` — Start-Taxonomie: Wurzelknoten Politik, Militär,
     Kultur, Wissenschaft, Religion, Wirtschaft; Typen-Startliste
     (z. B. Ereignis, Geburt, Tod, Gründung, Schlacht, Vertrag, Epoche).
   - `events.json`, `places.json` — der Beispieldatensatz (s. u.).

3. **`EventRepository`** (`src/app/data/event-repository.ts`) — die eiserne
   Regel wird Code: ein Interface als Injection-Token, dazu die
   `JsonEventRepository`-Implementierung (lädt die drei JSON-Dateien per
   HttpClient). Komponenten kennen nur das Interface.

4. **Fake + Fixtures fürs Testen** (`src/app/testing/`):
   - `fixtures.ts`: `makeEvent(Partial<Event>) → Event` u. Ä. — typisiert,
     unser Drift-Signal.
   - `fake-event-repository.ts`: seedbar, für L2-Tests per DI.

5. **Datenvertrags-Test (L1):** validiert die *echten* JSON-Dateien gegen
   Modell und Invarianten — IDs eindeutig; jede type-/category-/place-Referenz
   existiert; `start ≤ end`; `year ≠ 0`; `day` nur mit `month`; Kategorien
   je Event ≥ 1.

6. **Sichtbares Ergebnis:** Die App zeigt statt des Platzhalters eine
   schlichte Liste („N Ereignisse geladen", Titel + Jahr je Zeile) — Beweis,
   dass echte Daten durch das Repository in die UI fließen. Kein Styling-
   Ehrgeiz, wird in 1c ersetzt.

## Der Beispieldatensatz (~40 Events)

Bewusst **„gemein"** kuratiert, damit 1c–1g an echten Härtefällen entstehen:

- dichte Cluster (mehrere Events im selben Jahr/Jahrzehnt),
- lange Zeitspannen neben Punkt-Events (Epoche vs. Schlacht),
- Mehrkategorien-Fälle (Militär+Religion, Technik+Kultur),
- circa-Datierungen und reine Jahresangaben neben tagesgenauen Daten,
- mindestens 2–3 Events v. Chr. (negative Jahre, testet die Achse),
- Events mit 0, 1 und mehreren Orten.

**Themenvorschlag (Johannes entscheidet):** Kern „Europa 1450–1650"
(Renaissance, Reformation, Entdeckungen — dicht und vielfältig) plus eine
Handvoll weit entfernter Anker (Antike v. Chr., 20. Jh.), damit Zoom über
große Zeiträume erprobbar wird. Die KI kuratiert, Johannes prüft stichprobenhaft.

## Was 1b bewusst NICHT kann

- Keine Timeline-Grafik (1c), kein Zoom (1d), kein Filtern (1e).
- Keine Taxonomie-Pflege-Werkzeuge (Q4), keine Komposition (geparkt).
- Kein Editieren — die JSONs werden von Hand (bzw. von der KI) gepflegt.

## Woran man Erfolg erkennt

- [ ] Live-URL zeigt „N Ereignisse geladen" + Liste mit echten Daten.
- [ ] Datenvertrags-Test läuft gegen die echten JSONs und ist grün —
      und wird rot, wenn man eine Referenz mutwillig bricht (Stichprobe).
- [ ] L2-Test der Liste läuft gegen das Fake-Repository (nicht die echten
      Daten); L3 sieht einen bekannten Event-Titel auf der Seite.
- [ ] CI komplett grün, Deploy aktuell.

## Technische Festlegungen

- Datenzugriff über `provideHttpClient(withFetch())`; Laden beim App-Start,
  Zustand als Signal im Repository (reicht bis 1d, SignalStore kommt in 1e).
- IDs sind sprechende Slugs (`ev-schlacht-lepanto`, `cat-militaer`,
  `pl-venedig`) — lesbar in JSON-Diffs, stabil (Umbenennen ändert nur `name`).
