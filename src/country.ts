import { findCountryRecord, getCountryRecord, getCountryRecords } from "./data";
import { UnknownCountryError } from "./errors";
import type {
  Country,
  CountryBusinessProfile,
  CountryComparison,
  CountryComparisonItem,
  CountryCustomizationProfile,
  CountryFlag,
  CountryMarketProfile,
  CountryPresentation,
  CountrySummary,
  GlobalCountryMatrix,
  GlobalCountryMatrixEntry,
} from "./types";
import { normalizeName } from "./utils";

function countryCodeToFlagEmoji(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return "🏳️";
  }

  return Array.from(code)
    .map((character: string) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join("");
}

function createCountryFlag(countryCode: string, countryName: string): CountryFlag {
  const shortcode = countryCode.trim().toUpperCase();
  return {
    emoji: countryCodeToFlagEmoji(shortcode),
    shortcode,
    alt: `Flag of ${countryName}`,
    label: `${countryName} flag`,
    cssClass: `flag flag-${shortcode.toLowerCase()}`,
  };
}

export function getCountryFlag(input: string): CountryFlag {
  const record = getCountryRecord(input);
  return createCountryFlag(record.iso2, record.name);
}

export function getCountryPresentation(input: string): CountryPresentation {
  const record = getCountryRecord(input);
  const flag = createCountryFlag(record.iso2, record.name);

  return {
    iso2: record.iso2,
    iso3: record.iso3,
    name: record.name,
    commonName: record.commonName,
    region: record.region,
    ...(record.subregion ? { subregion: record.subregion } : {}),
    ...(record.capital ? { capital: record.capital } : {}),
    displayName: `${flag.emoji} ${record.name}`,
    flag,
  };
}

export function getCountryCustomizationProfile(input: string): CountryCustomizationProfile {
  const record = getCountryRecord(input);
  const flag = createCountryFlag(record.iso2, record.name);
  const locale = record.locale?.primaryLocale ?? "en-US";
  const defaultCurrency = record.currency?.code ?? record.currencies[0] ?? "USD";
  const supportsPostalCode = Boolean(
    record.postalCode?.supported || record.address?.postalCodeRequired,
  );
  const checkoutStyle = supportsPostalCode
    ? "Postal code-first international checkout with address validation and shipping safeguards."
    : "Flexible international checkout with manual confirmation for address rule variations.";
  const preferredLayout: CountryCustomizationProfile["preferredLayout"] = supportsPostalCode
    ? "postal-first"
    : record.region === "Europe"
      ? "card-first"
      : "manual-confirmation";
  const addressMode: CountryCustomizationProfile["addressMode"] = supportsPostalCode
    ? "strict"
    : record.region === "Americas"
      ? "moderate"
      : "flexible";

  return {
    countryCode: record.iso2,
    countryName: record.name,
    locale,
    checkoutStyle,
    defaultCurrency,
    preferredLayout,
    addressMode,
    taxReminder: `Confirm local VAT, GST, or sales-tax rules before checkout in ${record.name}.`,
    personalization: [
      `${flag.emoji} ${record.name}`,
      `${record.region} • ${record.subregion ?? "international"}`,
      `${defaultCurrency} • ${locale}`,
    ],
    flags: [flag.emoji, "🇺🇳"],
  };
}

export function getCountrySummary(input: string): CountrySummary {
  const record = getCountryRecord(input);
  const flag = createCountryFlag(record.iso2, record.name);

  return {
    countryCode: record.iso2,
    name: record.name,
    commonName: record.commonName,
    region: record.region,
    ...(record.subregion ? { subregion: record.subregion } : {}),
    ...(record.capital ? { capital: record.capital } : {}),
    flag,
    currencyCode: record.currency?.code ?? record.currencies[0] ?? "USD",
    locale: record.locale?.primaryLocale ?? "en-US",
    callingCode: record.phone?.callingCode ?? record.callingCodes[0] ?? "+1",
    timezones: record.timezones,
    languages: record.languages,
  };
}

