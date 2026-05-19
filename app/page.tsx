"use client";

import { useEffect, useMemo, useState } from "react";
import { BusinessCardForm } from "@/components/business-card-form";
import { BusinessCardPreview } from "@/components/business-card-preview";
import { ImprintModal } from "@/components/imprint-modal";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PrivacyModal } from "@/components/privacy-modal";
import { QrCard } from "@/components/qr-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleWalletButton } from "@/components/google-wallet-button";
import { getDictionary } from "@/lib/i18n";
import { findCompanyById, getCompanies } from "@/lib/companies";
import { buildVCard, downloadVCard } from "@/lib/vcard";
import { sanitizeFormData, sanitizeFormField } from "@/lib/business-card-utils";
import { useFormValidation } from "@/lib/use-form-validation";
import type { BusinessCardFormData, Company, SupportedLocale } from "@/lib/types";

const STORAGE_FORM_KEY = "dgv.form.v2";
const STORAGE_LOCALE_KEY = "dgv.locale.v1";
const PRIVACY_ACCEPTED_KEY = "datenschutzAkzeptiert";

const initialFormData: BusinessCardFormData = {
  vorname: "",
  nachname: "",
  wunschposition: "",
  abteilung: "",
  telefonnummer: "",
  mobilnummer: "",
  email: "",
  firmaId: ""
};

type OverpassElement = {
  id: number;
  tags?: Record<string, string>;
};

function overpassToCompany(element: OverpassElement): Company | null {
  if (!element.tags?.name) {
    return null;
  }

  return {
    id: `api_${element.id}`,
    name: element.tags.name,
    address: {
      street: element.tags["addr:street"] || "",
      houseNumber: element.tags["addr:housenumber"] || "",
      postalCode: element.tags["addr:postcode"] || "",
      city: element.tags["addr:city"] || element.tags["addr:place"] || "",
      country: element.tags["addr:country"] || "Germany"
    }
  };
}

