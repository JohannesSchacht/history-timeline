## Test-Strategie (ausführlich erklärt) — Service Hub UI

> **Status:** Plan / lebende Strategie · **Owner:** Frontend-Team · **Stand:** 2026-06-29

### Wie dieses Dokument zu lesen ist

Dies ist die **ausführlich erklärte Schwesterdatei** zu [`Testing-Spec.md`](./Testing-Spec.md). Beide
beschreiben dieselbe Teststrategie und treffen dieselben Entscheidungen. Der Unterschied liegt im Ton:
`Testing-Spec.md` ist die **kompakte Referenz** für Leute, die im Test-Stack bereits zu Hause sind — viele
Tabellen, knappe Stichworte, dichte Codeblöcke. **Dieses** Dokument nimmt sich Zeit: es **formuliert aus**,
**erklärt jeden Fachbegriff bei der ersten Verwendung** und begründet jede Entscheidung in zusammenhängenden
Sätzen statt in Aufzählungen. Wer neu im Thema ist oder die *Warum*-Fragen verstehen will, liest dieses
Dokument; wer nur schnell „was muss ich für Tier C tun?" nachschlagen will, nutzt die Kompaktfassung.

Wenn die beiden Dateien je auseinanderlaufen, gilt `Testing-Spec.md` als die maßgebliche Kurzfassung — diese
Datei ist die Erklärung dazu, nicht die zweite Quelle der Wahrheit. Ändert sich also eine Entscheidung, wird
zuerst `Testing-Spec.md` angepasst und dann hier nachgezogen.

**Dokumentations-Disziplin:** Der eigentliche Strategie-Teil (Abschnitte 1–14) trägt **nur die aktuelle Wahrheit** —
keine Historie, kein „früher war's so". Architektur-Entscheidungen samt Begründung und Recherche wandern ins
**Entscheidungs-Log (Abschnitt 15)** am Ende. So bleibt die eigentliche Strategie schlank, während das *Warum*
(und was wir verworfen haben) nachvollziehbar bleibt.

### Inhaltsverzeichnis

