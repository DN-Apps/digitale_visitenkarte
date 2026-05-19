"use client";

import type { DictionaryKey } from "@/lib/i18n";

type Dictionary = Record<DictionaryKey, string>;

type Props = {
  open: boolean;
  onAccept: () => void;
  dictionary: Dictionary;
};

export function PrivacyModal({ open, onAccept, dictionary }: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-label={dictionary.privacyNoticeTitle}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{dictionary.privacyNoticeTitle}</h2>
        <p style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{dictionary.privacyNoticeText}</p>
        <button className="btn primary" type="button" onClick={onAccept}>
          {dictionary.privacyNoticeButton}
        </button>
      </section>
    </div>
  );
}