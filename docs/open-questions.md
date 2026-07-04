# Offene Fragen (bewusst geparkt)

## Q1 — Das Herzstück: Filtern & optische Gestaltung der Ansicht
Wie wählt man aus, *was* sichtbar ist — und wie wird die ausgewählte Ansicht
optisch gestaltet (Anordnung, Hervorhebung, Dichte, Farbe/Kategorie)?
Der kreative Kern der App. Wird als Nächstes **gemeinsam entwickelt**.

**Q1a — Mehrkategorien-Darstellung:** Events haben `categories[]` (mehrere).
Wie zeigt die Ansicht ein Militär+Religion-Event? Farbe (Mischfarbe /
Hauptkategorie / zweifarbig)? Lane (Duplikat in beiden Spuren / eine
Hauptspur / Verbindungslinie)? Am spielbaren Produkt entscheiden.

**Q1b — KI-errechnete Gestaltung (Idee von Johannes):** Zu jeder konkreten
Filterung könnte eine KI höherwertige, *semantische* Gestaltungsoptionen
errechnen (welche Anordnung, Hervorhebung, Gruppierung passt zu genau dieser
Auswahl?). Statt fixer Darstellungsregeln: Gestaltung als KI-Vorschlag.
Koppelt an den Nordstern (KI-Recherche). Zu vertiefen, sobald es eine
spielbare Ansicht gibt.

## Q4 — Taxonomie-Pflege im Betrieb
Wie fließen KI-Vorschläge in die Taxonomie ein (Kandidaten aus Event-
Beschreibungen erkennen, Umklassifizierung nach Split/Merge)? Wer kuratiert?
Grundsatz ist entschieden (iterativ, s. decisions.md) — die Werkzeuge/Abläufe
dafür entstehen nach Hands-on.

## Q5 — Barrierefreie Timeline-Erkundung
Kann man die SVG-Timeline ohne Maus (Tastatur/Screenreader) erkunden?
AXE prüft nur Basics (role/label). Echte Antwort wäre ein Designthema —
bewusst geparkt; relevant frühestens, wenn die App öffentlich wird (Nordstern).

## Q2 — Zielnutzer & Zweck  (teilweise entschieden)
Start mit **Persona A (Erkunder)** — neugierig/lernend, „was passierte
gleichzeitig?". B (Rechercheur) und C (kuratierte Story) sind spätere Ziele,
erst nach Hands-on mit dem Produkt. Q1 wird jetzt aus Sicht von A entwickelt.

## Q3 — Große Ambition vs. erster Bauschritt
Nordstern: wachsende Datenbasis über Nutzer-Sharing und/oder KI-Recherche
(Accounts, Backend, KI-Anbindung). Frage: Welche kleine erste Scheibe bauen
wir zuerst, ohne den Nordstern zu verbauen?
