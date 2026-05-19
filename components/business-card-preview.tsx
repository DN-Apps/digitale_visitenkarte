"use client";

import type { Company, BusinessCardFormData } from "@/lib/types";
import type { DictionaryKey } from "@/lib/i18n";
import { formatCompanyAddress } from "@/lib/business-card-utils";

type Dictionary = Record<DictionaryKey, string>;

type Props = {
  formData: BusinessCardFormData;
  company?: Company;
  dictionary: Dictionary;
};

function getInitials(first: string, last: string): string {
  const f = first.trim()[0] ?? "";
  const l = last.trim()[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

export function BusinessCardPreview({ formData, company, dictionary }: Props) {
  const fullName = `${formData.vorname} ${formData.nachname}`.trim();
  const initials = getInitials(formData.vorname, formData.nachname);
  const companyAddress = formatCompanyAddress(company);
  const hasCompanyAddress = companyAddress.length > 0;

  return (
    <section className="card fade-in-up">
      <h3 style={{ marginTop: 0 }}>{dictionary.preview}</h3>
      <p className="muted" style={{ marginTop: 0, fontSize: "0.85rem" }}>{dictionary.cardDemoNotice}</p>
      <article className="preview-card">
        <div className="preview-row">
          <div className="avatar" aria-hidden>{initials}</div>
          <div className="preview-info">
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{fullName || "-"}</h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
              {formData.wunschposition || dictionary.cardPositionUnavailable}
            </p>
          </div>
        </div>

        <p className="meta muted" style={{ margin: "0.2rem 0" }}>{formData.abteilung || dictionary.cardDepartmentUnavailable}</p>

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.75rem 0" }} />

        <p className="meta" style={{ margin: "0.2rem 0" }}>✉ {formData.email || dictionary.cardEmailUnavailable}</p>
        <p className="meta" style={{ margin: "0.2rem 0" }}>☎ {formData.telefonnummer || dictionary.cardPhoneUnavailable}</p>
        <p className="meta" style={{ margin: "0.2rem 0" }}>📱 {formData.mobilnummer || dictionary.cardPhoneUnavailable}</p>

        {company && (
          <>
            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.75rem 0" }} />
            <p className="meta" style={{ margin: "0.2rem 0", fontWeight: 600 }}>{company.name}</p>
            {hasCompanyAddress ? (
              <p className="meta muted" style={{ margin: "0.2rem 0", fontSize: "0.85rem" }}>
                {companyAddress}
              </p>
            ) : (
              <p className="meta muted" style={{ margin: "0.2rem 0", fontSize: "0.85rem" }}>
                {dictionary.cardCompanyAddressUnavailableNotice}
              </p>
            )}
          </>
        )}
      </article>
    </section>
  );
}