"use client";

import { QRCodeSVG } from "qrcode.react";
import type { DictionaryKey } from "@/lib/i18n";

type Dictionary = Record<DictionaryKey, string>;

type Props = {
  value: string;
  dictionary: Dictionary;
};

export function QrCard({ value, dictionary }: Props) {
  return (
    <section className="card" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
      <h3 style={{ marginTop: 0, marginBottom: 0 }}>QR</h3>
      <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>{dictionary.qrHint}</p>
      <QRCodeSVG value={value || " "} size={180} bgColor="transparent" />
    </section>
  );
}