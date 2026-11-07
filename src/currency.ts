import { getCountryRecord } from "./data";
import { UnknownCountryError } from "./errors";
import type { CurrencyRules } from "./types";

export function getCurrencyRules(country: string): CurrencyRules {
  const record = getCountryRecord(country);
  if (!record.currency) {
    throw new UnknownCountryError(country);
  }
  return record.currency;
}

export function formatCountryNumber(value: number, country: string): string {
  const locale = getCountryRecord(country).locale?.primaryLocale ?? "en-US";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
