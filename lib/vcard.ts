import type { BusinessCardFormData, Company } from "./types";
import { sanitizeCompanyName, sanitizeFormData } from "./business-card-utils";

// Maskiert vCard-Sonderzeichen gemäß RFC 6350.
function escapeVCardValue(value: string): string {
  return value.replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export function buildVCard(data: BusinessCardFormData, company?: Company): string {
  // Sanitization vor dem Schreiben der vCard-Felder.
  const normalizedData = sanitizeFormData(data, "de", { uppercaseNames: true });
  const fullName = `${normalizedData.vorname} ${normalizedData.nachname}`.trim();
  const companyName = sanitizeCompanyName(company?.name ?? "");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "NOTE:Diese Visitenkarte dient Demonstrationszwecken\\nund stellt keine offizielle Bestätigung dar.",
    `N:${escapeVCardValue(normalizedData.nachname)};${escapeVCardValue(normalizedData.vorname)};;;`,
    `FN:${escapeVCardValue(fullName)}`,
    `ORG:${escapeVCardValue(companyName)};${escapeVCardValue(normalizedData.abteilung || "")}`
  ];

  if (normalizedData.wunschposition.trim()) {
    lines.push(`TITLE:${escapeVCardValue(normalizedData.wunschposition)}`);
  }

  if (normalizedData.telefonnummer.trim()) {
    lines.push(`TEL;TYPE=WORK,VOICE:${escapeVCardValue(normalizedData.telefonnummer)}`);
  }

  if (normalizedData.mobilnummer.trim()) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(normalizedData.mobilnummer)}`);
  }

  if (normalizedData.email.trim()) {
    lines.push(`EMAIL:${escapeVCardValue(normalizedData.email)}`);
  }

  if (company) {
    lines.push(
      `ADR;TYPE=WORK:;;${escapeVCardValue(company.address.street)} ${escapeVCardValue(company.address.houseNumber)};${escapeVCardValue(company.address.city)};;${escapeVCardValue(company.address.postalCode)};${escapeVCardValue(company.address.country)}`
    );
  }

  lines.push(`REV:${new Date().toISOString()}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

export function downloadVCard(filename: string, vcardContent: string): void {
  const blob = new Blob([vcardContent], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}