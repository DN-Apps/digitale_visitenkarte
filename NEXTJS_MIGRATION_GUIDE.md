# Migrationsanleitung: Digitale Visitenkarte auf Next.js Static Export

## 1. Kurzbewertung des aktuellen Stands

Die bestehende Anwendung funktioniert als React-Einzelanwendung, trägt aber mehrere typische Altlasten einer älteren Frontend-Struktur:

- Das Frontend basiert auf Create React App mit `react-scripts`. Diese Basis ist heute technisch veraltet und unflexibler als ein modernes Next.js-Setup.
- Sehr viel Logik, UI und Styling liegen gebuendelt in `src/App.js`.
- Komponenten wie Datenschutz-Popup, Impressum, Footer und Kartenansicht sind lokal in derselben Datei definiert statt sauber getrennt.
- Styling erfolgt fast vollstaendig per Inline-Styles. Das erschwert Wiederverwendung, Theming, Dark/Light Mode und Wartung.
- Es gibt keine TypeScript-Typisierung. Formularstruktur, Props und Datenobjekte sind daher nicht abgesichert.
- Das Backend liegt doppelt vor (`dgv-backend/index.js` und `dgv-backend/server.js`) und zeigt inkonsistente API-Definitionen sowie unterschiedliche Ports.
- `src/services/api.js` ist vorhanden, wird aber aktuell offenbar nicht verwendet.
- Die eigentliche Kernfunktion der App ist bereits stark clientseitig: Formulareingabe, Vorschau, QR-Code und vCard-Generierung laufen lokal im Browser.

## 2. Konkrete technische Auffaelligkeiten

### Frontend

- `dgv-frontend/package.json` nutzt `react-scripts` und damit CRA statt eines aktuellen App-Frameworks.
- `src/App.js` ist ein Monolith: Zustand, API-Call, Popup-Logik, Formular, Vorschau und Styles sind gekoppelt.
- Der Firmenabruf erfolgt direkt im Browser gegen die Overpass-API. Das ist fuer eine Demo brauchbar, aber fuer eine robuste statische Seite fragil.
- `window.innerWidth` wird direkt im Render verwendet. In Next.js muss Browser-API-Zugriff sauber in Client Components oder Effekte eingegrenzt werden.
- Die Sprachumschaltung mit `i18next` ist nutzbar, aber nicht auf eine Next.js-typische Routing- oder Dictionary-Struktur vorbereitet.

### Backend

- `dgv-backend/index.js` und `dgv-backend/server.js` duplizieren Verantwortlichkeiten.
- Ports und Routen sind uneinheitlich:
  - einmal `5000`, einmal `5003`
  - einmal `POST /api/daten`, einmal `POST /api/speichern`
- In `server.js` steht ein Datenbankpasswort hart im Code. Das muss unabhängig von der Migration entfernt werden.
- Fuer die Zielanwendung "digitale Visitenkarte als statische Site" ist ein dauerhaftes Express/MySQL-Backend sehr wahrscheinlich ueberdimensioniert.

## 3. Zielbild

Die Anwendung soll zu einer kleinen, schnellen und wartungsarmen digitalen Visitenkarte werden.

Empfohlenes Ziel:

- **Next.js** fuer Static Site Generation und Export als statische Website
- **React** fuer interaktive und animierte UI-Komponenten
- **TypeScript** mit strikten Typen fuer Formdaten, Firmenobjekte und Props
- **Node.js** nur optional, falls spaeter ein Kontaktformular oder Admin-Endpunkt wirklich noetig wird

Das passt sehr gut zum aktuellen Produkt, weil der Hauptnutzen bereits ohne dauerhaftes Backend funktioniert.

## 4. Warum Next.js Static Export hier sinnvoll ist

Fuer diese App ist Next.js mit statischem Export die passende Zielarchitektur:

- sehr schnelle Ladezeiten
- einfaches Deployment auf statischem Hosting
- kein dauerhafter Server fuer die Kernfunktion noetig
- klare Trennung zwischen statischen und interaktiven Bereichen
- bessere Projektstruktur als CRA

Wichtig: Wenn eine Seite **vollstaendig statisch** ausgeliefert werden soll, darf geschäftskritische Laufzeitlogik nicht von einem Pflicht-Backend abhaengen.

## 5. Empfohlene Zielarchitektur

### Minimales Architekturmodell

- `Next.js App Router`
- `output: 'export'` fuer statischen Export
- `TypeScript`
- `CSS Modules` oder `Tailwind CSS` fuer sauberes Theming
- `next-themes` fuer Dark/Light Mode
- `framer-motion` fuer dezente Animationen
- lokale JSON-Daten oder Build-Time-Daten fuer Firmenliste

### Sinnvolle Verzeichnisstruktur

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  business-card-form.tsx
  business-card-preview.tsx
  language-switcher.tsx
  privacy-modal.tsx
  imprint-modal.tsx
  theme-toggle.tsx
