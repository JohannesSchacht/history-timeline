# Zusammenarbeit & Vorgehen

Dieses Dokument beschreibt **wie** wir arbeiten (Prozess-Ebene).
Das **Was** liegt in `docs/`.

## Leitprinzip: von außen nach innen

Wir konvergieren zuerst auf ein gemeinsames Grobbild und steigen erst dann
in Details ab. Die teuersten Missverständnisse sitzen ganz außen — deshalb
klären wir sie zuerst.

**Technik:** Nicht der Mensch wird ausgefragt. Die KI macht ihr inneres Bild
sichtbar (Entwurf), der Mensch korrigiert. Reagieren ist präziser als
aus dem Nichts spezifizieren.

## Leitprinzip: gemeinsam entwickeln statt extrahieren

Nicht alle Anforderungen liegen fertig im Kopf des Menschen und müssen nur
"abgefragt" werden. Viele Ideen — gerade die interessanten — **entstehen erst
in der Zusammenarbeit**. Die KI fragt also nicht nur ab, sondern denkt mit und
schlägt vor; der Mensch wählt, verwirft, schärft. Vision und Konzept sind ein
gemeinsames Produkt. (Das ist zugleich der Kern des Lernziels: Denkarbeit
delegieren heißt gemeinsam denken, nicht nur Antworten liefern.)

## Dokumentenlandkarte

| Datei | Ebene | Zweck |
|---|---|---|
| `WORKFLOW.md` | Prozess | Wie wir zusammenarbeiten (dieses Dokument) |
| `docs/vision.md` | Produkt | Das geteilte Grobbild (Außenschicht) |
| `docs/glossary.md` | Produkt | Begriffe, die wir gleich verstehen wollen |
| `docs/decisions.md` | Produkt | Entscheidungs-Log (je Zeile: Entscheidung + Begründung) |
| `docs/open-questions.md` | Produkt | Bewusst geparkte offene Punkte |
| `docs/README.md` | Produkt | Landkarte + aktueller Stand + nächste Schritte |

Detail-Spezifikationen (Datenmodell, Feature-Specs, Backlog) entstehen
**bewusst später** — erst wenn die Außenschicht steht.

## Reifegrad der Dokumente

- [x] `WORKFLOW.md` — steht
- [x] `docs/vision.md` — abgestimmtes Grobbild
- [ ] `docs/glossary.md` — noch offen (bei Bedarf aus Q1 ableiten)
- [x] `docs/decisions.md` — angelegt, wächst laufend
- [x] `docs/open-questions.md` — angelegt, wächst laufend
- [x] `docs/README.md` — angelegt (Stand + nächste Schritte)

## Bau-Zyklus (ab der Bauphase, je Ausbau-Schritt)

Jeder Schritt aus `docs/roadmap.md` durchläuft denselben Zyklus:

1. **Spezifikation** — kurzes Spec-Dokument (`docs/specs/<schritt>.md`):
   was der Schritt kann, was bewusst nicht, wie man Erfolg sieht.
   KI entwirft, Mensch korrigiert (gleiches Muster wie bei der Vision).
2. **Code + Tests** — Umsetzung inkl. Unit-Tests; E2E-Tests für
   nutzersichtbares Verhalten. Mensch reviewt als Abnehmer, nicht als Tipper.
3. **Handbuch** — `docs/handbook.md` wird um den neuen Stand ergänzt
   (was kann die App jetzt, wie benutzt man es).
4. **Abschluss** — Entscheidungen ins Log, `docs/README.md` aktualisieren,
   committen.

## Sync-Rhythmus

- **Session-Start:** KI liest `README.md` + `open-questions.md` und fasst in
  ~3 Sätzen zusammen, wo wir stehen und was ansteht. Mensch korrigiert.
- **Bei jeder Entscheidung:** Eine Zeile nach `decisions.md`.
- **Session-Ende:** KI aktualisiert `README.md` (Stand + nächste offene Punkte).

## Lernziel (Meta)

Der Mensch übt, Denkarbeit an die KI zu delegieren — vor allem die Kern-
Fähigkeit, **einen KI-Vorschlag kritisch abzunehmen**, statt alles selbst
vorzudenken. Deshalb reden wir regelmäßig über das Vorgehen selbst, nicht
nur über den Inhalt.
