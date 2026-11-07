import { findCountryRecord, getCountryRecord, getCountryRecords } from "./data";
import { UnknownCountryError } from "./errors";
import type { Country } from "./types";
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