lib/
  vcard.ts
  companies.ts
  types.ts
messages/
  de.json
  en.json
public/
  ...
```

## 6. Was aus dem aktuellen Projekt uebernommen werden kann

Diese Teile koennen in die neue Architektur ueberfuehrt werden:

- Formularfelder und fachliche Struktur der Visitenkarte
- QR-Code-Generierung
- vCard-Erstellung
- Mehrsprachigkeit Deutsch/Englisch
- Datenschutz- und Impressumsinhalte

Diese Teile sollten neu aufgebaut werden:

- Projektbasis von CRA auf Next.js
- Komponentenstruktur
- Styling-System
- Typmodell mit TypeScript
- Datenfluss fuer Firmenliste

## 7. Migrationsstrategie in Phasen

## Phase 1: Bestehendes Verhalten fachlich zuschneiden

Zuerst sollte geklaert werden, was die App im Ziel wirklich leisten muss.

Fuer eine "klein aber fein" digitale Visitenkarte ist der schlanke Scope:

- Formular fuer Name, Position, Kontakt
- Firmenauswahl
- Vorschau der digitalen Visitenkarte
- QR-Code fuer Download oder Scan
- Dark/Light Mode
- Animationen fuer Dialoge, Kartenaufbau und Zustandswechsel

Nicht als Pflichtbestandteil behandeln:

- MySQL-Datenbank
- Express-Backend
- serverseitige Speicherung

## Phase 2: Neues Projekt aufsetzen

Ein neues Frontend-Projekt sollte separat angelegt werden, statt CRA direkt umzubauen.

Empfohlen:

```bash
npx create-next-app@latest dgv-next --ts --app
```

Danach konfigurieren:

- `next.config.ts` mit statischem Export
- ESLint und TypeScript strict mode aktiv lassen
- optional Tailwind oder CSS Modules einrichten

Beispiel fuer die Export-Konfiguration:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
};

export default nextConfig;
```

## Phase 3: Typen modellieren

Bevor Komponenten gebaut werden, sollten die Datenstrukturen sauber definiert werden.

Empfohlene Typen:

```ts
export type Address = {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
};

export type Company = {
  id: string;
  name: string;
  address: Address;
};

export type BusinessCardFormData = {
  firstName: string;
  lastName: string;
  desiredPosition: string;
  department: string;
  phone: string;
  mobile: string;
  email: string;
  companyId: string;
};
```

Nutzen:

- klare Props
- weniger Laufzeitfehler
- bessere Trennung zwischen UI und Datenlogik

## Phase 4: Monolith aus `App.js` zerlegen

Die heutige `App.js` sollte nicht portiert, sondern zerlegt werden.

Sinnvolle Komponenten:

- `BusinessCardForm`
- `BusinessCardPreview`
- `PrivacyModal`
- `ImprintModal`
- `LanguageSwitcher`
- `ThemeToggle`
- `QrCard`

Zusaetzlich zwei reine Hilfsbereiche:

- `lib/vcard.ts` fuer die vCard-Erzeugung
- `lib/companies.ts` fuer Firmen-Datenzugriff

Ziel: Komponenten sollen entweder darstellen oder steuern, aber nicht alles gleichzeitig tun.

## Phase 5: Firmenliste fuer Static Export passend machen

Hier liegt die wichtigste Architekturentscheidung.

### Option A: Empfohlen

Die Firmenliste wird als lokale Datei gepflegt, zum Beispiel `data/companies.json`.

Vorteile:

- kompatibel mit statischem Export
- keine Abhaengigkeit von externer API zur Laufzeit
- planbares Verhalten beim Build und im Produktivbetrieb

### Option B: Build-Time-Import

Die Firmenliste wird waehrend des Builds von einer Quelle geladen und statisch eingebettet.

Vorteile:

- weiterhin automatisierbar
- keine Pflicht zu Laufzeit-Fetches im Browser

Risiko:

- Build kann scheitern, wenn die externe Quelle instabil ist

### Option C: Client-Side-Fetch

Die Firmenliste wird weiterhin im Browser geladen.

Das ist technisch moeglich, aber fuer dein Ziel nur zweite Wahl, weil dadurch der statische Charakter der Seite abgeschwaecht wird.

## Phase 6: Dark/Light Mode einbauen

Der aktuelle Inline-Style-Ansatz ist dafuer unguenstig. Besser ist ein variables Theming ueber CSS Custom Properties.

Beispielansatz:

- globale Tokens in `globals.css`
- Theme-Umschaltung per `class="dark"` oder `data-theme`
- Speicherung der Auswahl in `localStorage`
- in Next.js vorzugsweise mit `next-themes`

Empfohlene Designregeln:

- Hintergrund, Card, Text, Border und Akzentfarbe als Variablen definieren
- keine festen Farben direkt in Komponenten
- Modal-, Button- und Formularfarben immer aus Tokens beziehen

## Phase 7: Animationen gezielt ergaenzen

