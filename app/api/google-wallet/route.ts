import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sanitizeCompanyName, sanitizeEmail, sanitizePhone, sanitizeText } from "@/lib/business-card-utils";

// Konfiguration aus Umgebungsvariablen – darf nie client-seitig exponiert werden.
const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID ?? "";
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL ?? "";
// Zeilenumbrüche im PEM-Schlüssel werden aus der ENV-Variable wiederhergestellt.
const PRIVATE_KEY = (process.env.GOOGLE_WALLET_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

interface WalletRequestBody {
  vorname: string;
  nachname: string;
  wunschposition: string;
  abteilung: string;
  telefonnummer: string;
  mobilnummer: string;
  email: string;
  companyName?: string;
  companyAddress?: string;
}

// Fügt ein Textmodul nur hinzu, wenn der Wert nicht leer ist (leere Felder werden in Wallet nicht angezeigt).
function addTextModule(
  modules: { header: string; body: string; id: string }[],
  id: string,
  header: string,
  value: string
) {
  if (!value) {
    return;
  }

  modules.push({ header, body: value, id });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!ISSUER_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    return NextResponse.json(
      { error: "Google Wallet ist nicht konfiguriert. Bitte Umgebungsvariablen setzen." },
      { status: 503 }
    );
  }

  let body: WalletRequestBody;
  try {
    body = (await request.json()) as WalletRequestBody;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const {
    vorname,
    nachname,
    wunschposition,
    abteilung,
    telefonnummer,
    mobilnummer,
    email,
    companyName,
    companyAddress,
  } = body;

  const normalizedFirstName = sanitizeText(vorname, 80).toLocaleUpperCase("de-DE");
  const normalizedLastName = sanitizeText(nachname, 80).toLocaleUpperCase("de-DE");
  const normalizedPosition = sanitizeText(wunschposition, 80);
  const normalizedDepartment = sanitizeText(abteilung, 80);
  const normalizedPhone = sanitizePhone(telefonnummer);
  const normalizedMobile = sanitizePhone(mobilnummer);
  const normalizedEmail = sanitizeEmail(email);
  const normalizedCompanyName = sanitizeCompanyName(companyName ?? "");
  const normalizedCompanyAddress = sanitizeText(companyAddress ?? "", 160);

  const fullName = `${normalizedFirstName} ${normalizedLastName}`.trim();
  if (!fullName || fullName === " ") {
    return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });
  }

  // Stabile Objekt-ID aus E-Mail + Firma – dieselbe ID aktualisiert den bestehenden Pass in der Wallet.
  const objectSuffix = Buffer.from(`${normalizedEmail}-${normalizedCompanyName}`)
    .toString("base64")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 64);

  const classId = `${ISSUER_ID}.business_card_class`;
  const objectId = `${ISSUER_ID}.${objectSuffix || "business-card"}`;

  const textModules: { header: string; body: string; id: string }[] = [];
  addTextModule(textModules, "email", "E-Mail", normalizedEmail);
  addTextModule(textModules, "phone", "Telefon", normalizedPhone);
  addTextModule(textModules, "mobile", "Mobil", normalizedMobile);
  addTextModule(textModules, "department", "Abteilung", normalizedDepartment);
  addTextModule(textModules, "address", "Adresse", normalizedCompanyAddress);

  const genericClass = {
    id: classId,
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            twoItems: {
              startItem: {
                firstValue: { fields: [{ fieldPath: "object.textModulesData['email']" }] },
              },
              endItem: {
                firstValue: { fields: [{ fieldPath: "object.textModulesData['phone']" }] },
              },
            },
          },
        ],
      },
    },
  };

  const genericObject = {
    id: objectId,
    classId,
    cardTitle: {
      defaultValue: {
        language: "de-DE",
        value: normalizedCompanyName || "Visitenkarte",
      },
    },
    subheader: {
      defaultValue: {
        language: "de-DE",
        value: normalizedPosition || "Mitarbeiter",
      },
    },
    header: {
      defaultValue: {
        language: "de-DE",
        value: fullName,
      },
    },
    textModulesData: textModules,
    state: "ACTIVE",
  };

  const payload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    payload: {
      genericClasses: [genericClass],
      genericObjects: [genericObject],
    },
  };

  // JWT wird serverseitig mit RS256 signiert – Private Key verlässt nie den Server.
  let token: string;
  try {
    token = jwt.sign(payload, PRIVATE_KEY, { algorithm: "RS256" });
  } catch {
    return NextResponse.json(
      { error: "JWT-Signierung fehlgeschlagen. Private Key prüfen." },
      { status: 500 }
    );
  }

  // Der signierte Token wird direkt als URL-Parameter an Google Wallet übergeben.
  const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
  return NextResponse.json({ url: saveUrl });
}