export default function HomePage() {
  const [locale, setLocale] = useState<SupportedLocale>("de");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showImprint, setShowImprint] = useState(false);
  const [formData, setFormData] = useState<BusinessCardFormData>(initialFormData);
  const [submittedData, setSubmittedData] = useState<BusinessCardFormData | null>(null);
  const [companies, setCompanies] = useState<Company[]>(() => getCompanies());

  const dictionary = getDictionary(locale);
  const { errors, validate, clearFieldError } = useFormValidation(dictionary);

  const selectedCompany = useMemo(
    () => findCompanyById((submittedData ?? formData).firmaId, companies),
    [companies, formData, submittedData]
  );

  const vCard = useMemo(
    () => (submittedData ? buildVCard(submittedData, selectedCompany) : ""),
    [submittedData, selectedCompany]
  );

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(PRIVACY_ACCEPTED_KEY) === "true";
      setShowPrivacy(!accepted);

      const savedLocale = localStorage.getItem(STORAGE_LOCALE_KEY);
      const effectiveLocale: SupportedLocale = savedLocale === "en" ? "en" : "de";
      setLocale(effectiveLocale);

      const savedFormRaw = localStorage.getItem(STORAGE_FORM_KEY);
      if (!savedFormRaw) {
        return;
      }

      const saved = JSON.parse(savedFormRaw) as Partial<BusinessCardFormData>;
      const normalizedSaved = sanitizeFormData({
        vorname: saved.vorname ?? "",
        nachname: saved.nachname ?? "",
        wunschposition: saved.wunschposition ?? "",
        abteilung: saved.abteilung ?? (saved as { department?: string }).department ?? "",
        telefonnummer: saved.telefonnummer ?? "",
        mobilnummer: saved.mobilnummer ?? "",
        email: saved.email ?? "",
        firmaId: saved.firmaId ?? ""
      }, effectiveLocale);

      setFormData(normalizedSaved);
    } catch {
      // Ignore invalid browser storage entries.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_LOCALE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem(STORAGE_FORM_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const overpassQuery = `
      [out:json][timeout:25];
      node["office"](49.1,8.3,49.6,8.8);
      out 50;
    `;

    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassQuery,
      headers: { "Content-Type": "text/plain" }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json() as Promise<{ elements?: OverpassElement[] }>;
      })
      .then((payload) => {
        const apiCompanies = (payload.elements ?? [])
          .map(overpassToCompany)
          .filter((company): company is Company => company !== null);

        const knownCompanies = getCompanies();
        const knownNames = new Set(knownCompanies.map((company) => company.name.toLowerCase()));
        const filteredApiCompanies = apiCompanies.filter(
          (company) => !knownNames.has(company.name.toLowerCase())
        );

        const merged = [...knownCompanies, ...filteredApiCompanies].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setCompanies(merged);
      })
      .catch(() => {
        setCompanies(getCompanies());
      });
  }, []);

  function updateForm(field: keyof BusinessCardFormData, value: string) {
    clearFieldError(field);
    const sanitizedValue = sanitizeFormField(field, value);
    setFormData((previous) => ({ ...previous, [field]: sanitizedValue }));
  }

  function handleReset() {
    setFormData(initialFormData);
    setSubmittedData(null);
  }

  function handleGenerate() {
    if (!validate(formData)) {
      return;
    }
    const normalizedData = sanitizeFormData(formData, locale, { uppercaseNames: true });
    setFormData(normalizedData);
    setSubmittedData(normalizedData);
  }

  function handleBack() {
    setSubmittedData(null);
  }

  function handleDownload() {
    if (!submittedData || !vCard) {
      return;
    }

    const first = submittedData.vorname || "kontakt";
    const last = submittedData.nachname || "karte";
    const safeBaseName = `${first}-${last}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "");

    downloadVCard(`${safeBaseName || "kontakt-karte"}.vcf`, vCard);
  }

  function handleAcceptPrivacy() {
    localStorage.setItem(PRIVACY_ACCEPTED_KEY, "true");
    setShowPrivacy(false);
  }

  return (
    <main className="container">
      <div className="top-actions">
        <LanguageSwitcher locale={locale} onChange={setLocale} />
        <ThemeToggle />
      </div>

      <header className="card" style={{ marginBottom: "1rem" }}>
        <h1 className="title">{dictionary.appTitle}</h1>
        <p className="muted" style={{ marginBottom: 0 }}>
          {dictionary.appSubtitle}
        </p>
      </header>

      {!submittedData ? (
        <BusinessCardForm
          formData={formData}
          companies={companies}
          locale={locale}
          dictionary={dictionary}
          errors={errors}
          onChange={updateForm}
          onGenerate={handleGenerate}
          onReset={handleReset}
        />
      ) : (
        <section className="shell">
          <BusinessCardPreview formData={submittedData} company={selectedCompany} dictionary={dictionary} />

          <div style={{ display: "grid", gap: "1rem" }}>
            <QrCard value={vCard} dictionary={dictionary} />

            <section className="card">
              <div className="actions">
                <button className="btn primary" type="button" onClick={handleDownload}>
                  {dictionary.downloadVcard}
                </button>
                <GoogleWalletButton
                  formData={submittedData}
                  company={selectedCompany}
                  locale={locale}
                  dictionary={dictionary}
                />
                <button className="btn" type="button" onClick={handleBack}>
                  {dictionary.cardBackButton}
                </button>
                <button className="btn" type="button" onClick={() => setShowImprint(true)}>
                  {dictionary.imprintHeading}
                </button>
              </div>
            </section>
          </div>
        </section>
      )}

      <PrivacyModal open={showPrivacy} onAccept={handleAcceptPrivacy} dictionary={dictionary} />
      <ImprintModal open={showImprint} onClose={() => setShowImprint(false)} dictionary={dictionary} />
    </main>
  );
}
