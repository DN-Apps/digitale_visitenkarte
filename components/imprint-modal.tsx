"use client";

import type { DictionaryKey } from "@/lib/i18n";

type Dictionary = Record<DictionaryKey, string>;

type Props = {
  open: boolean;
  onClose: () => void;
  dictionary: Dictionary;
};

export function ImprintModal({ open, onClose, dictionary }: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-label={dictionary.imprintHeading}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{dictionary.imprintHeading}</h2>
        <p style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{dictionary.imprintBody}</p>
        <button className="btn" type="button" onClick={onClose}>
          {dictionary.close}
        </button>
      </section>
    </div>
  );
}