export function getCountry(input: string): Country {
  const record = getCountryRecord(input);
  const flag = createCountryFlag(record.iso2, record.name);
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
    flag,
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

export function getCountriesByCurrency(currencyCode: string): Country[] {
  const normalized = normalizeName(currencyCode).replace(/[^a-z]/g, "");

  return getCountryRecords().filter((country) =>
    country.currencies.some(
      (currency) => normalizeName(currency).replace(/[^a-z]/g, "") === normalized,
    ),
  );
}

export function getCountriesByLanguage(language: string): Country[] {
  const normalized = normalizeName(language);
  const displayNames = new Intl.DisplayNames(["en"], { type: "language" });

  return getCountryRecords().filter((country) =>
    country.languages.some((languageName) => {
      const candidate = normalizeName(languageName);
      let displayName = "";

      try {
        if (/^[a-z]{2,3}(-[a-z0-9]+)*$/i.test(languageName)) {
          displayName = normalizeName(displayNames.of(languageName) ?? "");
        }
      } catch {
        displayName = "";
      }

      return (
        candidate === normalized ||
        displayName === normalized ||
        candidate.includes(normalized) ||
        normalized.includes(candidate)
      );
    }),
  );
}

export function getCountriesByCallingCode(callingCode: string): Country[] {
  const normalized = callingCode.trim();
  const formatted = normalized.startsWith("+") ? normalized : `+${normalized}`;

  return getCountryRecords().filter((country) =>
    country.callingCodes.some((code) => normalizeName(code) === normalizeName(formatted)),
  );
}

export function getCountriesByTimezone(timezone: string): Country[] {
  const normalized = normalizeName(timezone);

  return getCountryRecords().filter((country) =>
    country.timezones.some((current) => {
      const candidate = normalizeName(current);
      return (
        candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate)
      );
    }),
  );
}

export function getCountriesByRegionAndLanguage(region: string, language: string): Country[] {
  const regionMatches = getCountriesByRegion(region);
  const languageMatches = getCountriesByLanguage(language);
  const languageSet = new Set(languageMatches.map((country) => country.iso2));

  return regionMatches.filter((country) => languageSet.has(country.iso2));
}

export function getCountriesByRegionAndCurrency(region: string, currencyCode: string): Country[] {
  const regionMatches = getCountriesByRegion(region);
  const currencyMatches = getCountriesByCurrency(currencyCode);
  const currencySet = new Set(currencyMatches.map((country) => country.iso2));

  return regionMatches.filter((country) => currencySet.has(country.iso2));
}

export function getCountriesByTimezoneAndCurrency(
  timezone: string,
  currencyCode: string,
): Country[] {
  const timezoneMatches = getCountriesByTimezone(timezone);
  const currencyMatches = getCountriesByCurrency(currencyCode);
  const currencySet = new Set(currencyMatches.map((country) => country.iso2));

  return timezoneMatches.filter((country) => currencySet.has(country.iso2));
}

export function getRelatedCountries(input: string): Country[] {
  const record = getCountryRecord(input);
  const seen = new Set<string>();
  const related: Country[] = [];

  const addCountry = (country: Country) => {
    if (country.iso2 === record.iso2 || seen.has(country.iso2)) {
      return;
    }

    seen.add(country.iso2);
    related.push(country);
  };

  const targetLanguages = record.languages.slice(0, 2);
  const targetCurrencies = record.currencies.slice(0, 2);
  const targetTimezones = record.timezones.slice(0, 2);

  for (const country of getCountriesByRegion(record.region)) {
    addCountry(country);
  }

  for (const language of targetLanguages) {
    for (const country of getCountriesByLanguage(language)) {
      addCountry(country);
    }
  }

  for (const currency of targetCurrencies) {
    for (const country of getCountriesByCurrency(currency)) {
      addCountry(country);
    }
  }

  for (const timezone of targetTimezones) {
    for (const country of getCountriesByTimezone(timezone)) {
      addCountry(country);
    }
  }

  return related;
}

