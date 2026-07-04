# Test-Strategie — history-timeline

> Status: **abgestimmt** (Punkte 1–4 einzeln diskutiert und entschieden).
> Ausgangsbasis: `Testing-Long-Spec.md` (Service-Hub-UI-Strategie), destilliert
> auf ein Frontend-only-Lernprojekt ohne Backend, Login und i18n.
> Was dort für 67 Komponenten / 9 Stores / Azure AD gebaut ist, wird hier auf
> das reduziert, was bei uns trägt — und um unsere Spezialität (Timeline-
> Geometrie) ergänzt.

## Die drei Schichten (übernommen, verschlankt)

| Ebene | Was sie prüft | Werkzeug | Datenrand | Wie oft |
|---|---|---|---|---|
| **L1 — Logik/Store** | Reine Funktionen (Zeit↔Pixel, Layout, Filter) und Store-Verhalten | Vitest + typisierte Fakes | `EventRepository` durch Fake ersetzt | jeder Push |
| **L2 — Komponente** | Komponente rendert richtig: leer / geladen / Fehler, Interaktion | Vitest + jsdom | Fake-Repository per DI | jeder Push |
| **L3 — e2e** | Ganze App im echten Browser, kritische Abläufe | Playwright | echte App + **Test-Datensatz** (JSON) | jeder Push |

