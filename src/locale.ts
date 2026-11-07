import { getCountryRecord } from "./data";
import { UnknownCountryError } from "./errors";
import type { LocaleRules } from "./types";

export function getLocaleRules(country: string): LocaleRules {
  const record = getCountryRecord(country);
  if (!record.locale) {
    throw new UnknownCountryError(country);
  }
  return record.locale;
}

export function getDateRules(country: string): {
  dateFormat: string;
  weekStart: string;
  timeZone: string;
} {
  const locale = getLocaleRules(country);
  return {
    dateFormat: locale.dateFormat,
    weekStart: locale.weekStart,
    timeZone: locale.timeZone,
  };
}
