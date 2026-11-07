import countries, { type CountryData } from "../data/countries";
import { UnknownCountryError } from "./errors";
import type {
  Country,
  CountryQueryOptions,
  CountryRuleSet,
  CoverageModule,
  CoverageReport,
  PostalCodeRules,
} from "./types";
import { normalizeCountryInput, normalizeName } from "./utils";

const countryList = countries as unknown as CountryData[];

function normalizePostalCodeRules(
  rules?: PostalCodeRules | Record<string, unknown>,
): PostalCodeRules | undefined {
  if (!rules) {
    return undefined;
  }

  const requiredValue = rules.required as unknown;
  return {
    ...rules,
    required: typeof requiredValue === "boolean" ? requiredValue : requiredValue === "required",
  } as PostalCodeRules;
}

export function getAllCountryData(): CountryData[] {
  return structuredClone(countryList);
}

export function getCountryRecord(countryCode: string): CountryData {
  const key = normalizeCountryInput(countryCode);
  const list = countryList.filter((country) => country.iso2 === key || country.iso3 === key);
  if (list.length > 0) {
    return list[0] as CountryData;
  }

  const byName = countryList.find(
    (country) =>
      country.aliases.some((alias) => normalizeName(alias) === normalizeName(countryCode)) ||
      normalizeName(country.name) === normalizeName(countryCode) ||
      normalizeName(country.commonName) === normalizeName(countryCode),
  );

  if (byName) {
    return byName as CountryData;
  }

  throw new UnknownCountryError(countryCode);
}

export function findCountryRecord(countryCode: string): CountryData | undefined {
  const normalized = normalizeCountryInput(countryCode);
  if (!normalized) return undefined;

  const byCode = countryList.find(
    (country) => country.iso2 === normalized || country.iso3 === normalized,
  );
  if (byCode) return byCode;

  return countryList.find((country) => {
    const aliases = [country.name, country.commonName, ...country.aliases].map((value) =>
      normalizeName(value),
    );
    return aliases.includes(normalizeName(countryCode));
  });
}

export function getCountryRecords(): Country[] {
  return countryList.map((country) => ({
    iso2: country.iso2,
    iso3: country.iso3,
    numericCode: country.numericCode,
    name: country.name,
    commonName: country.commonName,
    ...(country.nativeName ? { nativeName: country.nativeName } : {}),
    ...(country.capital ? { capital: country.capital } : {}),
    region: country.region,
    ...(country.subregion ? { subregion: country.subregion } : {}),
    currencies: country.currencies,
    languages: country.languages,
    timezones: country.timezones,
    callingCodes: country.callingCodes,
    tlds: country.tlds,
    independent: country.independent,
    aliases: country.aliases,
    verification: country.verification,
  }));
}

export function getCountryList(): string[] {
  return countryList.map((country) => country.iso2);
}

export function buildCountryRuleSet(countryCode: string): CountryRuleSet {
  const country = getCountryRecord(countryCode);
  const subdivisions = "subdivisions" in country ? country.subdivisions : undefined;

  return {
    countryCode: country.iso2,
    country: {
      iso2: country.iso2,
      iso3: country.iso3,
      numericCode: country.numericCode,
      name: country.name,
      commonName: country.commonName,
      ...(country.nativeName ? { nativeName: country.nativeName } : {}),
      ...(country.capital ? { capital: country.capital } : {}),
      region: country.region,
      ...(country.subregion ? { subregion: country.subregion } : {}),
      currencies: country.currencies,
      languages: country.languages,
      timezones: country.timezones,
      callingCodes: country.callingCodes,
      tlds: country.tlds,
      independent: country.independent,
      aliases: country.aliases,
      verification: country.verification,
    },
    address: country.address,
    postalCode: normalizePostalCodeRules(country.postalCode) as CountryRuleSet["postalCode"],
    subdivisions,
    phone: country.phone,
    currency: country.currency,
    locale: country.locale,
    date: {
      dateFormat: country.locale?.dateFormat ?? "yyyy-MM-dd",
      weekStart: country.locale?.weekStart ?? "Monday",
      timeZone: country.locale?.timeZone ?? "UTC",
    },
    sources: country.verification.sources,
    metadata: {
      lastVerified: country.verification.lastVerified,
      completeness: "partial",
      version: "1.0.0",
    },
  };
}

export function getCountryRules(countryCode: string): CountryRuleSet {
  return buildCountryRuleSet(countryCode);
}

export function getCountryRulesFromInput(input: string): Country | undefined {
  const record = findCountryRecord(input);
  if (!record) return undefined;

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

export function getCoverageDetail(
  countryCode: string,
  modules: CoverageModule[] = [
    "country",
    "address",
    "postalCode",
    "subdivisions",
    "phone",
    "currency",
    "locale",
  ],
): CoverageReport {
  const record = findCountryRecord(countryCode);
  if (!record) {
    throw new UnknownCountryError(countryCode);
  }

  const availableModules: CoverageModule[] = modules.filter((module) => {
    if (module === "country") return true;
    if (module === "address") return Boolean(record.address);
    if (module === "postalCode") return Boolean(record.postalCode);
    if (module === "subdivisions")
      return Boolean((record as { subdivisions?: readonly unknown[] }).subdivisions?.length);
    if (module === "phone") return Boolean(record.phone);
    if (module === "currency") return Boolean(record.currency);
    if (module === "locale") return Boolean(record.locale);
    if (module === "date") return Boolean(record.locale);
    return false;
  });

  return {
    countryCode: record.iso2,
    countryName: record.name,
    availableModules,
    missingModules: modules.filter((module) => !availableModules.includes(module)),
    sourceCount: record.verification.sources.length,
    verificationStatus: record.verification.status,
    completeness: Math.max(
      0.25,
      Math.min(1, availableModules.length / Math.max(modules.length, 1)),
    ),
    limitations: record.address
      ? [
          "Country metadata is intentionally conservative; this package does not claim universal legal or deliverability guarantees.",
        ]
      : ["Dataset is deliberately limited to verified, curated country metadata."],
  };
}

export function getCountryRulesForCoverage(country: string | CountryQueryOptions): CoverageReport {
  if (typeof country === "string") {
    return getCoverageDetail(country, [
      "country",
      "address",
      "postalCode",
      "subdivisions",
      "phone",
      "currency",
      "locale",
    ]);
  }

  return getCoverageDetail(
    country.country ?? "",
    country.modules ?? [
      "country",
      "address",
      "postalCode",
      "subdivisions",
      "phone",
      "currency",
      "locale",
    ],
  );
}