export function getCountryDataFromRelatedCountry(input: string): Country[] {
  return getRelatedCountries(input);
}

export function getCountryMarketProfile(input: string): CountryMarketProfile {
  const record = getCountryRecord(input);

  return {
    countryCode: record.iso2,
    countryName: record.name,
    region: record.region,
    ...(record.subregion ? { subregion: record.subregion } : {}),
    currencyCode: record.currency?.code ?? record.currencies[0] ?? "USD",
    locale: record.locale?.primaryLocale ?? "en-US",
    callingCode: record.phone?.callingCode ?? record.callingCodes[0] ?? "+1",
    timezones: record.timezones,
    languages: record.languages,
    timezoneCount: record.timezones.length,
    languageCount: record.languages.length,
    currencyCount: record.currencies.length,
  };
}

export function getGlobalCountryMatrix(
  options: {
    region?: string;
    subregion?: string;
    currency?: string;
    timezone?: string;
  } = {},
): GlobalCountryMatrix {
  let countries = getCountryRecords();
  const regionFilter = options.region ?? "";
  const subregionFilter = options.subregion ?? "";
  const currencyFilter = options.currency ?? "";
  const timezoneFilter = options.timezone ?? "";

  if (regionFilter) {
    countries = countries.filter((country) => {
      const region = normalizeName(country.region);
      const target = normalizeName(regionFilter);
      return region === target || region.includes(target);
    });
  }

  if (subregionFilter) {
    countries = countries.filter((country) => {
      if (!country.subregion) return false;
      const subregion = normalizeName(country.subregion);
      const target = normalizeName(subregionFilter);
      return subregion === target || subregion.includes(target) || target.includes(subregion);
    });
  }

  if (currencyFilter) {
    countries = countries.filter((country) =>
      country.currencies.some((currency) => {
        const value = normalizeName(currency).replace(/[^a-z]/g, "");
        const target = normalizeName(currencyFilter).replace(/[^a-z]/g, "");
        return value === target || target.includes(value) || value.includes(target);
      }),
    );
  }

  if (timezoneFilter) {
    countries = countries.filter((country) =>
      country.timezones.some((timezone) => {
        const value = normalizeName(timezone);
        const target = normalizeName(timezoneFilter);
        return value === target || value.includes(target) || target.includes(value);
      }),
    );
  }

  const matrixCountries: GlobalCountryMatrixEntry[] = countries.map((country) => ({
    countryCode: country.iso2,
    countryName: country.name,
    region: country.region,
    ...(country.subregion ? { subregion: country.subregion } : {}),
    currencyCode: country.currencies[0] ?? "USD",
    timezoneCount: country.timezones.length,
    languageCount: country.languages.length,
    flags: [country.flag.emoji, "🇺🇳"],
  }));

  return {
    totalCountries: matrixCountries.length,
    ...(options.region ? { region: options.region } : {}),
    ...(options.subregion ? { subregion: options.subregion } : {}),
    ...(options.currency ? { currencyFilter: options.currency } : {}),
    ...(options.timezone ? { timezoneFilter: options.timezone } : {}),
    countries: matrixCountries,
  };
}

export function getCountryComparison(
  baseCountry: string,
  compareCountry: string,
): CountryComparison {
  const base = getCountrySummary(baseCountry);
  const compare = getCountrySummary(compareCountry);

  const comparison: CountryComparisonItem[] = [
    {
      label: "region",
      base: base.region,
      compare: compare.region,
      isSame: base.region === compare.region,
    },
    {
      label: "currency",
      base: base.currencyCode,
      compare: compare.currencyCode,
      isSame: base.currencyCode === compare.currencyCode,
    },
    {
      label: "locale",
      base: base.locale,
      compare: compare.locale,
      isSame: base.locale === compare.locale,
    },
    {
      label: "callingCode",
      base: base.callingCode,
      compare: compare.callingCode,
      isSame: base.callingCode === compare.callingCode,
    },
  ];

  return {
    baseCountry: base,
    compareCountry: compare,
    comparison,
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
