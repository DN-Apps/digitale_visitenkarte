"use client";

import type { Company, BusinessCardFormData, SupportedLocale } from "@/lib/types";
import type { DictionaryKey } from "@/lib/i18n";
import type { ValidationErrors } from "@/lib/use-form-validation";

type Dictionary = Record<DictionaryKey, string>;

type Props = {
  formData: BusinessCardFormData;
  companies: Company[];
  locale: SupportedLocale;
  dictionary: Dictionary;
  errors: ValidationErrors;
  onChange: (field: keyof BusinessCardFormData, value: string) => void;
  onGenerate: () => void;
  onReset: () => void;
};

type FieldConfig = {
  key: keyof BusinessCardFormData;
  label: DictionaryKey;
  type?: "text" | "email" | "tel";
};

const baseFields: FieldConfig[] = [
  { key: "vorname", label: "cardFirstname" },
  { key: "nachname", label: "cardLastname" },
  { key: "wunschposition", label: "cardPosition" },
  { key: "abteilung", label: "cardDepartment" },
  { key: "telefonnummer", label: "cardPhone", type: "tel" },
  { key: "mobilnummer", label: "cardMobile", type: "tel" },
  { key: "email", label: "cardEmail", type: "email" }
];

const commonPositionsByLocale: Record<SupportedLocale, string[]> = {
  de: [
    "Sachbearbeiter/in",
    "Junior Professional",
    "Professional",
    "Senior Professional",
    "Abteilungsleiter",
    "Bereichsleiter",
    "Geschaeftsfuehrer"
  ],
  en: [
    "Clerk",
    "Junior Professional",
    "Professional",
    "Senior Professional",
    "Department Head",
    "Division Head",
    "Managing Director"
  ]
};

const commonDepartmentsByLocale: Record<SupportedLocale, string[]> = {
  de: ["Einkauf", "Verkauf", "Facility Management", "Controlling", "IT", "Marketing", "Personal"],
  en: ["Procurement", "Sales", "Facility Management", "Controlling", "IT", "Marketing", "HR"]
};

export function BusinessCardForm({
  formData,
  companies,
  locale,
  dictionary,
  errors,
  onChange,
  onGenerate,
  onReset
}: Props) {
  return (
    <section className="card">
      <div className="field-grid">
        {baseFields.map((field) => {
          const error = errors[field.key];
          const isPresetDropdown = field.key === "wunschposition" || field.key === "abteilung";
          const suggestions =
            field.key === "wunschposition"
              ? commonPositionsByLocale[locale]
              : commonDepartmentsByLocale[locale];

          return (
            <label key={field.key} className="field">
              <span>{dictionary[field.label]}</span>
              {isPresetDropdown ? (
                <select
                  value={formData[field.key]}
                  aria-invalid={Boolean(error)}
                  style={error ? { borderColor: "var(--error, #c0392b)" } : undefined}
                  onChange={(event) => onChange(field.key, event.target.value)}
                >
                  <option value="">{dictionary[field.label]}</option>
                  {suggestions.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type ?? "text"}
                  value={formData[field.key]}
                  aria-invalid={Boolean(error)}
                  style={error ? { borderColor: "var(--error, #c0392b)" } : undefined}
                  onChange={(event) => onChange(field.key, event.target.value)}
                />
              )}
              {error && (
                <span role="alert" style={{ color: "var(--error, #c0392b)", fontSize: "0.8rem" }}>
                  {error}
                </span>
              )}
            </label>
          );
        })}

        <label className="field full">
          <span>{dictionary.cardDropdown}</span>
          <select
            value={formData.firmaId}
            onChange={(event) => onChange("firmaId", event.target.value)}
          >
            <option value="">{dictionary.cardDropdown}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="actions" style={{ marginTop: "1rem" }}>
        <button className="btn" onClick={onReset} type="button">
          {dictionary.cardReset}
        </button>
        <button className="btn primary" onClick={onGenerate} type="button">
          {dictionary.cardGenerate}
        </button>
      </div>
    </section>
  );
}