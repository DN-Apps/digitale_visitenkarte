"use client";

import { useState } from "react";
import type { BusinessCardFormData, Company, SupportedLocale } from "@/lib/types";
import type { DictionaryKey } from "@/lib/i18n";
import {
  formatCompanyAddress,
  sanitizeCompanyName,
  sanitizeFormData
} from "@/lib/business-card-utils";

type Dictionary = Record<DictionaryKey, string>;

type Props = {
  formData: BusinessCardFormData;
  company?: Company;
  locale: SupportedLocale;
  dictionary: Dictionary;
};

export function GoogleWalletButton({ formData, company, locale, dictionary }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveToWallet() {
    setLoading(true);
    setError(null);

    const normalizedData = sanitizeFormData(formData, locale, { uppercaseNames: true });
    const companyAddress = formatCompanyAddress(company) || undefined;

    try {
      const response = await fetch("/api/google-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vorname: normalizedData.vorname,
          nachname: normalizedData.nachname,
          wunschposition: normalizedData.wunschposition,
          abteilung: normalizedData.abteilung,
          telefonnummer: normalizedData.telefonnummer,
          mobilnummer: normalizedData.mobilnummer,
          email: normalizedData.email,
          companyName: company?.name ? sanitizeCompanyName(company.name) : undefined,
          companyAddress,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? dictionary.googleWalletError);
        return;
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      setError(dictionary.googleWalletError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        className="btn"
        type="button"
        onClick={handleSaveToWallet}
        disabled={loading}
        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21.56 10.74L11.7 0.87C11.31 0.49 10.8 0.25 10.26 0.25H3C1.9 0.25 1 1.15 1 2.25V9.51C1 10.05 1.22 10.56 1.61 10.94L11.47 20.8C12.25 21.59 13.52 21.59 14.3 20.8L21.56 13.54C22.34 12.76 22.34 11.53 21.56 10.74ZM5.5 7.25C4.67 7.25 4 6.58 4 5.75C4 4.92 4.67 4.25 5.5 4.25C6.33 4.25 7 4.92 7 5.75C7 6.58 6.33 7.25 5.5 7.25Z" />
        </svg>
        {loading ? dictionary.googleWalletSaving : dictionary.saveToGoogleWallet}
      </button>
      {error && (
        <p style={{ color: "var(--error, #c00)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}
