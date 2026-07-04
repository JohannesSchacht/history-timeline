# Roadmap — Ausbau-Schritte

> Status: **Entwurf der KI**, zum Anecken. Schnitt-Prinzip: jeder Schritt
> endet mit etwas sichtbar Funktionierendem, mit dem man herumspielen kann
> (das Produkt bringt die nächsten Anforderungen hervor).

## Stufe 1 — Erkunder-App (Frontend-only)

| # | Schritt | Ergebnis, mit dem man spielen kann |
|---|---|---|
| 1a | **Walking Skeleton** | Leere Angular-App baut, testet und deployt automatisch auf GitHub Pages. „Hello Timeline" ist online erreichbar. |
| 1b | **Datenmodell + Repository** | `Event`/`Place`/Taxonomie als TypeScript-Modelle, `EventRepository` liest `events.json`; ein erster handkuratierter Beispieldatensatz (~30–50 Events). |
| 1c | **Statische Timeline** | Events erscheinen als SVG auf der Achse: Punkte und Spannen, fester Zeitausschnitt. Erste Sichtprüfung des Grobbilds. |
| 1d | **Zoom & Pan** | Hinein-/Herauszoomen (Jahrhunderte ↔ Jahre), horizontales Scrollen. Die Achse fühlt sich an „wie eine Landkarte". |
| 1e | **Filter** | Auswahl nach Kategorie(n), Typ, Zeitraum. Ab hier beginnt das Herzstück (Q1) praktisch erlebbar zu werden. |
| 1f | **Event-Details** | Klick auf Marker → Detailansicht (Titel, Datum, Orte, Beschreibung). |
| 1g | **Gestaltung der Ansicht** | Experimente zu Q1/Q1a: Anordnung (Linie/Spuren/Verdichten), Farben, Mehrkategorien-Darstellung. Bewusst als eigener Schritt NACH dem Herumspielen mit 1c–1f. |

## Stufe 2 — Erfassen & Pflegen

Grob: Events in der App anlegen/bearbeiten; Taxonomie-Pflege (Q4) mit
KI-Unterstützung; Persona B nimmt Konturen an. Schnitt erfolgt nach
Hands-on-Erfahrung mit Stufe 1.

## Stufe 3 — Nordstern

Grob: Backend + DB, Accounts, Sharing (Persona C), KI-Recherche
(„alle Kriege in Europa"), KI-errechnete Gestaltungsoptionen (Q1b).
Bewusst unspezifiziert.