- [Glossar — die wichtigsten Begriffe vorab](#glossar--die-wichtigsten-begriffe-vorab)
1. [Zweck & Scope](#1-zweck--scope)
2. [Aktueller Stand](#2-aktueller-stand)
3. [Test-Architektur (die drei Schichten)](#3-test-architektur-die-drei-schichten)
4. [Tooling & Konventionen](#4-tooling--konventionen)
5. [L1 — Stores und reine Logik testen](#5-l1--stores-und-reine-logik-testen)
6. [L2 — Komponenten und Integration testen](#6-l2--komponenten-und-integration-testen)
7. [L3 — Hermetische End-to-End-Tests](#7-l3--hermetische-end-to-end-tests)
8. [Die gemeinsame Mock-Architektur](#8-die-gemeinsame-mock-architektur)
9. [Wie wir verhindern, dass die Mocks vom echten Backend abweichen](#9-wie-wir-verhindern-dass-die-mocks-vom-echten-backend-abweichen)
10. [Coverage-Politik & CI-Gating](#10-coverage-politik--ci-gating)
11. [Rollout in sechs Wellen](#11-rollout-in-sechs-wellen)
12. [Abbildung auf Azure DevOps](#12-abbildung-auf-azure-devops)
13. [Definition-of-Done & Pflege](#13-definition-of-done--pflege)
14. [Offene Punkte, die wir noch verifizieren müssen](#14-offene-punkte-die-wir-noch-verifizieren-müssen)
15. [Entscheidungs-Log](#15-entscheidungs-log)

---

### Glossar — die wichtigsten Begriffe vorab

Damit der Lesefluss später nicht ständig stockt, hier zuerst die zentralen Fachbegriffe in einfacher Sprache.
Sie tauchen weiter unten im Kontext nochmal auf, aber wer sie hier einmal liest, kommt durchgehend leichter mit.

- **Vitest** — der Test-Runner (das Programm, das unsere Tests ausführt und „grün/rot" meldet). Modern, schnell, von der Bedienung her ähnlich wie das ältere Jest. Wir benutzen Version 4.
- **jsdom** — eine in JavaScript nachgebaute, *unsichtbare* Browser-Umgebung. Sie kennt das DOM (die HTML-Struktur), rendert aber **nichts wirklich auf den Bildschirm**: kein echtes Layout, keine Pixel, keine Grafik. Tests laufen darin extrem schnell, können aber per Definition keine optischen Dinge prüfen (z. B. ob Farben genug Kontrast haben).
- **DOM** — „Document Object Model", die Baumstruktur aus HTML-Elementen, die der Browser (oder jsdom) im Speicher hält und die unsere Tests abfragen (z. B. „gibt es einen Button mit dem Text X?").
- **Zone.js / zoneless** — Angular nutzte früher eine Bibliothek namens *Zone.js*, die automatisch erkennt, wann sich etwas geändert hat und die Oberfläche neu gezeichnet werden muss. **Zoneless** bedeutet: wir verzichten auf Zone.js und steuern das selbst über *Signals* (s. u.). Das ist moderner und schneller, ändert aber, wie man in Tests auf asynchrone Vorgänge wartet.
- **Signal / `computed()`** — ein *Signal* ist Angulars moderne Form einer reaktiven Variable: man liest sie als Funktionsaufruf (`store.loading()`), und wenn sich ihr Wert ändert, aktualisiert sich abhängige Anzeige automatisch. Ein `computed()` ist ein abgeleitetes Signal, das aus anderen Signals berechnet wird.
- **`@ngrx/signals` / signalStore** — die Bibliothek, mit der wir unsere **Stores** bauen. Ein *Store* ist ein zentraler Zustandsbehälter (z. B. „die Liste der Instrumente, Ladezustand, aktiver Filter") mit Methoden, die diesen Zustand verändern. `signalStore(...)` erzeugt so einen Store; `withState`, `withComputed`, `withMethods` sind seine Bausteine.
- **rxMethod** — eine Store-Methode, die einen asynchronen Datenstrom (RxJS Observable) verarbeitet, z. B. „lade Daten vom Server und schreibe das Ergebnis in den State".
- **RxJS / Observable** — die Bibliothek für asynchrone Datenströme in Angular. Ein *Observable* ist „ein Wert, der irgendwann (oder mehrfach) eintrifft" — z. B. die Antwort eines Server-Aufrufs. `of(x)` erzeugt ein Observable, das sofort `x` liefert; `throwError(...)` eines, das einen Fehler wirft; ein `Subject` ist ein Observable, dessen Werte wir im Test **von Hand** auslösen können (wichtig, um Timing exakt zu steuern).
- **HttpClient** — Angulars eingebauter Dienst, um HTTP-Aufrufe (GET/POST/…) ans Backend zu machen.
- **`@byk/ngx-api-*`** — fertige, **aus der Backend-Spezifikation generierte** TypeScript-Pakete, die für jeden Server-Endpunkt eine typisierte Methode bereitstellen (z. B. `listRegisteredInstruments(...)`). „Generiert" heißt: niemand schreibt diesen Code von Hand — er wird automatisch aus der `openapi.json` des Backends erzeugt.
- **DTO** — „Data Transfer Object", die TypeScript-Typen/Interfaces für die Daten, die zwischen Frontend und Backend fließen (z. B. `InstrumentRegistration`, `HealthStatus`).
- **OpenAPI / `openapi.json`** — ein maschinenlesbares Dokument, das **jeden** Backend-Endpunkt formal beschreibt (URL, Parameter, Datenformen). Es ist die *einzige Quelle der Wahrheit* für den Vertrag zwischen Frontend und Backend; aus ihm werden sowohl unsere `@byk`-Clients als auch (später) unsere Mocks generiert.
- **Mock / Stub / Fake** — alle drei meinen „ein Ersatzobjekt, das im Test an die Stelle der echten Sache tritt". Wir verwenden die Begriffe pragmatisch: ein *Stub* liefert feste Antworten, ein *Fake* hat etwas Logik (z. B. eine kleine In-Memory-Datenbank), ein *Mock* zeichnet zusätzlich auf, ob/wie er aufgerufen wurde (zum Prüfen).
- **MSW (Mock Service Worker)** — eine Bibliothek, die HTTP-Aufrufe **auf Netzwerkebene** abfängt und mit selbst definierten Antworten („Handlern") beantwortet. Der Name kommt vom ursprünglichen Browser-Mechanismus (ein *Service Worker*). Wichtig: Dieselben Handler funktionieren sowohl im Browser als auch in Node — das macht sie über mehrere Testebenen hinweg wiederverwendbar.
- **Service Worker** — ein kleines Skript, das der Browser zwischen die Seite und das Netzwerk schaltet und das Netz-Anfragen abfangen kann. MSW nutzt ihn im Browser; in den Unit-Tests (Node) nicht.
- **XHR vs. fetch** — die zwei Techniken, mit denen ein Browser HTTP-Aufrufe macht. `XMLHttpRequest` (XHR) ist die ältere, `fetch` die neuere. **Relevant, weil:** Angular 21 nutzte standardmäßig XHR, und MSW fängt XHR in der jsdom-Umgebung nur unzuverlässig ab — `fetch` dagegen sauber. **Angular 22 stellt auf `fetch` um — in diesem Projekt seit dem Upgrade (WI #26619) aktiv.**
- **MSAL / Azure AD** — Microsofts Login-System. *MSAL* ist die Bibliothek im Frontend, *Azure AD* (Entra ID) der Identitätsdienst. Damit meldet sich ein Benutzer an und bekommt ein **Token** (einen signierten Ausweis), das bei jedem Backend-Aufruf mitgeschickt wird.
- **MsalGuard / MsalInterceptor** — zwei MSAL-Bausteine: der *Guard* blockiert geschützte Seiten, bis man eingeloggt ist; der *Interceptor* hängt das Token automatisch an jeden ausgehenden HTTP-Aufruf.
- **e2e (End-to-End)** — ein Test, der die **ganze App in einem echten Browser** bedient wie ein Mensch (klicken, tippen, navigieren).
- **hermetisch** — ein Test, der **alles Externe selbst mitbringt** und von nichts Wechselndem abhängt (kein echtes Backend, kein echter Login, keine geteilte Datenbank). Hermetische Tests sind dadurch deterministisch (immer gleiches Ergebnis) und können unbeaufsichtigt in der CI laufen.
- **Playwright** — unser Werkzeug für e2e-Tests: steuert einen echten Browser von außen.
- **CI (Continuous Integration)** — der automatische Build-/Test-Server (bei uns Azure Pipelines), der bei jeder Änderung den Code baut und die Tests laufen lässt.
- **AXE / axe-core** — eine Bibliothek, die automatisiert auf **Barrierefreiheits-Probleme** (Accessibility, oft „a11y" abgekürzt) prüft, etwa fehlende ARIA-Attribute. **WCAG AA** ist der Barrierefreiheits-Standard, den wir einhalten müssen.
- **Harness** — ein offizieller Test-Helfer von Angular Material/CDK, der ein Bedienelement (z. B. ein Dropdown) über eine saubere API ansprechbar macht, statt dass der Test im rohen HTML herumsucht.
- **Transloco** — unsere Übersetzungs-Bibliothek (i18n). Sie liefert je nach Sprache (de/en) die richtigen Texte.
- **Coverage** — die Kennzahl „wie viel Prozent des Codes wurde von Tests durchlaufen". Nützlich als *Untergrenze*, aber kein Selbstzweck.

Mit diesem Vokabular im Rücken geht es jetzt in die eigentliche Strategie.

---

### 1. Zweck & Scope

**Das Ziel in einem Satz:** Jede Komponente und jeder Store soll einen automatisierten Test bekommen, und die
Stores sollen dabei **end-to-end gegen ein nachgebautes (gemocktes) Backend** geprüft werden — also durch die
echte Angular-Maschinerie hindurch, nur ohne echten Server am anderen Ende.

Warum überhaupt „gegen ein gemocktes Backend"? Ein Store ist die Schaltzentrale eines Features: er ruft mehrere
Server-Endpunkte auf, hält Zwischenstände, cached Ergebnisse, behandelt Fehler und Ladezustände. Würde man im
Test einfach nur einzelne Funktionen prüfen, bliebe genau dieses Zusammenspiel ungetestet. Indem wir das Backend
nachbauen (statt es wegzulassen), kann der Store „echt" arbeiten — er stellt echte Anfragen, bekommt echte
(kontrollierte) Antworten, und wir prüfen, ob er sich richtig verhält. Das echte Netz wird dabei **nie**
berührt: das wäre langsam, unzuverlässig und bräuchte einen laufenden Server.

Konkret deckt der Plan ab:

- **Alle 67 Komponenten.** Heute sind grob 10 getestet, es fehlen also 57. Wir sortieren sie in sechs Kategorien („Tiers"), und jede Kategorie bekommt ein festes Rezept: *was* zu prüfen ist und *womit*.
- **Alle 9 Stores** (`@ngrx/signals`). Vier sind getestet, fünf fehlen, und auch die vier bestehenden haben noch Lücken. Alle laufen künftig gegen eine einheitliche, wiederverwendbare Mock-Backend-Schicht.
- **Eine klare Werkzeug-Entscheidung je Testebene** — der Kern dieses Dokuments.
- **Drumherum:** Coverage-Politik, CI-Anbindung, ein Rollout in sechs Wellen, eine „Definition-of-Done"-Checkliste und die Abbildung auf Azure-DevOps-Arbeitspakete.

**Was wir bewusst *nicht* tun (Non-Goals):**

- **Keine Pixel-Prüfungen in jsdom.** Da jsdom nichts wirklich zeichnet, können wir dort weder eine Leaflet-Landkarte noch ein Chart.js-Diagramm „ansehen". Wir prüfen stattdessen die *Konfiguration*, die an diese Bibliotheken übergeben wird (also: „wurde das Diagramm mit den richtigen Daten gebaut?"), nicht das gemalte Bild.
- **Keinen Farbkontrast über AXE in jsdom.** Kontrast lässt sich ohne echtes Rendering nicht messen. Ehrlich: Text-Kontrast (WCAG 1.4.3) wird damit **nicht automatisch erzwungen** — `contrastRatio()` deckt nur den engen Grafik-Kontrast (1.4.11) ab, und der Real-Browser-AXE-Kontrast-Lauf ist derzeit quarantänisiert (eigener Aufräum-Punkt: Kontrast-Bugs beheben + diesen Lauf entquarantänisieren).
- **Keine echte Backend-Integration in den Ebenen L1–L3.** Das übernimmt eine bewusst kleine „Smoke"-Suite gegen den echten Server (siehe Abschnitt 3).
- **Kein WebMCP als Test-Schicht oder CI-Riegel.** Angulars experimentelle WebMCP-API (Agent-getriebenes State-Probing) ist ein **komplementäres, experimentelles** Werkzeug und lebt im eigenen Arbeitspaket **#26621** — kein Ersatz für L1/L2/L3 oder die deterministische Playwright-e2e, läuft nicht in jsdom und ist nie ein Merge-Riegel. Einordnung + Reihenfolge in Abschnitt 14.

**Leitgedanke:** Coverage ist ein *Boden*, kein Ziel. Wir schreiben zuerst Tests, die *Verhalten* und
*Barrierefreiheit* absichern; die Prozentzahl ergibt sich dann von selbst. Und nichts hier ist neu erfunden — das
Dokument verallgemeinert die Muster, die in den 30 bereits existierenden Tests bewiesen sind.

---

### 2. Aktueller Stand

#### Was an Werkzeugen schon da ist

Die Tests laufen über den **Angular-eigenen Test-Builder** `@angular/build:unit-test`. Das ist wichtig zu wissen,
weil daraus zwei Eigenheiten folgen: Erstens steckt darin Vitest 4 mit jsdom, aber es gibt **keine eigene
`vitest.config.ts`** — die gesamte Konfiguration liegt in der `angular.json` unter dem `test`-Eintrag. Zweitens
lädt der Builder vor jedem Lauf eine Setup-Datei (`src/app/testing/match-media.setup.ts`), die kleine Lücken von
jsdom flickt.

Für die CI gibt es eine eigene Konfiguration (`angular.json` → `test` → `ci`): Dort läuft der Test einmalig
(nicht im Watch-Modus), schreibt die Ergebnisse zusätzlich als **JUnit-XML** (ein Standardformat, das Azure
DevOps versteht) und als HTML-Bericht, und misst die **Coverage** mit dem „v8"-Provider, die als **Cobertura-XML**
(ebenfalls ein Standardformat für Coverage) ausgegeben wird. Auf der Kommandozeile entspricht das den Skripten
`npm test` (lokal) und `npm run test:ci` (in der Pipeline). In der CI-Pipeline (`build/client-build.yml`) wird
heute genau `npm run test:ci` aufgerufen — und **nur** das, also nur die Unit-Tests.

#### Was an Test-Infrastruktur schon existiert (und wiederverwendet wird)

Im Ordner `src/app/testing/` liegen vier kleine Helfer, die wir keinesfalls neu erfinden, sondern ausbauen:

- **`axe.testing.ts`** stellt `expectNoAxeViolations(element)` bereit — eine Funktion, die das genannte HTML-Stück automatisiert auf Barrierefreiheitsfehler prüft und bei Verstößen den Test mit einer lesbaren Meldung scheitern lässt. Zwei Regeln sind dabei abgeschaltet (`color-contrast`, `region`), weil sie in jsdom mangels echtem Rendering nur Fehlalarme produzieren würden.
- **`canvas.testing.ts`** gaukelt jsdom einen Zeichen-Kontext für `<canvas>` vor, damit Chart.js überhaupt startet (jsdom hat keinen echten Canvas). Im Kommentar dieser Datei steht ein wichtiger Hinweis, der später unsere Mocking-Regel begründet: Sie kommt bewusst **ohne `vi.mock`** aus, „weil der Angular-Test-Transform `vi.mock` so verschiebt, dass Paket-Mocks brechen". Merken: **`vi.mock` von ganzen Paketen funktioniert mit unserem Builder nicht zuverlässig.**
- **`contrast.testing.ts`** rechnet Farbkontraste numerisch aus — der jsdom-Ersatz für die abgeschaltete AXE-Kontrastregel.
- **`match-media.setup.ts`** repariert eine fehlende Browser-Funktion, ohne die Angulars „BreakpointObserver" (der erkennt, ob wir auf Desktop/Tablet/Mobil sind) in jsdom abstürzt.

Außerdem gibt es bereits eine bewährte i18n-Test-Mechanik: ein `TranslocoTestingModule`, das im Test feste
Übersetzungen einspeist, einen Helfer `healthStatusTranslocoTesting(...)` und eine Schutz-Prüfung namens
`RAW_HEALTH_ENUM`, die sicherstellt, dass niemals ein roher technischer Wert (etwa `Unhealthy`) statt eines
übersetzten Textes in der Oberfläche landet.

#### Was bereits getestet ist (29 Test-Dateien)

Bei den **Stores** sind vier abgedeckt (in **sechs** Dateien): `BreadcrumbLabelStore`, `InstrumentDetailStore` und der
`InstrumentOverviewStore` (gleich in drei Varianten — Grundtest, „http-binding" und „offpage-map") sowie der
`Mg2DiagnosticStore`. Bei den **Komponenten** sind **14** abgedeckt, darunter die Instruments-Seiten, der
Detail-Drawer, die Instrument-Karte, die Tabellen-/Karten-/Karten-Ansichten und einige Shared-Bausteine. Dazu
kommen eine getestete Direktive und **drei** getestete Hilfsfunktionen (plus drei `*.models.spec.ts` und zwei
Core-Context/Registry-Specs).

#### Was fehlt

Es fehlen **fünf Stores** (`WorkspaceStore`, `LocationCacheStore`, `LocationStore`, `UserStore` und der
Fleet-`InstrumentStore`), **53 Komponenten** quer durch Shell, Fleet, Health, Shared und einige Einzelseiten,
sowie jegliche **Coverage-Schwellen** und ein **PR-Gate** (also ein automatischer Riegel, der einen Merge
blockiert, wenn die Tests rot sind oder die Abdeckung zu niedrig).

Und schließlich: Es gibt zwar bereits eine **e2e-Suite mit Playwright**, aber sie läuft gegen das **echte
Backend** mit **echtem Azure-AD-Login** (man muss sich beim Start einmal von Hand im Browser anmelden), prüft
zuerst, ob die echten Server erreichbar sind, läuft streng nacheinander und legt echte Workspaces an, die
hinterher wieder aufgeräumt werden. Wegen des manuellen Logins und der Backend-Abhängigkeit **läuft sie nicht in
der CI**. Genau diese Lücke — schnelle, automatische e2e bei jedem Pull Request — schließt die neue dritte
Ebene weiter unten.

#### Zwei Mock-Stile, die das Repo schon kennt

Es gibt heute zwei Wege, wie Tests das Backend ersetzen, und beide bleiben uns erhalten:

- **(A) Den Service direkt ersetzen.** Man tauscht den generierten `@byk`-Service gegen ein Attrappen-Objekt, dessen Methoden mit `vi.fn(() => of(...))` feste Antworten liefern. Das ist der häufigste Stil.
- **(B) Auf HTTP-Ebene prüfen.** Mit Angulars `HttpTestingController` (plus `provideHttpClientTesting()`) lässt man den *echten* generierten Service laufen, fängt aber den HTTP-Aufruf ab und kontrolliert ihn auf der Leitungsebene. Genau eine Datei macht das heute (`instrument-overview.store.http-binding.spec.ts`), um zu prüfen, dass die richtigen Query-Parameter und Header rausgehen.

Diese beiden Stile sind die Keimzelle dessen, was in Abschnitt 5 zur Ebene **L1** ausgebaut wird.

---

### 3. Test-Architektur (die drei Schichten)

Die wichtigste Einsicht zuerst: Die entscheidende Frage ist **nicht** „echtes Backend oder Mock?", sondern
**„Welchen Zweck hat dieser Test, und wie oft läuft er?"**. Daraus ergeben sich drei aufeinander aufbauende
Test-Ebenen plus eine bewusst kleine, behaltene Suite gegen das echte System.

| Ebene | Was sie prüft | Werkzeug | Backend | Login | Wie oft | Wer pflegt |
|---|---|---|---|---|---|---|
| **L1 — Unit/Store** | Reine Logik: Berechnungen, Zustandsübergänge, Caching, Fehlerbehandlung | Vitest + **typed Fakes** (Service direkt ersetzt) | keins (unterhalb der HTTP-Grenze) | irrelevant | jeder PR | Feature-Autor |
| **L2 — Komponente/Integration** *(der „Arbeitspferd"-Bereich)* | Komponente **+** Store rendern, HTTP am Rand ersetzt; leere/ladende/Fehler-/Rollen-Zustände, Formvalidierung, AXE | Vitest + **MSW** | **MSW** (gemockt) | DI-Fake / kein echter Login | jeder PR | Feature-Autor |
| **L3 — Hermetische e2e** *(das PR-Gate)* | Echte App im echten Browser über ganze Abläufe hinweg | Playwright + **`@msw/playwright`** | **MSW** | **Fake-Login per DI** | jeder PR | Test-Owner + Autoren |
| *(behalten)* **Real-Backend-Smoke** | „Stimmt der Vertrag mit dem echten Server wirklich?" | Playwright vs. live | **echt** | **echtes Azure AD** | nachts / vor Release | Test-Owner |

#### Die eine Faustregel, die alles zusammenhält

> **Mocke den Transport (MSW), wenn der Test die HTTP-Grenze überquert. Nimm einen typisierten Fake, wenn der
> Test unterhalb dieser Grenze bleibt.**

Was ist mit „HTTP-Grenze" gemeint? Stell dir die Aufruf-Kette vor:

```
Komponente → Store → generierter @byk-Service → HttpClient → [Netzwerk]
                   ↑                                            ↑
           L1 schneidet HIER                            MSW schneidet HIER (L2/L3)
           (Service durch vi.fn ersetzt)               (echte Kette, nur das Netz ersetzt)
```

Ein Store ruft einen Service, der Service ruft `HttpClient`, der spricht mit dem Netzwerk. **Wo** man die Kette
durchtrennt und die Attrappe einsetzt, bestimmt, was getestet wird.

**Warum L1 *kein* MSW benutzt — ausführlich.** Ein Store-Unit-Test will den Store *isoliert* prüfen. Dafür
ersetzt man seinen *direkten* Nachbarn — den Service — durch einen Fake. MSW dagegen ersetzt zwei Ebenen tiefer
das Netzwerk. Das hat fünf konkrete Nachteile, wenn man es bei L1 täte:

1. **Aus einem Unit-Test würde ein Integrationstest.** Plötzlich liefen in *jedem* Store-Test der echte Service, der echte `HttpClient` und die echte JSON-Verarbeitung mit. Das testet generierten Fremdcode nochmal mit — überflüssig, denn der ist generiert und wird einmalig vom „http-binding"-Test abgedeckt.
2. **Man verliert die punktgenaue Zeitsteuerung.** Die *schwersten* Store-Tests prüfen Timing: „Ist `loading` mitten im Aufruf wirklich `true`?", „Wenn Aufruf B vor Aufruf A zurückkommt, verwirft der Store das veraltete Ergebnis von A?" (das nennt sich *Race-Guard* mit einem *Generation-Counter* — einem Zähler, der veraltete Antworten erkennt). Mit einem von Hand auslösbaren `Subject` steuert man jede einzelne Antwort exakt. Über ein (gefälschtes) Netzwerk geht das kaum deterministisch.
3. **Man faked die Netz-Ebene zwei Schichten zu tief.** Das brächte bei L1 null Mehrwert. (Auf Angular 21 verschärfte sich das noch durch ein jsdom-XHR-Problem — MSW fing XHR unter jsdom nur unzuverlässig ab, Aufrufe konnten „hängen". Seit dem v22-Umstieg auf `fetch` als Default entfällt dieser Zusatzpunkt; die übrigen vier Gründe tragen die Entscheidung aber weiterhin allein.)
4. **Man verliert Typsicherheit und Tempo.** Der Service-Fake ist exakt gegen die `@byk`-Typen typisiert und antwortet synchron — also blitzschnell. MSW schickt untypisiertes JSON über die „Leitung", was langsamer ist und die Typkopplung an der Aufrufstelle aufweicht.
5. **Es prüft die falsche Frage.** L1 fragt: „Wenn der Service X liefert — verhält sich der Store richtig?" Die sauberste Formulierung davon ist eben „der Service liefert X" = ein Service-Fake.

**Und genau deshalb ist MSW bei L2/L3 *richtig*:** Dort lautet die Frage „verhält sich die **ganze Kette** —
Komponente bis Netz — korrekt?". Also will man die echte Kette laufen lassen und nur das Netz ersetzen. Derselbe
Schnitt, der bei L1 falsch wäre, ist bei L2/L3 genau passend.

#### Wie viel von jeder Ebene? (Die Ratio)

Die Fachwelt hat sich auf eine Mischung geeinigt: viele schnelle Tests unten, wenige langsame oben. Bildlich
spricht man von der **Testpyramide** (Martin Fowler) und, als Verfeinerung für Frontends, von der **Testing
Trophy** (Kent C. Dodds), bei der die *Integrationstests* (Komponente + Daten, HTTP gemockt) den dicksten Block
bilden. Google nennt empirisch ungefähr 80 % kleine, 15 % mittlere, 5 % große Tests. Für uns übersetzt:

| Ebene | Anteil | Wie oft |
|---|---|---|
| L1 Unit/Store | ~40–45 % | jeder PR |
| L2 Komponente/Integration | ~35–45 % | jeder PR |
| L3 Hermetische e2e | ~5–10 % | jeder PR |
| Real-Backend-Smoke | <1–2 % | nachts / vor Release |

Das **Anti-Muster** heißt „Eistüte" (ice-cream cone): zu viele langsame Browser-Tests obendrauf. Die Ökonomie
macht klar, warum: ein 5-Minuten-e2e-Test, tausendfach ausgeführt, kostet rund 83 Stunden; dieselben Fälle als
50-Millisekunden-Unit-Tests kosten rund 50 Sekunden. Faustregel: Browser-e2e auf ~10–15 % deckeln. Render-Details,
Formvalidierung, Menü-/Drawer-Logik wandern *nach unten* in L1/L2; oben bleiben nur die kritischen Gesamt-Abläufe
(z. B. Login → Workspace wählen → Instrument anlegen → Diagnose öffnen), bei denen Routing, Login-Schutz und das
Zusammenspiel mehrerer Features gemeinsam halten müssen.

> **Belege:** [hermetisches Testen bei Google](https://abseil.io/resources/swe-book/html/ch23.html) ·
> [80/15/5](https://abseil.io/resources/swe-book/html/ch11.html) ·
> [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) ·
> [web.dev — Teststrategien](https://web.dev/articles/ta-strategies).

---

### 4. Tooling & Konventionen

#### „Zoneless" — und warum `fakeAsync`/`tick` für uns tot sind

Ältere Angular-Tests benutzten Hilfsmittel namens `fakeAsync` und `tick`, um in Tests „die Zeit
vorzuspulen". Diese Hilfsmittel brauchen jedoch Zone.js. Unsere App ist **zoneless** (verzichtet auf Zone.js),
also funktionieren `fakeAsync`/`tick` **nicht** und haben hier auch kein Ersatzkommando. Stattdessen treiben wir
asynchrone Vorgänge über die **Fake-Timer von Vitest** voran und warten mit `await fixture.whenStable()`, bis
Angular „fertig gerechnet" hat. Wo immer möglich, geben Methoden ein Promise zurück, das man schlicht `await`en
kann.

#### Das „settle"-Muster (drei Varianten vereinheitlichen)

In Tests muss man Angular nach einer Änderung anstoßen, neu zu zeichnen, und dann warten. Diese Abfolge wird im
Repo bisher mehrfach kopiert. Wir bündeln sie in `src/app/testing/settle.testing.ts` in drei klar benannten
Varianten — je nachdem, ob ein Macrotask-Schritt (für Drawer-Animationen/Fokus) oder Fake-Timer im Spiel sind:

```ts
import { ComponentFixture } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';

/** Einfachster Fall: anstoßen → warten → nochmal anstoßen. */
export async function settleFixture(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

/** Für Overlays/Drawer/Routing: ein zusätzlicher „Macrotask"-Schritt für openedChange + Fokus. */
export async function settle(fixture: ComponentFixture<unknown> | RouterTestingHarness): Promise<void> {
  const f = 'fixture' in fixture ? fixture.fixture : fixture;
  f.detectChanges();
  await f.whenStable();
  await new Promise((r) => setTimeout(r)); // ein „Macrotask": Drawer-Animation / Fokus-Wechsel
  f.detectChanges();
  await f.whenStable();
}

/** Wenn Fake-Timer laufen, löst setTimeout(0) nie aus → stattdessen die Timer-Schlange vorspulen. */
export async function settleFake(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await vi.advanceTimersByTimeAsync(0);
  await fixture.whenStable();
  fixture.detectChanges();
}
```

(Ein *Macrotask* ist, vereinfacht, die nächste „Runde" der JavaScript-Ereignisschleife — manche Browser-Effekte
wie das Öffnen eines Drawers passieren erst eine Runde später, deshalb der `setTimeout(0)`-Schritt.)

#### Fake-Timer — die Regeln in Worten

Es gibt zwei Modi, die man nie versehentlich mischt:

- **Nur die Uhr fälschen** (`vi.useFakeTimers({ toFake: ['Date'] })` + `vi.setSystemTime(...)`), wenn man ein festes „heute" braucht (für Datumsrechnungen), aber echte asynchrone Abläufe weiterlaufen sollen.
- **Alle Timer fälschen** und mit `await vi.advanceTimersByTimeAsync(ms)` aktiv vorspulen, wenn man eine *Verzögerung* gezielt durchlaufen muss — etwa die 300-Millisekunden-Eingabeverzögerung („Debounce") der Standortsuche oder das 150-Millisekunden-Sammelfenster eines Stores.

Wichtig: in `afterEach` immer `vi.useRealTimers()` aufrufen. Vergessene Fake-Timer und ein hängengebliebenes
gefälschtes Datum sind die häufigsten Ursachen für „mal grün, mal rot"-Tests (Flakiness).

#### Mocking — der Standard ist DI, nicht Module

„DI" steht für *Dependency Injection* — Angulars Mechanismus, mit dem Bausteine ihre Abhängigkeiten gestellt
bekommen, statt sie selbst zu erzeugen. Genau das nutzen wir zum Mocken: Wir sagen dem Test „liefere für diesen
Service dieses Attrappen-Objekt" (`{ provide: Service, useValue: … }`). Das hält die echte Verdrahtung intakt und
vermeidet Stolperfallen.

Was wir **vermeiden**, ist `vi.mock(...)` auf ganze Pakete. Der Grund steht im Kommentar von `canvas.testing.ts`:
Der Angular-Test-Transform „hebt" `vi.mock` an eine Stelle, an der Paket-Mocks brechen. Wo man wirklich ein Kind
ersetzen muss, nimmt man stattdessen `TestBed.overrideComponent` (man tauscht eine Unterkomponente gegen eine
Attrappe).

#### Übersetzungen (Transloco) im Test

Wir speisen feste Übersetzungen über `TranslocoTestingModule.forRoot({...})` ein (Standardsprache `de`), für die
Health-Texte gibt es den Helfer `healthStatusTranslocoTesting(...)`. Einen Sprachwechsel im Test löst man mit
`setActiveLang('en')` aus und prüft danach, dass die Oberfläche umschaltet. Eine Schutz-Prüfung stellt sicher,
dass nie ein roher technischer Wert statt eines übersetzten Textes durchrutscht.

#### Barrierefreiheit (AXE) und Material-Overlays

Auf den bedeutungstragenden Zuständen ruft man `await expectNoAxeViolations(host)` auf. Die in jsdom nicht
sinnvoll prüfbaren Regeln (Farbkontrast, Landmark-Regionen) sind dort abgeschaltet und werden anderswo abgedeckt.
Bei Material-Bedienelementen (Dropdowns, Tabellen, Dialoge …) nutzt man die **Harnesses** — die offiziellen
Test-Anfasser —, statt im Overlay-HTML herumzusuchen, und schaltet Animationen ab
(`MATERIAL_ANIMATIONS {animationsDisabled:true}`), weil jsdom keine Animations-Ereignisse kennt.

---

### 5. L1 — Stores und reine Logik testen

#### Der Backend-Mock auf L1: typisierte In-Memory-Fakes

Die beiden bestehenden Mock-Stile (A: Service ersetzen, B: HTTP abfangen) heben wir auf eine wiederverwendbare,
zentrale Schicht unter `src/app/testing/backend/`. Statt dass jeder Store-Test seine Attrappen selbst
zusammenbaut (viel doppelter Code), gibt es **eine** Funktion `provideMockBackend(seed?)`, die alle
nachgebauten Services auf einmal bereitstellt, dazu eine kleine **In-Memory-Datenbank** (einfache `Map`s im
Speicher), die man vorbefüllen („seeden") kann, und ein Steuerobjekt `CallControl`, mit dem man Fehler, künstliche
Verzögerungen und das exakte Auslösen von Antworten kontrolliert.

```
src/app/testing/backend/
  fixtures/                  // Fabrikfunktionen für Testdaten (makeInstrumentRegistration(...), makeLocation(...), …)
  fake-backend.db.ts         // die seedbare In-Memory-DB
  fake-*.service.ts          // je ein Fake-Service, der die @byk-Methoden nachbildet
  injection.ts               // CallControl: failNext()/defer()/Latenz
  ambient.stubs.ts           // Stubs für Notification/Transloco/Auth/Navigation
  provide-mock-backend.ts    // provideMockBackend(seed?) — stellt alle Fakes als Provider bereit
  index.ts
```

**Wo genau die Typsicherheit sitzt:** in den **Fixtures** (den Fabrikfunktionen für Testdaten), nicht in den
Fake-Services. Eine Fixture ist als `Partial<DTO> → DTO` getippt — man gibt nur die abweichenden Felder an, der
Rest wird sinnvoll vorbelegt, aber das Ergebnis ist exakt der echte DTO-Typ. Der Nutzen: Wenn das Backend seine
Datenform ändert und die `@byk`-Typen neu generiert werden, **bricht die Fixture beim Kompilieren** — wir
bemerken die Abweichung also sofort, nicht erst zur Laufzeit. Beispiel:

```ts
// fixtures/instrument.fixtures.ts
import { HealthStatus, InstrumentRegistration, InstrumentStatus } from '@byk/ngx-api-service-hub';

let seq = 0;
const nextId = (p: string) => `${p}-${++seq}`;

export function makeInstrumentRegistration(o: Partial<InstrumentRegistration> = {}): InstrumentRegistration {
  const id = o.id ?? nextId('dev');
  return { id, serialNumber: `SN-${id}`, catalogNumber: 4430, locationId: null,
    createdAtUtc: '2026-01-01T00:00:00Z', ...o };
}

export function makeInstrumentStatus(o: Partial<InstrumentStatus> = {}): InstrumentStatus {
  return { certificateHealth: HealthStatus.Healthy, instrumentHealth: HealthStatus.Healthy,
    dateTimeUtc: '2026-06-11T12:04:00Z', ...o };
}
```

**Das `CallControl`-Objekt — warum es so wichtig ist.** Die anspruchsvollen Store-Tests prüfen *Timing*. Damit
das geht, kann man mit `CallControl` pro Methode steuern: `failNext('methode')` lässt den nächsten Aufruf
fehlschlagen (zum Testen der Fehlerbehandlung); `defer('methode')` gibt einem ein `Subject` zurück, dessen Antwort
man **von Hand** auslöst (zum Testen von Ladezuständen und Wettlauf-Situationen); `latencyMs` simuliert eine
Verzögerung.

```ts
// injection.ts (Auszug)
export class CallControl {
  private readonly errors = new Map<string, unknown>();
  private readonly deferred = new Map<string, Subject<unknown>>();
  latencyMs = 0;

  failNext(method: string, err: unknown = new HttpErrorResponse({ status: 500 })): void { this.errors.set(method, err); }
  defer<T>(method: string): Subject<T> { const s = new Subject<T>(); this.deferred.set(method, s as Subject<unknown>); return s; }
  // emit(...) liefert je nach Zustand: das deferrte Subject, einen Fehler, oder (ggf. verzögert) den Wert.
}
```

`ambient.stubs.ts` liefert schließlich Standardattrappen für die „Umgebungs"-Dienste, die fast jeder Store nebenbei
braucht: den `NotificationService` (als Spion, um zu prüfen, dass eine Fehlermeldung ausgelöst wurde, ohne echte
Snackbars zu zeigen), `TranslocoService` (liefert nur die aktive Sprache), `AuthService` (liefert einen
Fake-Benutzer) und den Navigations-Dienst.

#### Welche Abhängigkeit echt bleibt und welche man ersetzt

Eine wiederkehrende Frage: Wenn ein Store *einen anderen Store* benutzt — nimmt man den echten oder eine Attrappe?
Die Antwort hängt davon ab, ob der zweite Store zur *gleichen Datenebene* gehört:

- **Verschachtelter Store derselben Feature-Ebene → echt lassen.** Beispiel: Der `InstrumentOverviewStore` nutzt intern den `InstrumentDetailStore`; der `LocationStore` nutzt den `LocationCacheStore`. Diese bilden zusammen *eine* logische Cache-Hierarchie — das Zusammenspiel *ist* das zu testende Verhalten. Man stellt nur die untersten Service-Fakes bereit; Angular baut den echten verschachtelten Store darüber automatisch zusammen.
- **„Umgebungs"-Store (Kontext) → ersetzen.** Beispiel: der `WorkspaceStore` (er weiß, welcher Workspace gerade aktiv ist). Ihn echt hochzufahren würde MSAL, Navigation und Tenant-Services mitziehen. Also ersetzt man nur seine Lese-Oberfläche durch `{ activeWorkspaceId: () => 't1' }`.
- **`AuthService`** wird ebenfalls durch einen Mini-Stub ersetzt (der echte braucht MSAL).
- **`NotificationService`** wird als Spion ersetzt (man prüft, *dass* eine Meldung kam, ohne sie zu rendern).
- **`TranslocoService`** wird durch einen Stub ersetzt, der nur die aktive Sprache liefert.

#### Die Pläne für alle neun Stores

Im Folgenden je Store: der Status (TESTED = es gibt bereits einen Test; GAP = Verhalten noch nicht abgedeckt) und
*welche konkreten Verhaltensweisen* abzudecken sind. Wo Fachbegriffe fallen: **LRU-Cache** = ein Zwischenspeicher
fester Größe, der bei Überlauf den am längsten nicht benutzten Eintrag verwirft („Least Recently Used");
**Generation-Counter** = ein Zähler, mit dem man veraltete Antworten erkennt und verwirft; **Batch-Fenster** = ein
kurzer Zeitraum, in dem mehrere Einzelanfragen gesammelt und gebündelt abgeschickt werden.

**5.1 `BreadcrumbLabelStore`** (core) — **TESTED.** Hält einen kleinen Beschriftungs-Cache (max. 50 Einträge),
braucht keine Services. Kleine Lücke: prüfen, dass `set()` bei unverändertem Wert nichts umsortiert.

**5.2 `WorkspaceStore`** (core) — **GAP, hoher Wert.** Verwaltet die Workspaces (Mandanten) des Benutzers. Zu
testen: die Prioritätskette beim Laden des aktiven Workspace (zuletzt aktiver → gespeicherte ID → erster
verfügbarer); das parallele Laden von Liste und Anzahl; Anlegen/Umbenennen/Löschen samt der optimistischen Annahme,
dass der Ersteller sofort Verwaltungsrechte hat; das Zwischenspeichern von Berechtigungsabfragen samt sauberem
Verhalten bei Fehlern; das Zurücksetzen der Seite bei Suche/Seitenwechsel; die Lade-/Fehlerzustände (mit
`defer()` mitten im Aufruf geprüft); das Auslösen einer Fehlermeldung; das Merken des letzten Workspace im
Browser-Speicher; das Weiternavigieren, wenn der gerade aktive Workspace gelöscht wird. Backend: typisierte Fakes;
Navigation und Meldungen als Spione.

**5.3 `LocationCacheStore`** (core) — **GAP.** Ein zentraler Standort-Zwischenspeicher mit Rollen-Informationen.
Zu testen: das Befüllen des Caches (überspringt Arbeit, wenn schon für denselben Mandanten geladen); das Einfügen
ohne Duplikate; das „mehr laden" (Paginierung); das Laden von Rollen (mit einer Abkürzung, falls der Benutzer
ohnehin alles verwalten darf); die Drei-Wege-Unterscheidung beim Nachladen eines Standorts (gefunden / nicht
gefunden / Fehler); die Race-Guards beim Mandantenwechsel mitten im Laden (veraltete Ergebnisse verwerfen); die
Zählung von Instrumenten/Benutzern je Standort; das sprachrichtige Sortieren; das vollständige Zurücksetzen.

**5.4 `InstrumentDetailStore`** (core) — **TESTED (umfangreich).** Hält Detail- und Status-Caches (je max. 50,
LRU) und zwei Generation-Counter. Kleine Lücken: die Verdrängung im dritten Cache und das Verwerfen veralteter
Status-Details über einen Mandantenwechsel (bisher nur über einen Sprachwechsel getestet). Die vorhandenen,
`Subject`-gesteuerten Wettlauf-Tests bleiben unverändert erhalten.

**5.5 `InstrumentOverviewStore`** (instruments) — **TESTED (umfangreich; drei Dateien).** Nutzt intern den echten
`InstrumentDetailStore`, hat ein 150-ms-Sammelfenster und einen größeren Cache (max. 200). Lücken: die Verdrängung
im 200er-Cache; der Fehlerpfad beim Laden der Statistik; die Trigger, die Seite/Sortierung/Filter ändern und neu
laden; einige abgeleitete Werte. Für die Logik nutzt man die typisierten Fakes; den HTTP-Vertrag prüft weiterhin
der „http-binding"-Test.

**5.6 `LocationStore`** (fleet) — **GAP.** Verwaltet Standorte (Liste + CRUD). Nutzt intern den **echten**
`LocationCacheStore`. Besonders zu testen: das **optimistische Aktualisieren mit Rücknahme bei Fehler** — die
Oberfläche zeigt die Änderung sofort, und wenn der Server scheitert, müssen *sowohl* Liste *als auch* Cache wieder
auf den alten Stand zurückspringen. Außerdem Anlegen/Löschen samt Zählerpflege und Cache-Bereinigung, die
Geocodierung einer Adresse, sowie die abgeleiteten Anzeigewerte und die Trigger für Suche/Sortierung/Seite.

**5.7 `UserStore`** (fleet) — **GAP.** Verwaltet die Benutzer eines Workspace samt Rollen und Standort-Filter. Zu
testen: der Normalmodus (Benutzer + Anzahl + Manager-IDs parallel laden); der gefilterte Modus mit **zwei**
gleichzeitigen Wettlauf-Schutzwächtern (ändert sich der Filter mitten im Laden, darf das veraltete Ergebnis nicht
gewinnen); die Rollen-Anzeige; der „aktueller Benutzer"-Wert; der Schutz davor, sich als letzter Manager selbst zu
entfernen; das Entfernen eines Benutzers. Den `AuthService` ersetzt ein Mini-Stub.

**5.8 `InstrumentStore` (fleet)** — **GAP.** Anders als der Übersichts-Store: er lädt Details mit begrenzter
Parallelität (höchstens 6 gleichzeitig), hat einen Generation-Counter und einen 200er-Cache, aber kein
Sammelfenster und keinen verschachtelten Store. Zu testen: das Laden (Caches bei Mandantenwechsel leeren, Filter
korrekt in Parameter übersetzen, veraltete Läufe verwerfen) und das nachgelagerte Detail-Laden (mit Begrenzung auf
6, Fehler je Aufruf abfangen); die Cache-Verdrängung; das Aktualisieren eines einzelnen Status; das
Anlegen/Abmelden/Umbenennen/Umziehen samt Cache- und Zählerpflege; die abgeleiteten Werte; und das saubere
Aufräumen laufender Abos beim Zurücksetzen (nachweislich: das alte Abo ist wirklich beendet).

**5.9 `Mg2DiagnosticStore`** (mg2) — **TESTED.** Ein **komponenten-gebundener** Store (er wird mit dem Panel
erzeugt und beim Schließen verworfen — anders als die globalen Stores muss er deshalb in den `providers` des Tests
gelistet werden). Kleine Lücken: das erneute Laden per `retry()` und das saubere Verhalten bei wiederholtem
`load()` derselben ID.

#### Die Vorlage für einen Store-Test

```ts
import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { provideMockBackend } from '../../../testing/backend';
import { ambientStubs } from '../../../testing/backend/ambient.stubs';
import { makeInstrumentRegistration } from '../../../testing/backend/fixtures';
import { FeatureStore } from './feature.store';

function setup(opts: { lang?: string } = {}) {
  // Backend vorbefüllen ("seeden") mit einem Beispiel-Datensatz:
  const mock = provideMockBackend((db) => db.seedInstruments(makeInstrumentRegistration({ id: 'r1' })));
  TestBed.configureTestingModule({
    providers: [
      // FeatureStore,                 // ← NUR bei komponenten-gebundenen Stores (z. B. Mg2DiagnosticStore)
      ...mock.providers,
      ...ambientStubs({ lang: opts.lang }),
    ],
  });
  const store = TestBed.inject(FeatureStore);
  store.reset?.();                     // globalen Store von eventuellem Vorzustand befreien
  return { store, mock };
}

afterEach(() => { localStorage.clear(); vi.useRealTimers(); });

describe('FeatureStore', () => {
  it('landet bei Erfolg im geladenen Zustand', async () => {
    const { store } = setup();
    await store.loadInstruments('t1');           // Methode gibt ein Promise zurück → einfach await-en
    expect(store.loading()).toBe(false);
    expect(store.instruments()).toHaveLength(1);
  });

  it('zeigt loading, bis die Antwort eintrifft', async () => {
    const { store, mock } = setup();
    const pending = mock.instruments.control.defer<number>('listRegisteredInstrumentsResultCount');
    const p = store.loadInstruments('t1');
    expect(store.loading()).toBe(true);          // mitten im Aufruf
    pending.next(1); pending.complete(); await p; // jetzt von Hand die Antwort auslösen
    expect(store.loading()).toBe(false);
  });

  it('macht aus einem Server-Fehler einen Fehlerzustand, ohne zu werfen', async () => {
    const { store, mock } = setup();
    mock.instruments.control.failNext('listRegisteredInstruments');
    await store.loadInstruments('t1');
    expect(store.error()).not.toBeNull();
  });

  it('verwirft eine veraltete frühere Antwort (Wettlauf-Schutz)', async () => {
    const { store, mock } = setup();
    const a = mock.instruments.control.defer('getInstrumentInfo'); const pA = store.load('dev-A');
    const b = mock.instruments.control.defer('getInstrumentInfo'); const pB = store.load('dev-B');
    b.next(/* B */); b.complete(); await pB;     // B kommt zuerst zurück
    a.next(/* A */); a.complete(); await pA;     // A kommt verspätet → muss verworfen werden
    expect(/* der Zustand spiegelt weiterhin B */).toBe(true);
  });
});
```

Zusätzlich gibt es **pro generiertem Service genau einen** „http-binding"-Test (den Vertrags-Test auf HTTP-Ebene).
Er ersetzt den Service *nicht*, sondern lässt den echten laufen und prüft mit `HttpTestingController`, dass die
richtigen Parameter und Header über die Leitung gehen (Schreibweise, der `tenant-id`-Header, Datumsrechnungen). Der
MSAL-Interceptor wird dabei bewusst weggelassen, damit kein echtes Token nötig ist.

---

### 6. L2 — Komponenten und Integration testen

Jede der 57 offenen Komponenten fällt in genau **eine** von sechs Kategorien („Tiers"). Die Kategorie legt fest,
*was* zu prüfen ist, *womit*, und welche Barrierefreiheits-/Fokus-Regeln gelten. Tests, die die HTTP-Grenze
überqueren (Seiten/Container und Drawer, die selbst Daten laden), ersetzen das Backend mit **MSW** und den
gemeinsamen Handlern aus `src/mocks/` (Abschnitt 8); rein darstellende Komponenten brauchen gar kein Backend.

#### Die sechs Kategorien

| Tier | Beispiel-Komponenten (offen) | Kern-Technik | AXE |
|---|---|---|---|
| **P** Rein darstellend | LoadingContent, ErrorContent, FilterChip, InitialCircle, RoleChip, SlimProgressBar, NotificationSnackbar, Help, Service, Welcome | Komponente erzeugen, Eingaben setzen, rohes HTML prüfen, Ausgaben abfangen | 1 Prüfung |
| **M** Mäßig zustandsbehaftet | PropertyRow, Breadcrumb, LanguageSwitcher, SessionExpiredBanner, WorkspaceDropdown, ThemeButton, UserInfo, CardView, CalculationBreakdown, MaintenanceWarningCard, Settings | Wirts-Wrapper + Signal-Stubs + Sprachwechsel | interaktiver + Ladezustand |
| **C** Container / Seite | Shell, App, FleetShell, fleet Instruments/Locations/Users, HealthPage, HealthDetailPage, Landing | `RouterTestingHarness` + echter Store + **MSW** | leer + Fehler + geladen |
| **D** Dialog / Drawer | AddUser, …Deregister, …Delete, …Remove, WorkspaceCreate/Delete; Instrument-/Location-/User-Drawer | direkt rendern (mit gestellten Dialog-Daten) **und** per Dialog-Harness | geöffneter Dialog/Drawer, beide Drawer-Modi |
| **X** Externe Bibliothek | LeafletMap, DashboardPage, AgingTrendChart | Kind-Attrappe / echte Objekt-Inspektion / Canvas-Attrappe | nur der Rahmen (Lib ausgeschlossen) |
| **A** Barrierefreiheit-kritisch | SideNav, TopBar, WorkspaceDropdown, LocationSelect | echte Tastatur-Ereignisse, Fokus prüfen, Fake-Timer | offener/aktiver Zustand, Pflicht |

#### Was jede Kategorie konkret bedeutet

- **P (rein darstellend):** Diese Komponenten haben keine Logik, nur Eingaben → Anzeige. Man setzt die Eingaben (`componentRef.setInput(...)`), prüft das gerenderte HTML (z. B. die richtige CSS-Klasse, der `—`-Platzhalter bei leeren Werten), fängt ausgelöste Ausgaben ab und macht *eine* AXE-Prüfung. Schnell und mit hohem Nutzen.
- **M (mäßig zustandsbehaftet):** Etwas Logik, kleine abgeleitete Werte, evtl. ein Ladezustand. Man umhüllt die Komponente mit einer Test-Wirtskomponente, stellt kleine Signal-Stubs bereit, prüft die abgeleiteten Werte über mehrere Zustände, das Lade-Skelett, und dass nach einem Sprachwechsel die Texte umschalten.
- **C (Container/Seite):** Ganze Seiten, die Routing und Daten verbinden. Man nutzt das `RouterTestingHarness` (ein Test-Helfer, der echtes Routing in der Testumgebung erlaubt), gibt einen echten Store über das **MSW**-gemockte Backend, und prüft die drei wichtigen Zustände: leer, Fehler, geladen — jeweils mit den richtigen ARIA-Rollen (`status` für „leer", `alert` für „Fehler"). Auch: dass der Zurück-Knopf nicht den Fokus „verliert".
- **D (Dialog/Drawer):** Hier gibt es zwei Test-Schichten: einmal die Komponente *direkt* rendern (mit von Hand gestellten Dialog-Daten), um die Formular- und Schließlogik zu prüfen; einmal den Dialog *richtig öffnen* und per **Dialog-Harness** das Overlay und die Barrierefreiheit prüfen. Drawer werden in einer Wirtskomponente getestet, in *beiden* Modi (über dem Inhalt = `role=dialog`+`aria-modal`, oder seitlich = `role=complementary`), inklusive: Fokus springt beim Öffnen hinein und beim Schließen zum Auslöser zurück.
- **X (externe Bibliothek):** Leaflet (Karten) und Chart.js (Diagramme) rendern in jsdom nichts. Regel: **niemals die Bibliothek per `vi.mock` ersetzen.** Bei Chart.js gaukelt man jsdom einen Canvas vor (`installFakeCanvas2dContext()`) und prüft *die gebauten Daten/Optionen* — nicht das Bild. Bei Leaflet tauscht man für Eltern-Tests die Karte gegen eine Attrappe; für die Karten-Komponente selbst inspiziert man die echten Marker-Objekte und die Lebenszyklus-Effekte (Layer hinzugefügt/entfernt, ResizeObserver verbunden/getrennt).
- **A (barrierefreiheit-kritisch):** Komponenten mit echter Tastatur-Bedienung. Man feuert echte Tastatur-Ereignisse (`new KeyboardEvent('keydown', { key: 'ArrowDown' })`), prüft, welches Element den Fokus hat (`document.activeElement`), und insbesondere den **Roving-Tabindex** (s. u.). Bei Eingabeverzögerungen treibt man die Fake-Timer um die nötigen Millisekunden vor.

**Was ist ein „Roving-Tabindex"?** Bei einer Tastatur-Navigation (z. B. der Seitennavigation) soll immer nur
*ein* Element mit Tab erreichbar sein (`tabindex="0"`), alle anderen nicht (`tabindex="-1"`); mit den Pfeiltasten
„wandert" dieser eine Tab-Stopp durch die Liste. Genau dieses Verhalten prüfen wir.

#### Steckbriefe der schwierigsten Komponenten

- **`SideNavComponent` (A):** Beim Start genau ein Tab-Stopp; Pfeil/Pos1/Ende bewegen den Fokus und den „aktiven" Index korrekt (mit Umlauf); der aktiv markierte Eintrag passt segmentgenau zur Route (`/fleet/customers` darf nicht fälschlich als `/fleet-management` gelten); plus Übersetzung und AXE.
- **`LocationSelectComponent` (A+X — am aufwändigsten):** die 300-ms-Eingabeverzögerung (per Fake-Timer); die clientseitige Abkürzung, wenn der Cache schon vollständig ist (dann *kein* Server-Aufruf); der Wettlauf-Schutz (Suche A, dann B vor A's Antwort → A wird verworfen); die Filter (`roleFilter`, `excludeIds`); das Anhängen weiterer Treffer („mehr laden"); der Mehrfachauswahl-Modus; und AXE bei offenem Auswahlfeld.
- **`LeafletMapComponent` (X):** dunkle Kacheln im Dark-Mode, Tastatur bewusst aus; der Effekt, der bei Themenwechsel die Kacheln tauscht; das Einpassen auf die Marker; der ResizeObserver wird beim Erzeugen verbunden und beim Zerstören getrennt; das `aria-label` ist gesetzt.
- **`AgingTrendChartComponent` (X — Chart.js):** das Diagramm wird *einmal* erzeugt und bei Datenänderung nur *aktualisiert* (nicht neu erzeugt); die Themenfarben kommen aus CSS-Variablen mit festen Ausweich-Werten; bei Sprachwechsel wird die Legende neu gebaut; bei „Animationen reduzieren" werden Animationen ausgeschaltet; beim Zerstören wird sauber aufgeräumt; der Canvas hat `role="img"` + `aria-label`.
- **`DashboardPageComponent` (C+X):** das Laden mit begrenzter Parallelität (höchstens 3 gleichzeitig); der Generation-Counter (Workspace-Wechsel mitten im Laden verwirft Veraltetes); die Marker mit Popups (ein Klick löst die richtige Ausgabe aus); die Popup-Links navigieren korrekt; die Statusfilter-Abzeichen; das Leaflet-Kind wird durch eine Attrappe ersetzt.
- **Fleet-Dialoge/Drawer (D):** die Schließlogik mit korrekter Nutzlast; das Formular-Tor (z. B. „Anlegen" schließt nur bei gültiger Eingabe, schneidet Leerzeichen ab, zeigt bei Überlänge eine Fehlermeldung); die ARIA-Rollen; beim Standort-Drawer die Validierungen, die Berechtigungs-Wahrheitstabellen (`canVerify()`/`canManage()`), der Geocodierungs-Ablauf, der „ungespeicherte Änderungen"-Schutz und der Schutz gegen Doppel-Absenden.
- **`TopBarComponent` (A):** Strg+K/Cmd+K fokussiert das Suchfeld; andere Tasten tun nichts; der globale Tastatur-Listener wird beim Zerstören wieder entfernt.

#### Wiederverwendbare Helfer (neu, unter `src/app/testing/`)

Damit die Tests nicht jedes Mal dieselbe Mechanik kopieren, kommen ein paar kleine Helferdateien hinzu:
`harness.testing.ts` (Zugriff auf Overlay-Harnesses, statt im Overlay-HTML zu suchen), `dialog.testing.ts`
(Standard-Provider für Dialog-Tests), `leaflet-stub.component.ts` (eine Leaflet-Attrappe), `chart.testing.ts`
(Stubs für Themenfarben + Canvas), `a11y.testing.ts` (Tastatur-Helfer und eine Prüfung „genau ein Tab-Stopp"),
`standalone-i18n.testing.ts` (kompaktes Transloco-Setup) und das schon erwähnte `settle.testing.ts`.

```ts
// a11y.testing.ts (Auszug)
export function expectSingleTabStop(els: ArrayLike<HTMLElement>, activeIndex = 0): void {
  Array.from(els).forEach((el, i) => expect(el.getAttribute('tabindex')).toBe(i === activeIndex ? '0' : '-1'));
}
export function key(el: Element, k: string, init: KeyboardEventInit = {}): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
}
```

#### Die Vorlage für einen Komponenten-Test

```ts
import { TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { TranslocoService } from '@jsverse/transloco';
import { translocoTesting, expectNoRawKeys } from '../../../testing/standalone-i18n.testing';
import { settle } from '../../../testing/settle.testing';
import { expectNoAxeViolations } from '../../../testing/axe.testing';
import { MyComponent } from './my-component';

const DE = { 'my.feature.title': 'Titel' };
const EN = { 'my.feature.title': 'Title' };

function setup() {
  TestBed.configureTestingModule({
    imports: [translocoTesting({ de: DE, en: EN })],
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
  });
  const fixture = TestBed.createComponent(MyComponent);
  fixture.detectChanges();
  return { fixture, host: fixture.nativeElement as HTMLElement };
}

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('MyComponent', () => {
  it('zeigt den Eingabe-Zustand an', () => {
    expect(setup().host.querySelector('.title')?.textContent).toContain('Titel');
  });
  it('übersetzt bei Sprachwechsel neu', async () => {
    const { fixture, host } = setup();
    TestBed.inject(TranslocoService).setActiveLang('en');
    await settle(fixture);
    expect(host.textContent).toContain('Title');
  });
  it('lässt keine rohen i18n-Schlüssel durchsickern', () => { expectNoRawKeys(setup().host, ['my.feature.']); });
  it('besteht die AXE-Prüfung', async () => { await expectNoAxeViolations(setup().host); });
});
```

Für eine **Seite (Tier C)** ersetzt man das `setup()` durch das `RouterTestingHarness` samt Routing-Providern und
dem MSW-Backend. Für eine **Tastatur-Komponente (Tier A)** ergänzt man `vi.useFakeTimers()` und treibt die
Eingabeverzögerung mit `await vi.advanceTimersByTimeAsync(300)` voran.

---

### 7. L3 — Hermetische End-to-End-Tests

**Was „hermetisch" hier konkret heißt:** Wir starten die **echte App im echten Browser** (echtes Routing,
echtes Rendern, echtes Klicken), aber **alles außerhalb des Frontends ist gemockt** — das Backend (über MSW), der
Login (über eine Attrappe), Zeit und Zufall. Dadurch hängt der Test von nichts Wechselndem ab: kein laufender
Server, kein echter Azure-AD-Login, keine geteilte Datenbank. Das Ergebnis ist *deterministisch* (immer gleich)
und kann **unbeaufsichtigt und parallel in der CI** laufen — das, was die heutige reale e2e-Suite gerade nicht
kann. Hermetisches Testen ist ein etablierter Industriestandard (Google prägte den Begriff).

#### Womit das Backend gemockt wird: `@msw/playwright`

Es gibt drei denkbare Wege, und wir wählen bewusst den dritten:

1. **Rohes `page.route()` von Playwright** — Playwright kann Netzaufrufe selbst abfangen. Das bräuchte keine App-Änderung, aber diese Mocks leben in der Playwright-Welt und lassen sich **nicht** mit den Unit-Tests teilen.
2. **MSW im Browser (über einen Service Worker)** — bräuchte ein Mock-Schalter im App-Bundle und scheitert auf unserem Stack daran, dass Playwright den Service Worker eigens „durchlässig" schalten muss, sonst werden Aufrufe unsichtbar. (Unter Angular 21 kam erschwerend hinzu, dass der Browser-Service-Worker XHR im Firefox nicht abfing — seit dem v22-`fetch`-Default kein Thema mehr.)
3. **`@msw/playwright`** — die offizielle Brücke: sie fährt die MSW-Handler *durch* Playwrights `page.route()`. Kein Service Worker, kein Mock-Schalter im Bundle, fängt XHR in allen Browsern. **Der entscheidende Vorteil:** ein und derselbe Handler-Satz bedient **L2 (Unit/Integration) und L3 (e2e)**.

Die Daten dahinter liefert dieselbe **`FakeBackendDb`** wie in L1 und L2 (Abschnitt 8) — ein kleiner
zustandsbehafteter In-Memory-Store, sodass z. B. „lege einen Workspace an" tatsächlich dazu führt, dass er im
folgenden „liste Workspaces" auftaucht. Das bildet euren bestehenden „Anlegen + Aufräumen"-Ablauf sauber nach. Mit
`onUnhandledRequest: 'error'` lassen wir den Test scheitern, sobald ein *nicht* gemockter Endpunkt aufgerufen wird —
das fängt Abweichungen sofort. *(Ursprünglich war hier ein schemabasiertes `@mswjs/data` vorgesehen; warum wir
stattdessen die handgeschriebene `FakeBackendDb` teilen, steht im Entscheidungs-Log, Abschnitt 15.)*

#### Wie der Login ohne echtes Azure AD funktioniert

Wichtig vorab: **MSW mockt Azure AD nicht.** MSW fängt nur die *Daten*-Aufrufe ab. Der eigentliche MSAL-Login ist
eine Browser-Weiterleitung zu `login.microsoftonline.com` — also eine Navigation, kein Datenaufruf, und damit für
MSW unsichtbar. Wir mocken den Login deshalb eine Ebene höher.

Im hermetischen Lauf prüft *nichts* das Token (das Backend ist ja gemockt), also genügt ein **erfundenes,
syntaktisch gültiges Token**. Der sauberste Weg: ein Fake-`IPublicClientApplication` (so heißt das zentrale
MSAL-Objekt) wird per Dependency Injection in einer e2e-Build-Konfiguration eingesetzt. Damit „sieht" der
Login-Schutz (`MsalGuard`) und der Token-Anhänger (`MsalInterceptor`) einen eingeloggten Benutzer — ganz ohne
Netz, ohne Geheimnisse, ohne echten Mandanten:

```ts
// e2e/auth-mock.providers.ts  (NUR über environment.e2e.ts geladen — darf NIE in Produktion landen)
const FAKE_ACCOUNT = {
  homeAccountId: 'e2e-oid.e2e-tid', tenantId: 'e2e-tid', username: 'manager@e2e.test',
  localAccountId: 'e2e-oid', name: 'E2E Manager', environment: 'login.windows.net',
  idTokenClaims: { roles: ['Manager'] },               // ← die Rolle steckt hier drin
};
const fakePca = {
  initialize: async () => {}, handleRedirectPromise: async () => null,
  getAllAccounts: () => [FAKE_ACCOUNT], getActiveAccount: () => FAKE_ACCOUNT, setActiveAccount: () => {},
  acquireTokenSilent: async () => ({ accessToken: 'fake.jwt.token', account: FAKE_ACCOUNT }),
};
// + ein Stub für MsalBroadcastService, damit Guard/Interceptor zufrieden sind.
```

*(In PR-6 als Welle-0-Artefakt geliefert: `e2eAuthProviders(role)` in `e2e/auth-mock.providers.ts` mit Default
`E2E_AUTH_PROVIDERS` = Manager — voll verdrahtet erst in Welle 6.)*

**Verschiedene Rollen testen (Manager vs. Viewer):** je Rolle eine eigene Test-Konfiguration. Kommt die Rolle aus
dem Token, schreibt man sie in `idTokenClaims.roles`; kommt sie aus einem API-Aufruf (`/me`), lässt man den Login
gleich und variiert nur den **MSW-Handler** je Rolle. Genau das ist der große Vorteil: zwei „Benutzer" zu
simulieren ist eine Einzeiler-Änderung — keine zwei echten Konten nötig. (Genau dieser Punkt — der echte
MsalGuard verlangt einen echten Azure-AD-Login, der lokal nicht mockbar war — war bisher der Grund, warum sich die
App lokal nicht selbst „durchspielen" ließ. Der Token-Fake löst das.)

#### Wiederverwendung und Browser-Umfang

Die **bestehenden Page Objects und die Feature-/Topic-Struktur** der heutigen e2e-Suite bleiben nutzbar — nur zwei
Dinge werden getauscht: der Datenrand (MSW-Handler statt echtem Server) und der Login (DI-Fake statt manueller
Anmeldung). Wir richten dafür ein eigenes Playwright-Projekt `chromium-hermetic` ein, das die App im „Mock-Modus"
selbst startet und **ohne** den Backend-Check und den manuellen Login auskommt. Seit dem Angular-22-Umstieg
(Arbeitspaket #26619) ist `fetch` der Standard-Transport — die XHR-Einschränkung entfällt, **Firefox kann jetzt
dazukommen** (Aktivierung im e2e-Rollout). Diese Suite läuft mit mehreren parallelen Arbeitern, gesharded, unbeaufsichtigt.

> **Belege:** [@msw/playwright](https://github.com/mswjs/playwright) · [MSW-Grenzen](https://mswjs.io/docs/limitations/) ·
> [Microsoft Learn — Apps mit MSAL testen](https://learn.microsoft.com/en-us/entra/msal/dotnet/advanced/testing-apps-using-msal) ·
> [Playwright — Authentifizierung](https://playwright.dev/docs/auth).

---

### 8. Die gemeinsame Mock-Architektur

Der eigentliche Hebel der ganzen Strategie: **eine** Datenwahrheit, von mehreren Test-Ebenen genutzt. Die
gemockten HTTP-Antworten leben zentral unter `src/mocks/`:

```
src/mocks/
  handlers/{index,instruments,locations,users,tenants}.ts   # die Handler — handgeschrieben, lesen die FakeBackendDb
  db.ts                                            # re-exportiert die FakeBackendDb (src/app/testing/backend) als geteilten Store
  node.ts        # setupServer(...handlers)  → für L2 (Vitest)
  browser.ts     # setupWorker(...handlers)  → für „ng serve --configuration=mock" (Dev/Demo)
e2e/
  auth-mock.providers.ts                           # der DI-Login-Fake, je Rolle (e2eAuthProviders(role))
e2e-hermetic/                                      # eigene Lane (PR-6), getrennt von der real-backend e2e/-Suite
  network.fixture.ts                               # @msw/playwright bindet dieselben Handler ein (defineNetworkFixture)
  playwright.hermetic.config.ts                    # eigenständige Config, ohne check-backend
  foundation.spec.ts                               # Spike-4-Proof
```

Ein Handler ist nichts weiter als „auf diese URL antworte mit diesen Daten" — und diese Daten holt er aus der
**FakeBackendDb**, demselben In-Memory-Store, den auch die L1-Fakes nutzen:

```ts
import { http, HttpResponse } from 'msw';
export const instrumentHandlers = [
  http.get('*/v1/InstrumentRegistration', () => HttpResponse.json(db.listInstruments())),
  http.get('*/v1/InstrumentRegistration/count', () => HttpResponse.json(db.countInstruments())),
];
```

**Handgeschrieben statt generiert.** Die ursprüngliche Annahme war, diese Handler aus der `openapi.json` zu
*generieren* (mit `@mswjs/source`) und die DB über ein Schema-Werkzeug (`@mswjs/data`) zu modellieren. Wir bauen die
Handler stattdessen **von Hand** — sie sind dünne Adapter über die `FakeBackendDb`, die wir für L1 ohnehin schon
gebaut haben (Arbeitspaket #26765, PR-2). Die ausführliche Begründung — warum Generierung hier mehr Wartung als
Nutzen bringt und gegen unsere festen, deterministischen Fixtures arbeitet — steht im **Entscheidungs-Log
(Abschnitt 15)**.

**Wer pflegt was:** Feature-Autoren schreiben ihre L1/L2-Tests direkt neben dem Code, den sie ausliefern, und
steuern bei Bedarf einzelne abweichende Antworten bei (`server.use()` / `network.use()`). Ein Frontend-Test-Owner
pflegt den gemeinsamen, **handgeschriebenen** Handler-Satz, den CI-Riegel gegen die Spezifikation, die
L3-Login-Attrappe und die nächtliche Real-Backend-Suite. Das Backend-Team „besitzt" nur die `openapi.json` — die
Wahrheit, gegen die wir prüfen (sie liegt gebündelt in den `@byk`-Paketen, siehe Abschnitt 9).

> **Wichtige Abgrenzung L1 vs. L2:** `src/mocks/` (MSW) bedient **L2/L3**. **L1** nutzt die *getrennte*, typisierte
> Fake-Service-Schicht aus `src/app/testing/backend/` (Abschnitt 5) — **kein MSW**. Beide teilen sich aber nicht nur
> dieselben **Fixtures** (Testdaten-Fabriken), sondern **denselben Store** (`FakeBackendDb`): Die L2/L3-Handler lesen
> die DB **direkt** (nicht über die rxjs-`Fake*Service`-Adapter). So projizieren beide Schichten garantiert
> dieselben Beispieldaten — eine einzige Daten-/Zustands-Quelle für die ganze Strategie. Die Handler-Bodies werden
> dabei mit `satisfies <DTO>` getippt (sonst gelten sie als `any` und `tsc` prüft sie gar nicht).

---

### 9. Wie wir verhindern, dass die Mocks vom echten Backend abweichen

Der häufigste, berechtigte Einwand gegen gemockte Tests: „Eure Mocks könnten sich vom echten Backend
unterscheiden — dann sind die Tests grün, obwohl die Integration kaputt ist." Diesen Auseinanderdriften
(„Drift") begegnen wir mehrstufig, und unsere OpenAPI-Welt macht es billig:

**Die Realität dieses Repos:** Unsere `@byk`-Clients sind **npm-Pakete** (drei Stück, auf zwei Base-URLs verteilt),
**aus `openapi.json` generiert**. **Der Spec ist jetzt in die Pakete gebündelt** und liegt nach der Installation
unter `node_modules/@byk/<paket>/openapi.json` (OpenAPI 3.0.4) — damit automatisch an die installierte
Client-Version gekoppelt: `npm update @byk` bringt Client *und* passenden Spec **atomar** mit (keine Kopplung an die
Veröffentlichungs-Kadenz des Backends, kein Versions-Schiefstand, kein separates Pinnen). Aktueller Stand: **alle
drei Pakete bündeln den Spec** (`ngx-api-service-hub`, `ngx-api-bis`, `ngx-api-prevent-it-mg2`) — ein gepinntes
`contracts/`-Fallback ist nicht mehr nötig. Damit gilt der ursprüngliche, stärkste Plan:

**(a) Den Vertrag über Typen sichern, nicht über einen Generier-Diff.** Sowohl die `fixtures/` als auch die
handgeschriebenen Handler-Bodies sind mit `satisfies <DTO>` gegen *dieselben* generierten `@byk`-DTOs getippt.
Ändert das Backend eine Datenform, bringt `npm update @byk` den neuen Client *samt* gebündeltem Spec **atomar** mit,
und `tsc --noEmit` bricht zur Kompilierzeit ab — das **primäre**, billigste Drift-Signal. Da `HttpResponse.json`-
Antworten sonst als `any` gelten, ist das `satisfies <DTO>` an den Handler-Bodies das, was sie überhaupt erst
prüfbar macht. (Wir generieren die Handler bewusst **nicht** mehr aus der `openapi.json` — der getippte Client und
die getippten Fixtures liefern den Vertragsschutz bereits, und generierte Beispiel-Bodies wären
nicht-deterministisch; die volle Begründung steht im Entscheidungs-Log, Abschnitt 15.)

**(b) Der CI-Riegel — vier Signale statt eines Generier-Diffs (implementiert in PR-6).** Bei jedem PR sind die
Signale 1, 3 und 4 gegatet; Signal 2 ist ein Wartungs-Refresh (`npm update` verändert die Lockfile
nicht-deterministisch, daher kein PR-Riegel). Die Arbeit hängt an vier npm-Scripts: `contract:types`,
`contract:lint`, `contract:paths` und `contract:check` (= die drei vorherigen zusammen, also die per-PR-gatebaren Signale 1/3/4 — der neue CI-Schritt, der
in `build/client-build.yml` direkt vor `test:ci` läuft).

1. **`tsc --noEmit` (das Primärsignal)** über **Fixtures und Handler** — eine geänderte DTO-Form ist ein
   Kompilierfehler. `contract:types` = `tsc -p tsconfig.app.json --noEmit`; es ist Teil von `contract:check` und
   wird in der CI zusätzlich vom Prod-Build abgedeckt.
2. **`npm run update-api`** (= `npm install @byk@latest` für alle drei Pakete) zieht Client und gebündelten Spec
   **atomar** (versions-gekoppelt, kein Schiefstand). Das ist der Refresh-Schritt, kein PR-Riegel.
3. **`Spectral`-Lint** (`@stoplight/spectral-cli`, Ruleset `.spectral.yaml` mit `extends: spectral:oas`) auf jeder
   `node_modules/@byk/*/openapi.json`, mit `--fail-severity error`. Die strukturellen Validitäts-Regeln (`oas3-schema`
   usw.) riegeln; die Doku-Hygiene-Regeln (Beschreibungen, Kontakt, Server-Block) sind ausgeschaltet — die gehören
   dem Backend, nicht unserem Riegel. Zwei backend-eigene Eigenheiten mussten neutralisiert werden, damit das Gate
   heute überhaupt grün ist: `duplicated-entry-in-enum` ist **aus**, weil Spectral 6.16 sonst auf `ngx-api-bis`
   *abstürzt* („Cannot read properties of null (reading 'enum')" — ein Werkzeug-Bug, nicht ein Spec-Fehler), und zwei
   `responses.200.description: null`-Stellen in bis (OpenAPI verlangt einen String) sind als bekannte Baseline
   chirurgisch übersteuert. Das sind echte, vom Backend ausgelieferte Defekte, die wir nicht reparieren können —
   **sie sind ans Backend zu melden**; der Riegel bleibt grün, fängt aber jeden NEU auftretenden Strukturfehler.
4. **Pfad-Abgleich** (`tools/contract/check-handler-paths.mjs`, bewusst **außerhalb `src/`**, sonst würde der
   Prod-Build ihn typprüfen): das Script bestätigt, dass jede von einem Handler in `src/mocks/handlers/*` bediente
   URL auch wirklich als Pfad in der **Vereinigung** der drei `openapi.json` existiert. Eine Normalisierung bringt
   beide Seiten auf eine Form (MSW-`*`-Basis, `:id`-Parameter, OpenAPI-`{id}`-Parameter, Query, Schluss-Slash). Das
   ersetzt deterministisch den früheren „neu generieren + `git diff --exit-code`"-Schritt; die Gegenrichtung (Store
   ruft einen Pfad ohne Handler) ist bewusst offen gelassen (sie bräuchte Store-Parsing, und Signal 1 plus die
   http-binding-Tests pinnen die aufgerufenen URLs bereits).

In allen MSW-Surfaces läuft die `onUnhandledRequest`-Allowlist, damit kein unbemerkter Aufruf durchrutscht.

**(c) „Pact" vorerst zurückstellen.** *Consumer-driven Contract Testing* (z. B. Pact) fängt auch *bedeutungs*-
Abweichungen, die das reine Schema nicht sieht — braucht aber zusätzliche Infrastruktur und aktive Mitarbeit des
Backend-Teams. Bei separatem Backend und ohnehin OpenAPI-First ist das aktuell zu schwer; wir greifen nur bei
Bedarf später dazu.

**(d) Die nächtliche Real-Backend-Suite ist der empirische Sicherheitsanker** — der eine Ort, an dem gegen die
*Realität* (nicht nur das Schema) geprüft wird. Mindestens ein echter Happy-Path je Modul.

**Empfohlene Kombination:** (a)+(b) als tägliche Maschinerie, (d) als nächtlicher Anker, Pact optional später.

---

### 10. Coverage-Politik & CI-Gating

#### Zielwerte (Endzustand)

„Coverage" misst, wie viel Prozent des Codes von Tests durchlaufen wurde, getrennt nach *Statements* (Anweisungen),
*Branches* (Verzweigungen wie if/else), *Functions* (Funktionen) und *Lines* (Zeilen). Verzweigungen liegen
naturgemäß etwas niedriger, weil jsdom manche darstellungsbedingten Pfade nicht durchlaufen kann.

| Bereich | Stmts | Branches | Funcs | Lines |
|---|---|---|---|---|
| **Global** | 85 | 78 | 85 | 85 |
| Stores (`**/data-access/**`) | 90 | 85 | 90 | 90 |
| reine Hilfsfunktionen (`**/utils/**`) | 100 | 100 | 100 | 100 |
| Shared-Komponenten | 90 | 80 | 90 | 90 |
| externe Bibliotheken (Leaflet/Charts) | 80 | 65 | 80 | 80 |

#### Was ausgeschlossen wird

Der „v8"-Coverage-Provider zählt sonst auch die Test-Dateien selbst mit, was die Zahl verfälscht. Deshalb schließen
wir aus: alle `*.spec.ts`, den gesamten Test-Hilfsordner, `src/mocks/`, alle `*.testing.ts`, Barrel-Dateien
(`index.ts`), `main.ts`, die Environment-Dateien, Routing- und Config-Dateien sowie Typdeklarationen. Die
generierten `@byk`-Pakete liegen in `node_modules` und sind ohnehin draußen. Die `*.models.ts` schließen wir
*nicht* pauschal aus, weil einige davon echte Laufzeitlogik enthalten.

#### Coverage-Schwellen — nativ im Builder (kein Workaround nötig)

`@angular/build@22.0.4` hat eine **eingebaute** `coverageThresholds`-Option (verifiziert in der Schema-Datei des
Builders; der Executor bricht mit Fehler ab, wenn die Schwelle unterschritten wird) plus `coverageExclude`. Den
**globalen** Riegel („unter 85 % failt der Build") setzt man direkt in der `angular.json`:

```jsonc
// angular.json → … → test.configurations.ci
"coverageThresholds": { "statements": 85, "branches": 78, "functions": 85, "lines": 85 }
```

Diese native Option ist **flach** (keine Pfad-spezifischen Unterschwellen). Die **bereichsweisen** Schwellen
(Stores 90, Hilfsfunktionen 100, Shared-Komponenten 90, externe Libs 80) müssen daher in eine kleine
Vitest-Konfigurationsdatei, die der Builder über die `runnerConfig`-Option mit einmischt — dort liegen auch
`clearMocks`/`restoreMocks`:

```ts
// vitest-base.config.ts  (im Repo-Wurzelverzeichnis)
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    clearMocks: true, restoreMocks: true,
    coverage: {
      provider: 'v8', reportsDirectory: './coverage', ignoreEmptyLines: true,
      thresholds: {
        // global steht nativ in angular.json; hier NUR die bereichsweisen Schwellen
        'src/app/**/data-access/**': { statements: 90, branches: 85, functions: 90, lines: 90 },
        'src/app/**/utils/**': { 100: true },
        'src/app/shared/components/**': { statements: 90, branches: 80, functions: 90, lines: 90 },
      },
    },
  },
});
```
```jsonc
// angular.json → … → test.options
"options": {
  "setupFiles": ["src/app/testing/match-media.setup.ts"],
  "runnerConfig": "vitest-base.config.ts"
}
```

> **In Welle 0 kurz bestätigen (nicht blockierend): ✅ erledigt (PR-6).** Empirisch belegt, dass **auch die
> bereichsweisen Schwellen** aus der `runnerConfig` failen: wir haben einen Boden testweise über den Messwert gehoben
> (`src/app/**/utils/**` branches `94 → 99`) → `npm run test:ci` brach mit `ERROR: Coverage for branches (94.11%)
> does not meet "src/app/**/utils/**" threshold (99%)` ab; nach dem Zurücknehmen wieder grün (564 Tests). Der Builder
> merget den globalen Riegel (`angular.json`) und die bereichsweisen Schwellen (`runnerConfig`) zu **einem Objekt mit
> disjunkten Schlüsseln**; Vitest setzt `process.exitCode=1` bei Unterschreitung, der Builder mappt das auf einen
> fehlgeschlagenen Lauf. Der früher angedachte **Cobertura-/PowerShell-Fallback entfällt** — es gibt keinen
> nicht-unterstützten CI-Pfad mehr abzusichern.

#### Schrittweises Anheben („Ratcheting")

In Welle 0 messen wir den Ist-Stand und setzen die Schwellen auf genau diese Zahlen — der Riegel verhindert dann
zunächst nur *Verschlechterung*. Nach jeder Welle hebt man die Schwellen lokal auf den neuen Stand und committet
die erhöhten Zahlen (niemals automatisch in der CI hochziehen). Jede Erhöhung ist ein sichtbarer Diff im Wellen-PR
— das *ist* die Fortschrittsdokumentation.

#### Was sich in der CI ändert (`build/client-build.yml`)

Ein Testfehler failt den Job heute schon (der non-zero-Exit von `test:ci`, dazu `failTaskOnFailedTests: true`).
Künftig kommen hinzu: den Coverage-Riegel scharfschalten; die HTML-Berichte als Artefakte bereitstellen; eine
**Branch-Policy** einrichten, die den `client-build` zur Merge-Voraussetzung macht (das ist der eigentliche Riegel
— ohne Policy ist die YAML-Datei zahnlos). Neu hinzu kommen der **Contract-Riegel** (seit PR-6 ein eigener Schritt
`npm run contract:check` direkt vor `test:ci` — Signal-1-tsc-Typecheck plus Spectral-Lint aller
`node_modules/@byk/*/openapi.json` plus der Handler↔Spec-Pfad-Abgleich; Signal 1 läuft hier **und** im Prod-Build,
Signal 2 ist Wartungs-Refresh), die **hermetische e2e-Spur** (läuft bei jedem PR, ohne Geheimnisse — Chromium-Install
+ `e2e:hermetic`) und die **nächtliche Real-Backend-Spur** (mit automatisiertem Login statt manuellem). Test-Sharding heben wir uns auf, bis die Suite spürbar über ~5 Minuten läuft.

Eine **bewusste Invariante** dabei (festgehalten in PR-6): Der Prod-Build typ-prüft `src/mocks/**` mit, weil `tsconfig.app.json` ganz `src/**/*.ts` (außer `*.spec.ts`) einschließt — und dieser Code value-importiert `msw` (eine **devDependency**, z. B. `src/mocks/node.ts` → `import { setupServer } from 'msw/node'`). Darum **muss** die CI ein volles `npm ci` fahren und darf **nie `--omit=dev`** verwenden, sonst failt `ng build` schon die Typprüfung. Das ist heute der Fall (`build/client-build.yml`); wir halten es nur explizit fest, damit eine spätere „Prod-Install ohne devDeps"-Optimierung den Build nicht still bricht.

---

### 11. Rollout in sechs Wellen

Die Arbeit wird in sechs aufeinander aufbauenden Wellen erledigt; jede ist ein oder mehrere Pull Requests auf einem
`gbr/<wi>-…`-Branch, jede Komponenten-Welle durchläuft das in CLAUDE.md vorgeschriebene UX/UI-Experten-Review, und
jede hebt die Coverage-Schwellen ein Stück an. Aufwands-Kürzel: S ≈ ≤0,5 Tag, M ≈ 0,5–1,5 Tage, L ≈ 1,5–3 Tage je
Einzelposten.

**Welle 0 — Fundament (blockiert alles andere).** Hier entsteht die ganze Infrastruktur: die Mock-Backend-Schicht
(Fakes, seedbare DB, Fixtures, `CallControl`, `provideMockBackend`), die Test-Helfer (`settle`, `harness`,
`dialog`, Leaflet-Attrappe, `chart`, `a11y`, i18n), die Vorlagen — **und das geteilte `src/mocks/`-MSW-Fundament
(Handler, `db.ts`, `node.ts` — handgeschrieben über die `FakeBackendDb`, also kein Codegen, siehe Abschnitt 15)
samt dem Contract-Riegel aus Abschnitt 9 (in PR-6 als `contract:check` = Spectral + Pfad-Abgleich gebaut).**
Letzteres muss *zuerst* stehen, weil die Seiten-/Drawer-Tests in Welle 4 und die hermetische e2e-Spur (jeder PR)
darauf aufbauen — und `src/mocks/` heute noch gar nicht existiert. Dazu mehrere Vorab-Klärungen („Spikes"): greift der **native**
`coverageThresholds`-Riegel (global) plus die bereichsweisen Schwellen aus `runnerConfig`? Läuft MSW unter jsdom
sauber, jetzt da der Transport `fetch` ist (ein Mini-Test gegen `setupServer`)? Settelt die Change-Detection im
**vollen Fake-Timer-Modus** deterministisch (echtes debouncetes Component, `LocationSelect` 300 ms)? Und greift
`@msw/playwright` mit einer **Passthrough-Allowlist** für Nicht-API-Verkehr? **Fertig, wenn:** das Fundament **inkl.
`src/mocks/` + Contract-Riegel** gemergt ist, ein bisher ungetesteter Store (Vorschlag: der Fleet-`InstrumentStore`)
als Beweisstück komplett umgesetzt ist und `test:ci` grün läuft. **Aufwand:** L (≈5–7 Tage).

**Welle 1 — Stores vervollständigen.** Die fünf fehlenden Stores werden gegen die Fundament-Fakes durchgetestet,
plus je ein „http-binding"-Vertragstest pro generiertem Paket. **Fertig, wenn:** 9/9 Stores getestet sind — jeweils
inklusive Lade-→Geladen-Übergang, Fehlerabbildung, Cache-Verdrängung und mindestens einem Wettlauf-Schutz; die
Store-Schwellen stehen pro Datei auf 90. **Aufwand:** L (≈6–8 Tage).

**Welle 2 — Darstellende Komponenten mit hohem Nutzen.** Die einfachen (Tier P) und mäßig komplexen (Tier M)
Komponenten plus die statischen Seiten (Landing, Welcome, Help, Service, Settings, App-Wurzel). Die `dev/*`-
Komponenten nur testen, falls sie wirklich in Produktion ausgeliefert werden, sonst mit Kommentar aus der Coverage
ausschließen. **Fertig, wenn:** alle gelistet getestet sind; die Shared-Komponenten-Schwelle steht auf 90.
**Aufwand:** M (≈5–7 Tage).

**Welle 3 — Barrierefreiheit-kritisch & komplex.** `SideNav`, `TopBar`, `LocationSelect` (das aufwändigste Stück)
und die `ShellComponent`. Mit echten Tastatur-Ereignissen, Fokus-Prüfungen, Fake-Timern für Eingabeverzögerungen
und Wettlauf-Schutz. **Fertig, wenn:** alle vier getestet sind (inkl. Tastatur und veralteter Ergebnisse); die
Shell-Schwelle steht auf 85. **Aufwand:** L (≈5–8 Tage).

**Welle 4 — Seiten, Dialoge & Drawer.** Die Fleet-Seiten und Health-Seiten (über das Routing-Harness + MSW), die
Bestätigungs- und Anlege-Dialoge (direkt + per Dialog-Harness) und die Drawer (in beiden Modi, mit Fokus-Verwaltung
und Breakpoint-Mock). **Fertig, wenn:** alle getestet sind, inklusive Fokus-Verwaltung und Overlay-AXE.
**Aufwand:** L (≈12–16 Tage).

**Welle 5 — Externe Bibliotheken.** `LeafletMap`, `DashboardPage`, `AgingTrendChart` (die bereits getesteten
`MapView`/`Mg2TrendChart` als Vorlage). Mit Canvas-Attrappe, Leaflet-Attrappe, echter Objekt-Inspektion — und
niemals `vi.mock` einer Render-Bibliothek. **Fertig, wenn:** alle getestet sind; die globale Schwelle wird pro
Datei scharfgeschaltet. **Aufwand:** L (≈5–6 Tage).

**Welle 6 — Die hermetische e2e-Schicht.** Nur noch das e2e-Spezifische — das `src/mocks/`-Fundament steht ja seit
Welle 0: das `@msw/playwright`-Wiring samt Login-Attrappe und Rollen-Fixtures; die teuersten und unzuverlässigsten
realen e2e-Fälle (Rollen-Matrix, Anlegen/Löschen) wandern in die schnelle, hermetische Spur (sie konsumieren die
geteilten `src/mocks/`-Handler aus Welle 0); und die Real-Backend-Suite wird auf einen nächtlichen, automatisch
eingeloggten Lauf umgestellt. **Fertig, wenn:** die hermetische Spur bei jedem PR in der CI grün ist und die
Real-Backend-Suite nachts unbeaufsichtigt läuft. **Aufwand:** L (≈8–12 Tage).

**Gesamt:** grob 44–62 Entwicklertage über sechs Wellen.

---

### 12. Abbildung auf Azure DevOps

Organisatorisch: **ein Feature** („Testabdeckung — alle Komponenten & Stores + hermetische e2e"), Area
`BykCommonLib\BYKCARE Prevent-It`, Iteration `…\1.0.0`. Darunter **eine User Story je Welle** (Welle 0 bis 6). Die
Akzeptanzkriterien gehören ins eigene Feld `Microsoft.VSTS.Common.AcceptanceCriteria` (als Markdown), **nicht** in
die Beschreibung; die Kriterien sind die „Fertig, wenn"-Punkte der Welle. Unter jeder Story sitzen **Tasks** (einer
je Store/Komponente oder kleines Bündel), alle dem Benutzer `Georg.Breithaupt@this.de` zugewiesen. Branches heißen
`gbr/<wi>-…`. Jeder PR wird mit seiner Task/Story verknüpft; zum Abschluss werden die Elemente auf **Resolved**
gesetzt (das Schließen übernimmt jemand anderes). Nach jeder gemergten Welle wird die **Current-Progress-Wiki-Seite**
gepflegt.

**Fortschritt messen:** drei Zahlen je CI-Lauf — der Anteil getesteter Komponenten (Ziel: je 1 Test von 67), der
Anteil getesteter Stores (heute 4 von 9 → Ziel 9 von 9) und die Coverage-Prozente aus Cobertura (die Zahl mit dem
Riegel).

---

### 13. Definition-of-Done & Pflege

#### Wann ein Test „fertig" ist (Checkliste)

- Liegt direkt neben dem getesteten Code (`*.spec.ts`); der Prüfling wird über **TestBed** instanziiert, nie per `new`.
- Prüft nur die **öffentliche Oberfläche** — sichtbare Signals/abgeleitete Werte, DOM, ARIA, ausgelöste Ausgaben. Keine internen Felder.
- **Kein echtes Netz:** Backend über `provideMockBackend` (L1), MSW (L2/L3) oder `HttpTestingController` (Vertragstest); der MSAL-Interceptor wird nicht verdrahtet.
- **Zeit ist deterministisch:** Fake-Timer wie passend; `useRealTimers()` in `afterEach`; `localStorage.clear()`, falls Einstellungen berührt wurden.
- Deckt, wo zutreffend: Erfolgsfall **plus** ein Fehler-/Leer-Zustand **plus** (bei async) ein Lade-/Zwischenzustand **plus** (falls vorhanden) einen Wettlauf-Schutz.
- **Mindestens eine AXE-Prüfung** für jede Komponente mit sichtbarer/interaktiver Oberfläche, in den bedeutungstragenden Zuständen.
- **i18n:** über das Test-Übersetzungsmodul gerendert; die „kein roher Schlüssel"-Prüfung greift; Sprachwechsel geprüft, wo relevant.
- Material-Overlays über die passende Harness; Animationen abgeschaltet.
- Neue Fixtures gegen die generierten DTOs getippt (`satisfies`).
- Besteht Prettier (nur `src/`), ESLint und die Coverage-Schwelle des Bereichs.
- Grün **sowohl** über `npm test` **als auch** `npm run test:ci`.
- Bei UI-Änderung lief das UX/UI-Experten-Review; alle [C]- und [H]-Befunde sind vor dem Commit behoben.

#### Pflege im laufenden Betrieb

- **Fixtures ↔ DTOs:** nach `npm run update-api` einmal `npm run test:ci` — eine geänderte Datenform zeigt sich als Kompilierfehler in den Fixtures (dort beheben). Die „http-binding"-Tests fangen Abweichungen bei URLs/Parametern/Schreibweisen.
- **i18n-Verträge:** nach Schlüsseländerungen `npm run i18n:extract` **und** `npm run i18n:find`; die `*.testing.ts`-Texte nachziehen. **Niemals `i18n:extract:clean`** (das löscht Schlüssel, die andere hinzugefügt haben). `i18n:extract` formatiert die JSONs um — danach Prettier/Wiederherstellung nachziehen.
- **Neue Stores:** der Vorlage folgen; asynchrone Methoden so bauen, dass sie ein **Promise zurückgeben** — dann lassen sie sich deterministisch `await`-en.
- **Anti-Flakiness-Grundsätze:** nie echtes Netz; Mocks global zurücksetzen; Tests isoliert laufen lassen; in `afterEach` echte Timer wiederherstellen; auf `vi.waitFor`/`expect.poll` statt fester Wartezeiten setzen; ein `retry` ist Diagnose, kein Fix — bei wiederholt rotem Test die Ursache suchen.

---

### 14. Offene Punkte, die wir noch verifizieren müssen

Das hier sind die Annahmen, die wir **noch nicht zu 100 % bestätigt** haben — bewusst als „zu prüfen" markiert,
nicht als Tatsache behauptet. Die meisten gehören in Welle 0.

1. **Coverage-Riegel kurz bestätigen (nicht blockierend).** ✅ *Erledigt — empirisch belegt (PR-6).* Der Builder merget den nativen globalen `coverageThresholds`-Riegel (`angular.json`) mit den bereichsweisen Schwellen aus der `runnerConfig` (`vitest-base.config.ts`) zu **einem Objekt mit disjunkten Schlüsseln**; Vitest matcht jeden Glob und setzt `process.exitCode=1` bei Unterschreitung, der Builder mappt das auf einen fehlgeschlagenen Lauf. **Regressions-Nachweis:** einen Boden testweise über den Messwert gehoben (`src/app/**/utils/**` branches `94 → 99`) → `npm run test:ci` brach mit `ERROR: Coverage for branches (94.11%) does not meet "src/app/**/utils/**" threshold (99%)` ab; nach dem Zurücknehmen wieder grün (564 Tests). Kein Cobertura-PowerShell-Fallback mehr nötig.
2. **MSW + jsdom (`fetch`).** ✅ *Erledigt — Spike 2 (PR-5).* `msw@2.14.6`s `setupServer` fängt den Angular-22-`fetch`-Transport in jsdom 28; der volle Liste/count/info/status-Fluss läuft durch den echten Fleet-`InstrumentStore`, ohne `HttpTestingController`. (Bestärkt die Regel: L1 bleibt bei typisierten Fakes.)
3. **Reifegrad von `@msw/playwright`.** ✅ *Erledigt — Spike 4 (PR-6).* `defineNetworkFixture` fährt die geteilten `src/mocks/handlers` durch `context.route()` in echtem Chromium; db-gestützte Liste, Detail, 404 und ein `network.use()`-Override sind grün. **Zwei Befunde aus dem Lauf:** (a) Playwright transpiliert die e2e-Dateien mit reinem esbuild (ohne Angular-AOT-Linker), darum braucht der teil-kompilierte `@byk`-Client den **JIT-Compiler in Node** — `import '@angular/compiler'` als allererster Import (das gilt auch für Welle 6, weil @msw/playwright die Handler in **Node** ausführt). (b) @msw/playwright antwortet mit den MSW-Headern unverändert (ohne `Access-Control-Allow-Origin`), darum nutzt der Proof ein **gleich-origin** Shell-Dokument statt eines cross-origin-Aufrufs. Der saubere Rückzugsweg auf rohes `context.route()` bleibt dokumentiert. Seit PR-6 läuft der Proof-Spec **bei jedem PR in der CI** (Chromium-Install + `e2e:hermetic` nach `test:ci`) — hermetisch heißt kein Backend/Secret/Login, darum (anders als die real-backend-Suite) CI-fähig; das volle App-Journey-Wiring (`--configuration=mock`, Rollen, Live-Allowlist) ist Welle 6.
4. **MSAL-Stub-Stolpersteine.** Bei nur halb gemocktem MSAL treten bekannte Fehler auf (`inProgress$.pipe is not a function`, `window.crypto.randomUUID is not a function`) — die Provider vollständig stubben.
5. **Lässt `coverage.exclude` die Spec-Dateien wirklich fallen?** Nach dem Ausschluss prüfen, dass die gemeldete Prozentzahl die Test-Dateien nicht mehr mitzählt.
6. **Cache-Größe des Fleet-`InstrumentStore` (200)** gegen den Core-Store (50) verifizieren, bevor man den Verdrängungs-Test kopiert.
7. **Builder-Option `providersFile`** evaluieren (ein global gültiges Provider-Array) als Alternative zum Provider-Setzen je Test — auf Konflikte mit den Test-eigenen Providern prüfen.
8. **Den genauen Warntext** beim Drawer-Fokus (`'[cdkFocusInitial]' is not focusable`) auf der aktuellen CDK-Version bestätigen, damit der „Warnung schlucken"-Helfer keine echten Warnungen verschluckt.
9. **Den HTML-Bericht-Pfad** (`npm run test:report`) gegen die Reporter- und Artefakt-Pfade abgleichen, bevor der CI-Artefakt-Schritt scharfgeschaltet wird.
10. **Voller Fake-Timer-Modus unter zoneless (Welle-0-Spike).** Kein bestehender Test übt den vollen Fake-Timer-Modus (`advanceTimersByTimeAsync`) — alle nutzen nur `toFake: ['Date']`. Vor den Tier-A-Tastatur-Tests beweisen, dass die Change-Detection deterministisch settelt (echtes debouncetes Component, `LocationSelect` 300 ms).
11. **WebMCP (Arbeitspaket #26621) — bewusst außerhalb dieser Strategie.** Angulars experimentelle `provideExperimental*WebMcp*`-API ist Chrome-Origin-Trial-only (Namensraum wandert `navigator.→document.modelContext`; **kein** W3C-Standard, sondern ein WebML-CG-Entwurf) und läuft **nicht** unter jsdom (kein `modelContext` → für L1/L2 strukturell unmöglich), nur in einer echten Browser-Spur. Rolle: **komplementäres, experimentelles** State-Probing — nie ein CI-Riegel, kein Ersatz für L1/L2/L3/Playwright. Reihenfolge: **nach #26620 (Signal Forms)** und **nach Welle 6**, baut auf dem Mock-Build + den `src/mocks/`-Handlern + dem `E2E_AUTH_PROVIDERS`-MSAL-Fake aus Abschnitt 7 auf (erfindet **keinen** eigenen Login-Pfad). Details im Arbeitspaket.

---

### 15. Entscheidungs-Log

Hier sammeln wir die größeren Architektur-Entscheidungen samt Begründung und Recherche, damit der eigentliche
Strategie-Teil (Abschnitte 1–14) **nur die aktuelle Wahrheit** trägt und nicht mit „früher dachten wir…"-Absätzen
zuwächst. Jeder Eintrag nennt Datum, Entscheidung, den Kontext (was wir vorher annahmen) und das *Warum*. Neueste
zuerst. Diese Einträge sind synchron zum gleichnamigen Abschnitt in [`Testing-Spec.md`](./Testing-Spec.md) zu halten.

#### 2026-06-30 — Der §9-Contract-Riegel und das Spike-4-Hermetik-Fundament sind gebaut (PR-6, betrifft Abschnitte 9, 10 und 14)

**Was gebaut wurde.** Der Vier-Signal-Riegel aus Abschnitt 9 existiert jetzt als npm-Scripts und CI-Schritt:
`contract:types` (das `tsc`-Primärsignal), `contract:lint` (Spectral über die drei gebündelten Specs),
`contract:paths` (der Handler↔Spec-Pfad-Abgleich) und `contract:check` (die drei vorherigen zusammen — der neue
CI-Schritt). Dazugekommen sind die Dateien `.spectral.yaml` und `tools/contract/check-handler-paths.mjs` (bewusst
außerhalb `src/`) sowie die Dev-Dependencies `@stoplight/spectral-cli` und `@msw/playwright`. Die volle Unit-Suite
(564 Tests) und der Prod-Typecheck bleiben unverändert grün.

**Drei Entscheidungen am Riegel, mit Begründung.**
1. *Der Pfad-Abgleich prüft Existenz gegen die Vereinigung aller drei Specs, nicht paketgenau.* Eine Handler-URL gilt
   als gültig, wenn sie in irgendeiner der drei `openapi.json` als Pfad vorkommt. Eine paketgenaue Zuordnung wäre für
   eine reine Existenz-Prüfung über-modelliert (heute zielen alle Handler auf die service-hub-API). Eine
   Normalisierung bringt MSW-`*`/`:id`, OpenAPI-`{id}`, Query und Schluss-Slash auf eine gemeinsame Form; ein
   Negativtest bestätigt, dass echte Pfade treffen und Tipp-/Fantasie-Pfade durchfallen.
2. *Das Spectral-Ruleset ist auf fremde, backend-generierte Specs zugeschnitten.* Die Doku-Hygiene-Regeln sind aus
   (das Backend besitzt die API-Dokumentation, nicht unser Riegel). `duplicated-entry-in-enum` ist aus, weil
   Spectral 6.16 sonst auf `ngx-api-bis` *abstürzt* (`Cannot read properties of null (reading 'enum')` — ein
   Werkzeug-Bug). Zwei `responses.200.description: null`-Stellen in bis sind echte, vom Backend ausgelieferte Defekte;
   sie sind über einen chirurgischen `overrides`-Eintrag (`**#/<pointer>` — Spectral matcht den aufgelösten
   **Backslash**-Pfad, weshalb `**/…` auf dem windows-latest-Agenten fehlschlägt, `**` aber greift) übersteuert. So
   ist der Riegel heute grün, fängt aber jeden NEUEN Strukturfehler. **Offen: die zwei null-Beschreibungen in bis ans
   Backend melden.**
3. *Signal 2 (`update-api`) ist kein PR-Riegel.* `npm update` verändert die Lockfile nicht-deterministisch — es ist
   der Wartungs-Refresh, nicht der Gate. Signal 1 (`tsc`) erzwingt in der CI schon der Prod-Build.

**Spike 4 (die hermetische Spur) — Fundament plus zwei Lauf-Befunde.** Neu sind `e2e-hermetic/` (eine eigene
Playwright-Config ohne den `check-backend`-globalSetup, die `network.fixture.ts` und ein grüner Proof-Spec) und
`e2e/auth-mock.providers.ts` (der `e2eAuthProviders(role)`-DI-Login-Fake). Zwei Dinge zeigten sich beim Laufen:
(a) Playwrights esbuild kennt keinen Angular-AOT-Linker, deshalb muss `import '@angular/compiler'` als allererster
Import die teil-kompilierten `@byk`-Deklarationen JIT-fähig machen — das gilt auch für Welle 6, weil @msw/playwright
die Handler in **Node** ausführt. (b) Ohne `Access-Control-Allow-Origin` in den Antworten würde ein cross-origin-Lesen
blockiert, also serviert der Proof ein gleich-origin Shell-Dokument. Der Umfang war bewusst „das Werkzeug und das
geteilte Fundament absichern"; der Proof-Spec läuft seit PR-6 per-PR in der CI (Chromium-Install + `e2e:hermetic`
nach `test:ci`) — das volle App-Journey-Wiring bleibt Welle 6.

#### 2026-06-29 — Die gemeinsame Mock-Schicht wird handgeschrieben statt generiert (betrifft Abschnitte 8 und 9)

**Die Entscheidung.** Wir bauen `src/mocks/` als **reine MSW-Schicht mit handgeschriebenen Handlern**. Diese Handler
lesen direkt die `FakeBackendDb` (Arbeitspaket #26765, PR-2, `src/app/testing/backend/`), die aus den geteilten
`fixtures/` geseedet wird. Wir setzen **weder** `@mswjs/source` (OpenAPI→Handler-Generierung) **noch** `@mswjs/data`
(schemabasierte Mock-Datenbank) ein. Der Contract-Riegel aus Abschnitt 9 stützt sich entsprechend auf **vier
Signale** (`tsc` gegen `satisfies`-DTOs · atomares `npm update @byk` · Spectral · ein Pfad-Abgleich) statt auf einen
„Handler neu generieren und den Diff prüfen"-Schritt.

**Der Kontext — was wir vorher annahmen.** Der ursprüngliche Plan und die ersten Fassungen von Abschnitt 8 und 9
sahen den Lehrbuch-Weg vor: die Handler mit `@mswjs/source`s `fromOpenApi()` aus der `openapi.json` generieren und
den Mock-Zustand mit `@mswjs/data` als kleine relationale In-Memory-Datenbank modellieren. Das ist die in der
MSW-Welt verbreitete Standard-Kombination und klang nach dem geringsten Wartungsaufwand.

**Die Recherche (2026-06-29, zweimal unabhängig im Netz verifiziert, mit harten Belegen aus npm-Registry-JSON und
der GitHub-API).** Beide Pakete sind auf npm als *deprecated* markiert — aber **nicht**, weil sie aufgegeben wurden,
sondern weil sie in den neuen `@msw/*`-Namensraum **umbenannt** wurden (die GitHub-Repos sind weiter aktiv, nicht
archiviert):
- `@mswjs/data` (0.16.2, eingefroren am 2024-09-09) → Nachfolger `@msw/data` 1.1.6 (2026-05-15). Das ist ein
  **Breaking Rewrite** auf Standard-Schema/Zod — **kein** einfacher Austausch.
- `@mswjs/source` (0.5.0) → Nachfolger `@msw/source` 0.6.1 (2026-02-03), weiterhin OpenAPI→Handler, mit Peer
  `msw ^2.10`.

**Warum wir trotzdem handschreiben.** Vier Gründe, in der Reihenfolge ihres Gewichts:
1. **Der Vertragsschutz ist schon da.** Unser `@byk`-Client ist getippt, und unsere `fixtures/` sind mit
   `satisfies <DTO>` gegen genau diese generierten Typen geprüft. `@msw/source` würde einen Schutz dazustellen, den
   wir über `tsc` bereits haben — doppelte Arbeit.
2. **Generierte Bodies sind nicht-deterministisch.** Codegen füllt die Antworten mit `faker`-/Beispieldaten. Für
   *Assertion*-Tests (wir prüfen konkrete Werte) ist das ein Anti-Pattern: Man überschreibt die Bodies ohnehin, und
   sie kollidieren mit unseren festen Fixtures, die ja gerade die eine Daten-Wahrheit sein sollen.
3. **Die Endpunktfläche ist klein.** Es sind nur ~15–20 tatsächlich genutzte Endpunkte. Handschreiben ist damit ein
   einmaliger, überschaubarer Aufwand; Generierung wäre laufende Wartung plus committeter Generat plus
   `faker`-Diff-Rauschen bei jedem Lauf.
4. **Es gibt keinen eindeutigen Community-Konsens *für unseren Fall*.** MSW empfiehlt Codegen für *Dev-Mocking*; für
   **deterministische Assertion-Tests** (genau unser Fall) favorisieren der MSW-Autor selbst und Werkzeuge wie
   `openapi-msw` ausdrücklich **handgeschriebene, typisierte** Handler.

**Was wir abgesichert haben (Spike 2, 2026-06-29 verifiziert).** `msw@2.14.6`s `setupServer` fängt den
Angular-22-`fetch`-Transport (seit dem v22-Umstieg ist `FetchBackend` der Default; `withXhr()` wäre der Opt-out) in
jsdom 28 ab. Der volle Fluss — Liste, `count`, `info`, `status` — läuft durch den echten Fleet-`InstrumentStore`
grün, ganz **ohne** `HttpTestingController`. Damit ist die zentrale Unbekannte der L2-Schicht ausgeräumt.

**Bewusst offen gelassen (nicht Welle 0).** Sollte sich die Compile-Zeit-Typisierung der Pfade/Parameter später
lohnen, ist `openapi-msw` der natürliche Kandidat (gewartet, MSW-v2-nativ, rein typseitig) — es braucht allerdings
einen `openapi-typescript`-`paths`-Typ, den der Angular-Client nicht mitliefert (also einen zusätzlichen
Codegen-Schritt); die Body-Typsicherheit deckt `satisfies <DTO>` ohnehin schon ab. Und falls die Endpunktfläche je
groß und relational wird, ist `@msw/data` v1 (gewartet) die bewusste Migration — als gezielter Schritt, nicht als
Fundament.

---

> **Verweise:** [`Testing-Spec.md`](./Testing-Spec.md) (die kompakte Referenzfassung), `docs/Architecture.md`
> (Stack & Ordnerstruktur), `docs/UX-Design-Guideline.md` (Barrierefreiheits-Pflicht), die bestehenden
> Vorlage-Tests (`instrument-detail.store.spec.ts`, `instrument-overview.store.http-binding.spec.ts`,
> `instrument-card.spec.ts`, `property-grid.spec.ts`) sowie `e2e/TEST-PLAN.md` (die reale e2e-Feature-Liste).
