import type { BusinessCardFormData, Company, SupportedLocale } from "./types";

// Entfernt Steuerzeichen (z.B. Null-Bytes, Zeilenumbrüche) aus Eingaben.
const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;

// Bereinigt allgemeinen Text: entfernt Steuerzeichen, normalisiert Leerzeichen, kürzt auf maxLength.
export function sanitizeText(value: string, maxLength = 120): string {
  return value
    .replace(CONTROL_CHARS_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

// Bereinigt E-Mail-Adressen: entfernt Leerzeichen, normalisiert auf Kleinschreibung, max. 254 Zeichen (RFC 5321).
export function sanitizeEmail(value: string): string {
  return value
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase()
    .slice(0, 254);
}

// Erlaubt nur gültige Telefon-Zeichen: Ziffern, +, (), -, Leerzeichen, /.
export function sanitizePhone(value: string): string {
  return value
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(/[^0-9+()\-\s/]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

// Wendet die passende Sanitization je nach Feldtyp an.
export function sanitizeFormField(field: keyof BusinessCardFormData, value: string): string {
  switch (field) {
    case "vorname":
    case "nachname":
      return sanitizeText(value, 80);
    case "wunschposition":
    case "abteilung":
      return sanitizeText(value, 80);
    case "telefonnummer":
    case "mobilnummer":
      return sanitizePhone(value);
    case "email":
      return sanitizeEmail(value);
    case "firmaId":
      return sanitizeText(value, 80);
    default:
      return sanitizeText(value);
  }
}

// Bereinigt alle Felder des Formulars; optional werden Vor- und Nachname großgeschrieben.
export function sanitizeFormData(
  data: BusinessCardFormData,
  locale: SupportedLocale,
  options?: { uppercaseNames?: boolean }
): BusinessCardFormData {
  const sanitized: BusinessCardFormData = {
    vorname: sanitizeFormField("vorname", data.vorname),
    nachname: sanitizeFormField("nachname", data.nachname),
    wunschposition: sanitizeFormField("wunschposition", data.wunschposition),
    abteilung: sanitizeFormField("abteilung", data.abteilung),
    telefonnummer: sanitizeFormField("telefonnummer", data.telefonnummer),
    mobilnummer: sanitizeFormField("mobilnummer", data.mobilnummer),
    email: sanitizeFormField("email", data.email),
    firmaId: sanitizeFormField("firmaId", data.firmaId)
  };

  if (options?.uppercaseNames) {
    // Locale-bewusste Großschreibung (z.B. türkisches "i" → "İ" bei tr-TR).
    sanitized.vorname = sanitized.vorname.toLocaleUpperCase(locale);
    sanitized.nachname = sanitized.nachname.toLocaleUpperCase(locale);
  }

  return sanitized;
}

export function sanitizeCompanyName(value: string): string {
  return sanitizeText(value, 120);
}

// Formatiert die Firmenadresse als einzeiligen String; gibt "" zurück wenn keine Daten vorhanden.
export function formatCompanyAddress(company?: Company): string {
  if (!company) {
    return "";
  }

  const lineOne = [sanitizeText(company.address.street, 80), sanitizeText(company.address.houseNumber, 20)]
    .filter(Boolean)
    .join(" ");
  const lineTwo = [sanitizeText(company.address.postalCode, 20), sanitizeText(company.address.city, 80)]
    .filter(Boolean)
    .join(" ");

  return [lineOne, lineTwo].filter(Boolean).join(", ");
}
