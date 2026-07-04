# Glossar

Begriffe, die wir projektweit gleich verstehen wollen.

## Projekt-Struktur

- **Ausbaustufe (1–3)** — die drei großen Etappen aus `architecture.md`:
  Stufe 1 = Erkunder-App (frontend-only), Stufe 2 = Erfassen/Pflegen,
  Stufe 3 = Nordstern (Backend, Accounts, Sharing, KI-Recherche).
  Nicht verwechseln mit …
- **Schritt (1a–1g)** — die kleinen Bau-Schritte *innerhalb* von
  Ausbaustufe 1 (`roadmap.md`). Jeder endet mit etwas Spielbarem.
- **Nordstern** — die große Ambition (Stufe 3). Richtungsgeber, kein
  aktueller Bauauftrag.
- **Herzstück (Q1)** — Filtern & optische Gestaltung der ausgewählten
  Ansicht; der kreative Kern der App.

## Fachmodell

- **Event (Ereignis)** — Zeitpunkt (`start`) oder Zeitspanne (`start`+`end`)
  mit Präzision (Jahr/Monat/Tag/circa), genau einem **Typ**, 1..n
  **Kategorien**, 0..n **Orten**.
- **Typ** — was ein Event *ist* (Geburt, Gründung, Schlacht …); genau einer.
- **Kategorie** — welche Themen ein Event *berührt* (Politik, Kultur …);
  mehrere möglich; bilden einen Baum (**Taxonomie**).
- **Taxonomie** — der Kategorien-Baum. Startet fast leer, wächst iterativ;
  Events referenzieren Knoten per stabiler ID.
- **Persona A / B / C** — Erkunder (lernend, „was war gleichzeitig?") /
  Rechercheur (baut Arbeitssets) / Betrachter kuratierter Storys.
  Stufe 1 baut für A.

## Technik

- **EventRepository** — der einzige Datenzugang der App (eiserne Regel);
  Implementierung austauschbar (JSON heute, Backend/KI später).
- **Reine Funktion** — gleiche Eingabe → gleiche Ausgabe, keine
  Nebenwirkungen. Unsere Layout-Geometrie ist so gebaut:
  `(Events, Viewport) → Positionen`.
- **L1 / L2 / L3** — die drei Test-Schichten (Logik/Store → Komponente →
  e2e im Browser), siehe `testing.md`.
- **Hermetisch** — ein Test, der von nichts Externem abhängt. Bei uns
  by construction: kein Backend, kein Login.
