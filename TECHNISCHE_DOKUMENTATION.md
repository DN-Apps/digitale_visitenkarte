# Technische Dokumentation – Digitale Visitenkarte

## Technologie-Stack

| Schicht | Technologie | Version |
|---|---|---|
| Framework | Next.js (App Router) | ^15.3.2 |
| Sprache | TypeScript | ^5.6.3 |
| UI-Bibliothek | React | 18.3.1 |
| Theme | next-themes | ^0.3.0 |
| QR-Code | qrcode.react | ^4.2.0 |
| JWT-Signing | jsonwebtoken | ^9.0.3 |
| Linting | ESLint + eslint-config-next | ^15.3.2 |

---

## Projektstruktur

```
app/
  layout.tsx              – Root-Layout, Metadata, DEMONSTRATION-Wasserzeichen
  page.tsx                – Haupt-Seite (Client Component), gesamter App-State
  providers.tsx           – ThemeProvider (next-themes)
  globals.css             – CSS-Variablen, Layout-Klassen, Dark Mode
  api/
    google-wallet/
      route.ts            – POST-Route: JWT erzeugen und Google Wallet URL zurückgeben

components/
  business-card-form.tsx  – Eingabeformular mit Validierung und Dropdown-Feldern
  business-card-preview.tsx – Visuelle Vorschau der Visitenkarte nach dem Generieren
  google-wallet-button.tsx  – Button zum Speichern in Google Wallet (inkl. Ladezustand)
  qr-card.tsx             – QR-Code-Darstellung (vCard-Inhalt)
  imprint-modal.tsx       – Impressum als Modal
  privacy-modal.tsx       – Datenschutzhinweis-Modal (einmalig, per localStorage)
  language-switcher.tsx   – DE/EN Umschalter
  theme-toggle.tsx        – Light/Dark Mode Toggle

lib/
  types.ts                – Zentrale TypeScript-Typen (BusinessCardFormData, Company, Address, SupportedLocale)
  i18n.ts                 – Dictionary-Loader (getDictionary)
  companies.ts            – Laden der lokalen Firmendaten aus companies.json
  business-card-utils.ts  – Zentrale Sanitization- und Formatierungsfunktionen
  vcard.ts                – vCard-Aufbau (RFC 6350) und Download-Trigger
  use-form-validation.ts  – React Hook für Formularvalidierung inkl. Fehlerzustände

data/
  companies.json          – Statische Firmenliste mit vollständigen Adressen

messages/
  de.json                 – Alle UI-Texte auf Deutsch
  en.json                 – Alle UI-Texte auf Englisch
```

---

## Architektur-Entscheidungen

### Client-seitig (kein Server-Rendering für Formulardaten)
- Die gesamte Formularlogik und der App-State laufen als Client Component (`"use client"`).
- Alle Formulardaten werden ausschließlich im Browser (localStorage) gespeichert – kein Backend-Datenbankzugriff.
- `output: "export"` wurde entfernt, da API Routes einen Server erfordern.

### Server-seitig (API Route)
- Nur `app/api/google-wallet/route.ts` läuft serverseitig.
- Der Google Wallet Private Key verlässt nie den Server.
- JWT-Signing erfolgt mit RS256 via `jsonwebtoken`.

### i18n
- Zwei JSON-Dictionaries (`de.json`, `en.json`).
- `getDictionary(locale)` gibt das passende Objekt zurück.
- Alle UI-Texte sind über `DictionaryKey` typisiert.

### Firmendaten
- Statische Grunddaten aus `data/companies.json`.
- Zur Laufzeit wird die Overpass API (OpenStreetMap) abgefragt, um umliegende Büro-Einträge zu ergänzen.
- API-Firmen ohne vollständige Adressdaten werden in der Vorschau mit einem Hinweis markiert.

---

## Sanitization-Konzept

Alle Eingaben laufen durch `lib/business-card-utils.ts`:

