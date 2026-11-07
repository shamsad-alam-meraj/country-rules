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

export function formatCountryCurrency(value: number, country: string): string {
  const record = getCountryRecord(country);
  const locale = record.locale?.primaryLocale ?? "en-US";
  const currency = record.currency?.code ?? "USD";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