**Ratio:** viele L1, einige L2, wenige L3 (Testpyramide; e2e nur für die
kritischen Gesamtabläufe wie „laden → zoomen → filtern → Detail öffnen").

**Hermetisch by construction:** Es gibt kein Backend und keinen Login — die
e2e-Tests servieren die gebaute App mit einem festen Test-Datensatz. Kein MSW,
kein Auth-Fake nötig. (MSW wird erst mit Stufe 3 wieder ein Thema — dann gilt
die Faustregel des Ursprungsdokuments: Transport mocken, wenn der Test die
HTTP-Grenze überquert.)

## Die eine projektspezifische Kernentscheidung

**Layout-Logik als reine Funktionen, getrennt vom SVG-Rendering.**
Alles, was Positionen berechnet — Zeit↔Pixel-Skala, Zoom-Transformation,
Anordnung/Lanes/Clustering (1g) — lebt in puren Funktionen:
`(Events, Viewport) → Positionen`. Das SVG-Template zeichnet nur noch.

Konsequenz: Das Herzstück des Projekts ist fast vollständig auf **L1**
testbar — schnell, präzise, ohne Browser. jsdom kann kein Layout rendern,
aber SVG-Attribute (`x`, `width`, …) sind DOM: L2 kann prüfen, dass die
berechneten Positionen im Markup ankommen.

## Komponenten-Kategorien (Tier-Prinzip, geschrumpft)

Das Ursprungsdokument sortiert Komponenten in sechs Tiers (P/M/C/D/X/A) —
Kategorie = festes Test-Rezept, damit niemand pro Komponente neu philosophiert.
Das Prinzip übernehmen wir, die Palette schrumpft auf drei:

| Kategorie | Beispiele bei uns | Rezept |
|---|---|---|
| **P — darstellend** | Tooltip, Legende, Filter-Chip | Eingaben setzen → DOM prüfen; Ausgaben abfangen |
| **C — Container/Seite** | App-Shell, Timeline-Seite, Filter-Panel | Fake-Repository per DI; Zustände leer/geladen/Fehler |
| **T — Timeline/SVG** (unsere Spezialität) | die Timeline-Komponente | Geometrie liegt in reinen Funktionen (L1); der Komponententest prüft nur: berechnete Positionen kommen als SVG-Attribute im DOM an, Interaktionen (Zoom/Pan) lösen die richtigen Aufrufe aus |

**Regel:** Taucht eine neue Komponentensorte auf (erster Dialog/Drawer in 1f,
Tastatur-Navigation …), wird das Rezept aus dem Tier-Katalog der
`Testing-Long-Spec.md` (Abschnitt 6) nachdestilliert — nichts auf Vorrat,
aber der Rückweg ist markiert.

## Datenvertrag: der Validierungs-Test

Unser „Backend" ist `data/events.json` + `data/taxonomy.json` — handkuratiert,
also fehleranfällig. Das Analogon zum Contract-Riegel des Ursprungsdokuments:
**ein L1-Test validiert die echten Datendateien gegen das Datenmodell.**

- Typen stimmen (Pflichtfelder, Datumsformat, `precision`-Werte)
- Invarianten: `start ≤ end`; jede Kategorie-/Typ-/Ort-Referenz existiert;
  IDs eindeutig; keine Duplikate
- Läuft bei jedem Push → kaputte Datenpflege fällt sofort auf, nicht erst
  beim Herumklicken.

## Übernommene Konventionen (das Handwerk)

- **Mocken über DI**, nie `vi.mock` auf ganze Pakete. Fürs Ersetzen von
  Kind-Komponenten: `TestBed.overrideComponent`.
- **Fixtures typisiert:** `makeEvent(Partial<Event>) → Event` — nur
  Abweichendes angeben, Rest sinnvoll vorbelegt. Ändert sich das Datenmodell,
  **brechen die Fixtures beim Kompilieren** (unser Drift-Signal).
- **Fake-Timer-Regeln:** entweder nur die Uhr fälschen (`toFake: ['Date']`)
  oder alle Timer + `advanceTimersByTimeAsync`; nie mischen;
  `vi.useRealTimers()` in `afterEach`.
- **Zoneless:** kein `fakeAsync`/`tick`; warten mit `await fixture.whenStable()`
  bzw. `settle`-Helfer (übernehmen wir bei Bedarf aus der Vorlage).
- **Async Store-/Repo-Methoden geben Promises zurück** — deterministisch
  await-bar.
- **Nur die öffentliche Oberfläche testen:** Signals, DOM, Ausgaben — keine
  internen Felder.
- **Ein Fake-Repository, zentral:** `testing/fake-event-repository.ts` mit
  seedbaren Daten und `CallControl`-artiger Steuerung (Fehler auslösen,
  Antworten verzögern) — die Mini-Ausgabe der `FakeBackendDb`-Idee.

## Barrierefreiheit (entschieden: leichte Pflicht)

Eine AXE-Prüfung (`expectNoAxeViolations`) pro Komponente in den
bedeutungstragenden Zuständen. Kostet je eine Zeile, erzieht zu sauberem
Markup — ein automatischer Riegel statt manuellem Markup-Review.
Kontrast-/Layoutregeln bleiben aus (jsdom rendert nicht).

**Begrenzung:** Für die Timeline-Komponente selbst nur die Basics
(`role`/`aria-label` vorhanden). Die echte Frage „SVG-Timeline ohne Maus
erkunden" ist KEIN Testthema, sondern geparkt in `open-questions.md` (Q5).

## Coverage (bewusst schlank)

Messen ab 1a; **ein** niedriger globaler Boden als CI-Riegel, sobald es
nennenswerten Code gibt (Richtwert: 80 % Statements). Kein Bereichs-Ratcheting,
keine Tier-Matrix — bei unserem Umfang wäre das Verwaltung ohne Gegenwert.
Leitgedanke wie im Original: Coverage ist ein Boden, kein Ziel.

## Bewusst weggelassen (mit Rückholpunkt)

| Weggelassen | Warum | Kommt ggf. zurück |
|---|---|---|
| MSW (L2/L3-Netzmock) | keine echte HTTP-Grenze | Stufe 3 (Backend) |
| Login-/MSAL-Fake | kein Login | Stufe 3 (Accounts) |
| Transloco/i18n-Tests | einsprachig | falls mehrsprachig |
| Coverage-Tier-Matrix + Ratcheting | Projektgröße | falls das Projekt wächst |
| Wellen-Rollout, ADO-Abbildung | Roadmap 1a–1g ist unser Rollout | — |

## Definition-of-Done je Bau-Schritt (Kurzform)

- Neue Logik hat L1-Tests (Erfolg + Fehler-/Randfall; bei async ein
  Zwischenzustand).
- Neue Komponenten haben L2-Tests (leer/geladen/Fehler, sofern zutreffend)
  + AXE (falls nicht gestrichen).
- Kritische neue Nutzerabläufe: genau dort einen L3-Test ergänzen — sparsam.
- Datendateien geändert → Validierungs-Test bleibt grün.
- Grün lokal (`npm test`) und in der CI.
