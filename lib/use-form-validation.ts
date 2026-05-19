"use client";

import { useState } from "react";
import type { BusinessCardFormData } from "./types";
import type { DictionaryKey } from "./i18n";
import { sanitizeEmail } from "./business-card-utils";

type Dictionary = Record<DictionaryKey, string>;

export type ValidationErrors = Partial<Record<keyof BusinessCardFormData, string>>;

// Einfache Format-Prüfung; exakte Validierung erfolgt serverseitig.
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateFormData(
  data: BusinessCardFormData,
  dictionary: Dictionary
): ValidationErrors {
  const errors: ValidationErrors = {};
  // E-Mail wird vor der Prüfung normalisiert (Leerzeichen, Großschreibung).
  const normalizedEmail = sanitizeEmail(data.email);

  if (!data.vorname.trim()) {
    errors.vorname = dictionary.errorVorname;
  }

  if (!data.nachname.trim()) {
    errors.nachname = dictionary.errorNachname;
  }

  if (!data.wunschposition.trim()) {
    errors.wunschposition = dictionary.errorWunschposition;
  }

  if (normalizedEmail && !isValidEmail(normalizedEmail)) {
    errors.email = dictionary.errorEmail;
  }

  if (!normalizedEmail) {
    errors.email = dictionary.errorEmailRequired;
  }

  if (!data.firmaId.trim()) {
    errors.firmaId = dictionary.errorFirmaId;
  }

  return errors;
}

export function useFormValidation(dictionary: Dictionary) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(data: BusinessCardFormData): boolean {
    const result = validateFormData(data, dictionary);
    setErrors(result);
    setSubmitted(true);
    return Object.keys(result).length === 0;
  }

  // Löscht den Fehler eines einzelnen Felds beim nächsten Tippen (nur nach erstem Submit).
  function clearFieldError(field: keyof BusinessCardFormData) {
    if (submitted) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next[field];
        return next;
      });
    }
  }

  return { errors, validate, clearFieldError };
}