| Funktion | Zweck |
|---|---|
| `sanitizeText(value, maxLength)` | Entfernt Steuerzeichen, normalisiert Leerzeichen, kürzt auf maxLength |
| `sanitizeEmail(value)` | Normalisiert auf Lowercase, entfernt Whitespace, max. 254 Zeichen (RFC 5321) |
| `sanitizePhone(value)` | Erlaubt nur `0-9 + ( ) - / Leerzeichen`, max. 40 Zeichen |
| `sanitizeFormField(field, value)` | Wendet je nach Feld die passende Funktion an |
| `sanitizeFormData(data, locale, options)` | Sanitized alle Felder; optional Uppercase für Namen |
| `sanitizeCompanyName(value)` | Alias für `sanitizeText(value, 120)` |
| `formatCompanyAddress(company)` | Baut Adress-String aus Firmenobjekt, gibt `""` bei fehlenden Daten zurück |

Sanitization wird angewendet bei:
1. Jeder Feldänderung im Formular (`onChange`)
2. Beim Generieren (`handleGenerate`)
3. Beim vCard-Build (`buildVCard`)
4. In der Google Wallet API Route (serverseitig)

---

## Google Wallet Integration

### Voraussetzungen
- Google Cloud Projekt mit aktivierter Google Wallet API
- Service Account mit JSON-Schlüssel (Private Key)
- Issuer-ID aus der Google Pay & Wallet Business Console

### Umgebungsvariablen (`.env.local`)
```
GOOGLE_WALLET_ISSUER_ID=          # Numerische Issuer ID (z.B. 3388000000023127238)
GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL=   # Service Account E-Mail
GOOGLE_WALLET_PRIVATE_KEY=        # PEM-Schlüssel, \n als Literal
```

### Ablauf
1. Frontend sendet `POST /api/google-wallet` mit sanitizierten Visitenkartendaten.
2. API Route sanitiziert nochmals serverseitig (Defense in Depth).
3. JWT-Payload wird mit dem Private Key (RS256) signiert.
4. Rückgabe: `{ url: "https://pay.google.com/gp/v/save/<token>" }`.
5. Browser öffnet die URL in einem neuen Tab → Google Wallet Dialog.

### Objekt-ID-Strategie
- Stabile ID aus `base64(email + companyName)` → gleiche Person/Firma aktualisiert bestehenden Pass.

### Demo-Modus
- Im Demo-Modus können nur Testkonten Passes speichern (in Wallet Console einzurichten).

---

## Formularvalidierung

Validiert werden (client-seitig, `use-form-validation.ts`):
- `vorname` – Pflichtfeld
- `nachname` – Pflichtfeld
- `wunschposition` – Pflichtfeld
- `email` – Pflichtfeld + Format-Regex
- `firmaId` – Pflichtfeld (Dropdown-Auswahl)

Fehler werden pro Feld angezeigt und beim nächsten Tippen im jeweiligen Feld gelöscht.

---

## vCard-Format

- Standard: vCard 3.0 (RFC 2426)
- Felder: `N`, `FN`, `ORG`, `TITLE`, `TEL` (WORK + CELL), `EMAIL`, `ADR`, `REV`, `NOTE`
- Sonderzeichen werden via `escapeVCardValue` maskiert (`,` → `\,`, `;` → `\;`)
- Download als `.vcf`-Datei via Blob + dynamischem Anchor

---

## Lokalisierung der Dropdown-Felder

**Position (DE):** Sachbearbeiter/in, Junior Professional, Professional, Senior Professional, Abteilungsleiter, Bereichsleiter, Geschaeftsfuehrer

**Position (EN):** Clerk, Junior Professional, Professional, Senior Professional, Department Head, Division Head, Managing Director

**Abteilung (DE):** Einkauf, Verkauf, Facility Management, Controlling, IT, Marketing, Personal

**Abteilung (EN):** Procurement, Sales, Facility Management, Controlling, IT, Marketing, HR

---

## Lokale Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# .env.local anlegen (Vorlage: .env.local.example)

# Entwicklungsserver starten
npm run dev     # http://localhost:3000

# Produktions-Build
npm run build
npm run start
```

---

## Sicherheitshinweise

- `.env.local` darf **nie** ins Git-Repository eingecheckt werden.
- Der Private Key muss serverseitig bleiben – keine Client-Bundle-Exposition.
- `npm audit fix --force` **nicht** ausführen: würde Next.js auf v9 downgraden (Breaking Change).
- Die verbleibende `postcss`-Warnung ist eine transitive Abhängigkeit von Next.js und nicht separat behebbar.
