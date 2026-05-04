# Projektdokumentation – Digitale Visitenkarte
### Für Projektleitung und nicht-technische Stakeholder

---

## Was ist die Digitale Visitenkarte?

Die Digitale Visitenkarte ist eine browserbasierte Web-Applikation, mit der Mitarbeitende einer Organisation schnell und einfach eine persönliche Visitenkarte erstellen können – ohne Installation, ohne Account, ohne Datenweitergabe an externe Server.

Die Anwendung läuft vollständig im Browser und speichert alle eingegebenen Daten ausschließlich lokal auf dem Gerät des Nutzers.

---

## Funktionsumfang

### Kerffunktionen
- **Visitenkarte erstellen:** Eingabe von Vorname, Nachname, Position, Abteilung, Telefon, Mobil, E-Mail sowie Firmenauswahl aus einem Dropdown
- **Vorschau:** Sofortige visuelle Darstellung der Visitenkarte nach dem Generieren
- **vCard-Download:** Exportiert die Visitenkarte als `.vcf`-Datei, die direkt in Kontakte-Apps (iOS, Android, Outlook) importiert werden kann
- **QR-Code:** Zeigt die Visitenkartendaten als scanbareres QR-Code an – für schnelles Austauschen mit Kamera-App

### Erweiterte Funktionen
- **Google Wallet:** Ermöglicht das Speichern der Visitenkarte direkt in Google Wallet auf Android-Geräten
- **Mehrsprachigkeit:** Die Oberfläche ist auf Deutsch und Englisch verfügbar, umschaltbar per Knopfdruck
- **Dark Mode:** Automatische Anpassung ans System-Theme oder manuelle Umschaltung
- **Firmenauswahl:** Lokale Firmenliste wird automatisch um regionale Unternehmen aus OpenStreetMap ergänzt

---

## Benutzerführung

1. Formular ausfüllen (Pflichtfelder: Vorname, Nachname, Position, E-Mail, Firma)
2. Auf **„Generieren"** klicken
3. Vorschau prüfen
4. Gewünschte Ausgabe wählen:
   - **vCard herunterladen** → Datei für Kontakte-App
   - **In Google Wallet speichern** → digitaler Pass auf Android
   - **QR-Code** → direkt mit Kamera scannen lassen

---

## Datenschutz & Datensicherheit

- Es werden **keine Nutzerdaten an Server übertragen oder gespeichert** (außer beim Aufruf der Google Wallet Funktion – hierbei wird nur ein anonymisierter, verschlüsselter Token übermittelt)
- Alle Formulardaten verbleiben ausschließlich im Browser des Nutzers (localStorage)
- Die Anwendung verwendet **keine Cookies**
- Beim ersten Aufruf erscheint ein Datenschutzhinweis, der aktiv bestätigt werden muss
- Ein Impressum ist jederzeit über einen Button erreichbar

---

## Google Wallet – Einmalige Einrichtung (Projektleitung)

Für die Google Wallet Funktion wurde einmalig folgendes eingerichtet:

| Schritt | Status | Bemerkung |
|---|---|---|
| Google Cloud Projekt | ✅ Erledigt | Projekt: `algebraic-spot-495309-k8` |
| Google Wallet API aktiviert | ✅ Erledigt | |
| Service Account erstellt | ✅ Erledigt | `dgv-wallet@algebraic-spot-495309-k8.iam.gserviceaccount.com` |
| Wallet Business Console | ✅ Erledigt | Aussteller-ID: `3388000000023127238` |
| Nutzerberechtigung in Wallet Console | ✅ Erledigt | Service Account als Entwickler hinzugefügt |

> **Hinweis:** Aktuell befindet sich der Google Wallet Account im **Demo-Modus**. Pässe können nur von vorab eingetragenen Testkonten gespeichert werden. Für den produktiven Einsatz muss in der Google Pay & Wallet Business Console der Veröffentlichungszugriff beantragt werden (kostenlos, Formular bei Google).

---

## Betrieb & Hosting

- Die Anwendung ist eine **Next.js Web-App** und kann auf jedem modernen Hosting-Dienst betrieben werden
- Empfehlung: **Vercel** (kostenloser Free Tier ausreichend für diese Anwendung)
- Für die Google Wallet Funktion wird ein Server benötigt (kein reines statisches Hosting)
- Die benötigten Zugangsdaten (Google-Schlüssel) müssen einmalig als Umgebungsvariablen im Hosting hinterlegt werden

---

## Wartung & laufende Kosten

| Posten | Kosten |
|---|---|
| Google Wallet API | Kostenlos |
| Google Cloud (Service Account) | Kostenlos |
| Hosting (Vercel Free Tier) | Kostenlos |
| Domain (optional, eigene) | Je nach Anbieter |

---

## Bekannte Einschränkungen

- **Google Wallet** funktioniert nur auf Android-Geräten und im Chrome-Browser (iOS unterstützt nur Apple Wallet)
- **Firmen ohne Adresse:** Einige Firmen aus der automatischen OpenStreetMap-Ergänzung haben keine vollständigen Adressdaten hinterlegt – die App zeigt in diesem Fall einen deutlichen Hinweis an
- **Demo-Wasserzeichen:** Die Vorschaukarte trägt den Hinweis „DEMONSTRATION", da es sich um eine Demo-Anwendung handelt
- Die Anwendung wurde **nicht** für den Echtbetrieb mit echten Unternehmensdaten freigegeben – dafür sind Anpassungen am Impressum und ggf. eine Datenschutzprüfung erforderlich

---

## Projektstatus

| Bereich | Status |
|---|---|
| Grundfunktionen (Formular, Vorschau, vCard, QR) | ✅ Fertig |
| Mehrsprachigkeit (DE/EN) | ✅ Fertig |
| Google Wallet Integration | ✅ Fertig (Demo-Modus) |
| Sanitization & Sicherheit | ✅ Fertig |
| Datenschutz & Impressum | ✅ Fertig |
| Apple Wallet Integration | ⏳ Nicht umgesetzt (erfordert Apple Developer Account, ~99 USD/Jahr) |
| Produktiver Veröffentlichungszugriff Google Wallet | ⏳ Antrag bei Google ausstehend |
