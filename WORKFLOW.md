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

- [x] `WORKFLOW.md` — Entwurf steht
- [ ] `docs/vision.md` — Entwurf steht, wird korrigiert
- [ ] `docs/glossary.md` — fällt aus der Vision-Korrektur ab
- [ ] `docs/decisions.md` — wächst laufend
- [ ] `docs/open-questions.md` — wächst laufend
- [ ] `docs/README.md` — kommt, sobald Vision steht

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
