import de from "@/messages/de.json";
import en from "@/messages/en.json";
import type { SupportedLocale } from "./types";

const dictionaries = { de, en };

export type DictionaryKey = keyof typeof de;

export function getDictionary(locale: SupportedLocale) {
  return dictionaries[locale];
}