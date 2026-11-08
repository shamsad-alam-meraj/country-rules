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

const defaultCountryList = countries as unknown as CountryData[];
let countryList = [...defaultCountryList];

function normalizeCountryDataRecord(input: Record<string, unknown>): CountryData | undefined {
  const raw = input ?? {};
  const iso2 = String(raw.iso2 ?? raw.cca2 ?? raw.code ?? "")
    .trim()
    .toUpperCase();
  if (!iso2) {
    return undefined;
  }

  const iso3 = String(raw.iso3 ?? raw.cca3 ?? iso2)
    .trim()
    .toUpperCase();
  const numericCode = String(raw.numericCode ?? raw.ccn3 ?? "").trim();
  const name = String(raw.name ?? raw.commonName ?? "");
  const commonName = String(raw.commonName ?? raw.name ?? name);
  const capital = Array.isArray(raw.capital)
    ? String(raw.capital[0] ?? "")
    : raw.capital
      ? String(raw.capital)
      : undefined;
  const currencies = Array.isArray(raw.currencies)
    ? raw.currencies.map((currency) =>
        typeof currency === "string" ? currency : String(currency?.code ?? currency?.name ?? ""),
      )
    : Object.keys((raw.currencies as Record<string, unknown>) ?? {});
  const languages = Array.isArray(raw.languages)
    ? raw.languages.map((language) =>
        typeof language === "string"
          ? language
          : String(language?.name ?? language?.official ?? ""),
      )
    : Object.values((raw.languages as Record<string, unknown>) ?? {}).map((language) =>
        typeof language === "string" ? language : String(language ?? ""),
      );
  const timezones = Array.isArray(raw.timezones)
    ? raw.timezones.map((timezone) => String(timezone))
    : Array.isArray(raw.timezone)
      ? raw.timezone.map((timezone) => String(timezone))
      : [];
  const callingCodes = Array.isArray(raw.callingCodes)
    ? raw.callingCodes.map((code) => {
        const value = String(code).replace(/^\+/, "");
        return value ? `+${value}` : "";
      })
    : Array.isArray(raw.callingCode)
      ? raw.callingCode.map((code) => {
          const value = String(code).replace(/^\+/, "");
          return value ? `+${value}` : "";
        })
      : [];
  const tlds = Array.isArray(raw.tlds)
    ? raw.tlds.map((tld) => String(tld))
    : Array.isArray(raw.tld)
      ? raw.tld.map((tld) => String(tld))
      : [];
  const aliases = Array.from(
    new Set(
      [
        iso2,
        iso3,
        name,
        commonName,
        ...(Array.isArray(raw.aliases) ? raw.aliases.map((alias) => String(alias)) : []),
        ...(Array.isArray(raw.altSpellings) ? raw.altSpellings.map((alias) => String(alias)) : []),
      ].filter(Boolean),
    ),
  );

  return {
    iso2,
    iso3,
    numericCode,
    name: name || commonName || iso2,
    commonName: commonName || name || iso2,
    ...(capital ? { capital } : {}),
    region: String(raw.region ?? "Unknown"),
    ...(raw.subregion ? { subregion: String(raw.subregion) } : {}),
    currencies: currencies.filter(Boolean),
    languages: languages.filter(Boolean),
    timezones,
    callingCodes: callingCodes.filter(Boolean),
    tlds,
    independent: Boolean(raw.independent ?? true),
    aliases,
    flag: {
      emoji: String(raw.flag ?? "🏳️"),
      shortcode: iso2,
      alt: `Flag of ${name || commonName || iso2}`,
      label: `${name || commonName || iso2} flag`,
      cssClass: `flag flag-${iso2.toLowerCase()}`,
    },
    verification: {
      status: "partially-verified",
      lastVerified: new Date().toISOString().slice(0, 10),
      sources: [
        {
          id: "dynamic-source",
          name: "Dynamic Country Data Refresh",
          publisher: "country-rules",
          url: "https://github.com/shamsad-alam-meraj/country-rules",
          accessedAt: new Date().toISOString(),
          reliability: "trusted",
        },
      ],
    },
  } as CountryData;
}

function createCountryFlag(countryCode: string, countryName: string) {
  const code = countryCode.trim().toUpperCase();
  const emoji = Array.from(code)
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join("");

  return {
    emoji,
    shortcode: code,
    alt: `Flag of ${countryName}`,
    label: `${countryName} flag`,
    cssClass: `flag flag-${code.toLowerCase()}`,
  };
}

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

export function setCountryData(nextData: CountryData[]): CountryData[] {
  countryList = nextData
    .map((country) => normalizeCountryDataRecord(country as unknown as Record<string, unknown>))
    .filter(Boolean) as CountryData[];

  return structuredClone(countryList);
}

export async function refreshCountryData(
  source: string | CountryData[] = defaultCountryList,
  fetcher: typeof fetch = globalThis.fetch?.bind(globalThis),
): Promise<CountryData[]> {
  if (Array.isArray(source)) {
    return setCountryData(source);
  }

  if (typeof source !== "string") {
    return getAllCountryData();
  }

  if (typeof globalThis.fetch !== "function") {
    return getAllCountryData();
  }

  const response = await fetcher(source);
  if (!response.ok) {
    throw new Error(`Unable to refresh country data from ${source}: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const data = payload as { data?: unknown; results?: unknown };
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.results)
        ? data.results
        : [payload];

  return setCountryData(
    records
      .map((record: unknown) =>
        normalizeCountryDataRecord(record as unknown as Record<string, unknown>),
      )
      .filter(Boolean) as CountryData[],
  );
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
    flag: createCountryFlag(country.iso2, country.name),
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
      flag: createCountryFlag(country.iso2, country.name),
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
    flag: createCountryFlag(record.iso2, record.name),
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
