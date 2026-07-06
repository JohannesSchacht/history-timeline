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

## Dokumentenlandkarte (drei Ebenen — die Dokumenten-Achse)

Jedes Dokument liegt auf einer von drei Ebenen. Ziel: Johannes zieht sich
auf die kleine Erwartungs-Ebene zurück; die KI arbeitet mit großer Autonomie
auf den unteren Ebenen.

| Ebene | Eigentümer | Dokumente | Charakter |
|---|---|---|---|
| **Erwartung** | Johannes | `docs/erwartung.md`, `docs/vision.md` | Wozu + Erlebnis-Prinzipien; ändert sich selten; Maßstab der VALIDIERUNG |
| **Steuerung** | gemeinsam entwickelt, KI verwaltet | `docs/roadmap.md`, `docs/specs/`, `docs/decisions.md`, `docs/open-questions.md`, `docs/glossary.md`, `docs/handbook.md`, `docs/README.md` | Johannes korrigiert an Checkpoints |
| **Maschinenraum** | KI | `docs/architecture.md`, `docs/testing.md`, `CLAUDE.md`, Code, CI, Agenten-Anweisungen | muss Johannes nie lesen |

## Verifikation und Validierung (zwei Prüf-Ebenen)

- **Verifikation** = Code gegen Spec: Tests (L1/L2/L3), automatisiert.
- **Validierung** = Produkt gegen Erwartung: das **Erlebnis-Review** —
  die KI benutzt die App selbst als Persona A (konkrete Erkundungs-
  Missionen) und bewertet jede Beobachtung gegen `docs/erwartung.md`.
  Eine Erwartungslücke ist ein FEHLER, auch bei erfüllter Spec und
  grünen Tests. Befunde → Kinken-Liste bzw. open-questions.

## Reifegrad der Dokumente

- [x] `WORKFLOW.md` — steht
- [x] `docs/vision.md` — abgestimmtes Grobbild
- [x] `docs/glossary.md` — angelegt (Struktur-, Fachmodell-, Technik-Begriffe)
- [x] `docs/decisions.md` — angelegt, wächst laufend
- [x] `docs/open-questions.md` — angelegt, wächst laufend
- [x] `docs/README.md` — angelegt (Stand + nächste Schritte)

## Bau-Zyklus (ab der Bauphase, je Ausbau-Schritt)

Jeder Schritt aus `docs/roadmap.md` durchläuft denselben Zyklus:

1. **Spezifikation** — kurzes Spec-Dokument (`docs/specs/<schritt>.md`):
   was der Schritt kann, was bewusst nicht, wie man Erfolg sieht.
   KI entwirft, Mensch korrigiert. Die Erfolgskriterien enthalten
   **mindestens ein Erlebnis-Kriterium** (nicht nur Mechanik).
2. **Code + Tests** — Umsetzung inkl. Unit-Tests; E2E-Tests für
   nutzersichtbares Verhalten. Mensch reviewt als Abnehmer, nicht als Tipper.
3. **Erlebnis-Review (Validierung)** — die KI benutzt die App selbst als
   Persona A und prüft gegen `docs/erwartung.md` (s. o.). Befunde beheben
   oder bewusst parken — aber benennen.
4. **Handbuch** — `docs/handbook.md` wird um den neuen Stand ergänzt
   (was kann die App jetzt, wie benutzt man es).
5. **Abschluss** — Entscheidungen ins Log, `docs/README.md` aktualisieren,
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
