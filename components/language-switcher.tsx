"use client";

import type { SupportedLocale } from "@/lib/types";

type Props = {
  locale: SupportedLocale;
  onChange: (locale: SupportedLocale) => void;
};

export function LanguageSwitcher({ locale, onChange }: Props) {
  return (
    <div className="actions" role="group" aria-label="Language switcher">
      <button
        className="btn"
        onClick={() => onChange("de")}
        aria-pressed={locale === "de"}
        type="button"
      >
        DE
      </button>
      <button
        className="btn"
        onClick={() => onChange("en")}
        aria-pressed={locale === "en"}
        type="button"
      >
        EN
      </button>
    </div>
  );
}