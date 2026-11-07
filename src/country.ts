import { findCountryRecord, getCountryRecord, getCountryRecords } from "./data";
import { UnknownCountryError } from "./errors";
import type { Country, CountryBusinessProfile } from "./types";
import { normalizeName } from "./utils";

export function getCountry(input: string): Country {
  const record = getCountryRecord(input);
  return {
    iso2: record.iso2,
    iso3: record.iso3,
    numericCode: record.numericCode,
    name: record.name,
    commonName: record.commonName,
    ...(record.nativeName ? { nativeName: record.nativeName } : {}),
    ...(record.capital ? { capital: record.capital } : {}),
    region: record.region,
    ...(record.subregion ? { subregion: record.subregion } : {}),
    currencies: record.currencies,
    languages: record.languages,
    timezones: record.timezones,
    callingCodes: record.callingCodes,
    tlds: record.tlds,
    independent: record.independent,
    aliases: record.aliases,
    verification: record.verification,
  };
}

export function getCountries(): Country[] {
  return getCountryRecords();
}

export function findCountry(input: string): Country | undefined {
  const record = findCountryRecord(input);
  if (!record) return undefined;
  return getCountry(record.iso2);
}

export function getCountryByName(name: string): Country {
  const normalized = normalizeName(name);
  const match = getCountryRecords().find((country) => {
    const candidates = [country.name, country.commonName, ...(country.aliases ?? [])].map((value) =>
      normalizeName(value),
    );
    return candidates.includes(normalized);
  });

  if (!match) {
    throw new UnknownCountryError(name);
  }

  return match;
}

export function getCountriesByRegion(region: string): Country[] {
  const normalized = normalizeName(region);
  return getCountryRecords().filter((country) => {
    const candidates = [country.region, country.subregion ?? "", country.name, country.commonName]
      .map((value) => normalizeName(value))
      .filter(Boolean);

    return candidates.some((value) => value === normalized || value.includes(normalized));
  });
}

export function getAvailableRegions(): string[] {
  return [...new Set(getCountryRecords().map((country) => country.region))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getCountriesBySubregion(subregion: string): Country[] {
  const normalized = normalizeName(subregion);
  return getCountryRecords().filter((country) => {
    if (!country.subregion) return false;
    const value = normalizeName(country.subregion);
    return value === normalized || value.includes(normalized) || normalized.includes(value);
  });
}

export function getCountryBusinessProfile(countryCode: string): CountryBusinessProfile {
  const record = getCountryRecord(countryCode);
  const supportsPostalCode = record.postalCode?.supported === true;
  const postalCodeRequired =
    record.postalCode?.required === true ||
    record.postalCode?.required === "required" ||
    record.address?.postalCodeRequired === true;

  const deliveryHint = supportsPostalCode
    ? postalCodeRequired
      ? `Validate postal codes before checkout in ${record.name}; delivery addresses often need an exact postal or ZIP code.`
      : `Postal validation is recommended for checkout in ${record.name}; it helps reduce address errors during delivery.`
    : `Postal metadata is limited for ${record.name}; verify destination details manually before shipping.`;

  const taxHint = `Tax rules such as VAT, GST, or sales tax vary by jurisdiction in ${record.name}; confirm local billing requirements before charging customers.`;

  return {
    countryCode: record.iso2,
    region: record.region,
    ...(record.subregion ? { subregion: record.subregion } : {}),
    currencyCode: record.currency?.code ?? record.currencies[0] ?? "USD",
    locale: record.locale?.primaryLocale ?? "en-US",
    supportsPostalCode,
    postalCodeRequired,
    deliveryHint,
    taxHint,
    weekStart: record.locale?.weekStart ?? "Monday",
  };
}

export function searchCountries(query: string): Country[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return getCountryRecords();
  }

  const normalized = normalizeName(trimmed);
  return getCountryRecords().filter((country) => {
    const candidates = [
      country.name,
      country.commonName,
      country.nativeName ?? "",
      ...(country.aliases ?? []),
    ]
      .filter(Boolean)
      .map((value) => normalizeName(value));

    return candidates.some(
      (value) => value === normalized || value.includes(normalized) || normalized.includes(value),
    );
  });
}