Hier reicht wenig, aber sauber eingesetzt:

- sanftes Einblenden der Form oder Karte
- animierter Wechsel zwischen Formular und Vorschau
- weiches Oeffnen und Schliessen der Modal-Dialoge

Empfohlene Bibliothek:

```bash
npm install framer-motion
```

Wichtig: Animationen sollen den Produktcharakter aufwerten, nicht die App verlangsamen.

## Phase 8: i18n fuer Next.js neu organisieren

Die heutigen `translation.json`-Dateien koennen uebernommen werden.

Aber statt der aktuellen losen Initialisierung in `src/i18n.js` sollte die Sprachlogik sauber in die neue Struktur integriert werden.

Zwei moegliche Wege:

- einfacher Ansatz mit lokal geladenen Dictionaries
- spaeter vollwertige Next.js-i18n-Struktur mit sprachbasierten Routen

Fuer dieses Projekt reicht zunaechst meist:

- Sprachstatus im Client
- Dictionaries in `messages/de.json` und `messages/en.json`
- kleine Uebersetzungs-Helfer statt globaler Alt-Konfiguration

## Phase 9: Backend radikal vereinfachen

Die wichtigste Empfehlung lautet: Das vorhandene Express/MySQL-Backend nicht automatisch mitnehmen.

Begruendung:

- Die Kernfunktion der App benoetigt aktuell keinen persistenten Server.
- Ein statisches Frontend ist billiger, stabiler und einfacher deploybar.
- Das bestehende Backend ist inkonsistent und bringt Wartungsaufwand ohne klaren Produktnutzen.

### Wann Node.js trotzdem sinnvoll ist

Node.js ist nur dann sinnvoll, wenn eine echte Serverfunktion benoetigt wird, zum Beispiel:

- Kontaktformular mit Mailversand
- Admin-Funktion zum Pflegen von Firmen
- Rate Limiting oder Spam-Schutz

Dann gibt es zwei saubere Wege:

### Weg 1: Next.js API Route

Sinnvoll, wenn **kein** statischer Export zwingend ist oder spaeter auf normales Next.js-Hosting gewechselt wird.

### Weg 2: Externer Minimal-Service

Wenn die Website statisch exportiert bleiben soll, aber ein Formular noetig ist:

- statische Next.js-Site deployen
- kleines getrenntes Backend oder Serverless Function nur fuer das Formular nutzen

Fuer dein Ziel ist Weg 2 meist sauberer als das alte Express-Backend fortzufuehren.

## 8. Empfohlene Zielentscheidung fuer dieses Projekt

Fuer diese digitale Visitenkarte ist die beste Zielkombination:

- **Next.js mit Static Export** als Hauptplattform
- **TypeScript strict** fuer Datenmodelle und Props
- **React-Komponenten** fuer Formular, Vorschau, Modals und Theme
- **kein permanentes Backend** im ersten Schritt
- **optional spaeter** ein sehr kleiner externer Endpoint fuer Kontaktformular oder Admin-Funktionen

## 9. Praktische Umsetzungsreihenfolge

1. Neues Next.js-TypeScript-Projekt anlegen.
2. Design-Tokens und Grundlayout mit Dark/Light Mode aufsetzen.
3. Datentypen definieren.
4. Bestehende Visitenkartenlogik in kleine Komponenten zerlegen.
5. vCard-Generator als Utility auslagern.
6. Firmenliste auf lokale Daten oder Build-Time-Daten umstellen.
7. Sprachdateien uebernehmen und in das neue App-Schema integrieren.
8. QR-Code und Kartenvorschau migrieren.
9. Animationen gezielt ergaenzen.
10. Altes CRA-Frontend und das doppelte Express-Backend erst danach ausmustern.

## 10. Was du bewusst nicht 1:1 uebernehmen solltest

- den kompletten Inhalt von `App.js`
- Inline-Styles als Haupt-Stylingstrategie
- das aktuelle doppelte Backend
- die direkte Datenbankkopplung ohne echten Produktbedarf
- hart kodierte Zugangsdaten

## 11. Ergebnis nach der Migration

Wenn die Migration sauber umgesetzt wird, erhaeltst du:

- eine schnelle statische Web-App
- eine wartbare Komponentenstruktur
- Dark/Light Mode ohne Stilbruch
- sauber typisierte Datenmodelle
- eine solide Basis fuer spaetere Erweiterungen
- deutlich weniger Betriebsaufwand als mit CRA plus Express plus MySQL

## 12. Klare Empfehlung

Die Anwendung sollte **nicht modernisiert werden, indem das alte Projekt schrittweise verbogen wird**. Der bessere Weg ist ein sauberer Neuaufbau mit Next.js und TypeScript, bei dem nur die fachliche Logik und Inhalte aus dem Altprojekt uebernommen werden.

Genau fuer eine kleine digitale Visitenkarte ist das der technisch sauberste und langfristig guenstigste Weg.