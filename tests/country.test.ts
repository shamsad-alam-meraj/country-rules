import { describe, expect, it } from "vitest";

import {
  findCountry,
  formatCountryCurrency,
  formatCountryDate,
  formatCountryNumber,
  getAddressSchema,
  getAvailableRegions,
  getCallingCode,
  getCountriesByCallingCode,
  getCountriesByCurrency,
  getCountriesByLanguage,
  getCountriesByRegion,
  getCountriesByRegionAndCurrency,
  getCountriesByRegionAndLanguage,
  getCountriesBySubregion,
  getCountriesByTimezone,
  getCountriesByTimezoneAndCurrency,
  getCountry,
  getCountryBusinessProfile,
  getCountryByName,
  getCountryComparison,
  getCountryCustomizationProfile,
  getCountryFlag,
  getCountryMarketProfile,
  getCountryRules,
  getCountrySummary,
  getCurrencyRules,
  getDataCoverage,
  getGlobalCountryMatrix,
  getPhoneRules,
  getPostalCodeRules,
  getRelatedCountries,
  getSubdivisions,
  refreshCountryData,
  searchCountries,
  setCountryData,
  supportsPostalCode,
  validatePostalCode,
} from "../src/index";

describe("country-rules", () => {
  it("looks up countries case-insensitively and by ISO code", () => {
    const bd = getCountry("BD");
    expect(bd.iso2).toBe("BD");
    expect(bd.name).toContain("Bangladesh");

    const us = getCountry("us");
    expect(us.iso2).toBe("US");

    const found = getCountryByName("japan");
    expect(found.iso2).toBe("JP");

    const byAlpha3 = getCountry("JPN");
    expect(byAlpha3.iso3).toBe("JPN");
  });

  it("returns undefined for unknown country codes with the safe API", () => {
    expect(findCountry("XX")).toBeUndefined();
  });

  it("exposes address schemas for major countries", () => {
    const schema = getAddressSchema("JP");
    expect(schema.country).toBe("JP");
    expect(schema.fields.length).toBeGreaterThan(3);
    expect(schema.requiredFields).toContain("postalCode");
    expect(schema.fieldOrder[0]).toBe("postalCode");
  });

  it("formats postal addresses using country-aware templates", () => {
    const formatted = getCountryRules("JP");
    expect(formatted.address).toBeTruthy();

    const result = formatCountryNumber(1234567.89, "DE");
    expect(result).toContain("1.234.567");
  });

  it("supports postal-code validation metadata", () => {
    expect(supportsPostalCode("US")).toBe(true);
    expect(supportsPostalCode("XX")).toBe(false);
    expect(validatePostalCode("10001", "US")).toEqual(expect.objectContaining({ valid: true }));
    expect(validatePostalCode("BAD", "US")).toEqual(expect.objectContaining({ valid: false }));

    const rules = getPostalCodeRules("US");
    expect(rules.supported).toBe(true);
    expect(rules.required).toBe(true);
  });

  it("returns subdivision metadata and administrative levels", () => {
    const subdivisions = getSubdivisions("BD");
    expect(subdivisions.length).toBeGreaterThan(0);
    const levels = getSubdivisions("JP");
    expect(levels.length).toBeGreaterThan(0);
  });

  it("returns phone metadata and calling codes", () => {
    expect(getCallingCode("BD")).toBe("+880");
    const phone = getPhoneRules("JP");
    expect(phone.callingCode).toBe("+81");
    expect(phone.exampleFormats.length).toBeGreaterThan(0);
  });

  it("returns currency and locale metadata", () => {
    const currency = getCurrencyRules("BD");
    expect(currency.code).toBe("BDT");
    const locale = getCountryRules("DE").locale!;
    expect(locale.primaryLocale).toBe("de-DE");
    expect(locale.decimalSeparator).toBe(",");
  });

  it("reports coverage and provenance metadata", () => {
    const coverage = getDataCoverage("BD");
    expect(coverage.countryCode).toBe("BD");
    expect(coverage.availableModules.length).toBeGreaterThan(0);
    expect(coverage.sourceCount).toBeGreaterThan(0);
  });

  it("exposes flags and international customization profiles for all countries", () => {
    const flag = getCountryFlag("BD");
    expect(flag.emoji).toBe("🇧🇩");
    expect(flag.shortcode).toBe("BD");
    expect(flag.alt).toMatch(/Bangladesh/i);

    const customization = getCountryCustomizationProfile("US");
    expect(customization.countryCode).toBe("US");
    expect(customization.checkoutStyle).toMatch(/postal|shipping|address/i);
    expect(customization.flags).toContain("🇺🇸");
  });

  it("supports searching and region filtering for user-facing discovery", () => {
    const asia = getCountriesByRegion("asia");
    expect(asia.length).toBeGreaterThan(0);
    expect(asia.some((country) => country.iso2 === "BD")).toBe(true);

    const matches = searchCountries("bangladesh");
    expect(matches.some((country) => country.iso2 === "BD")).toBe(true);

    const regions = getAvailableRegions();
    expect(regions).toContain("Asia");
    expect(getCountriesBySubregion("Southern Asia").some((country) => country.iso2 === "BD")).toBe(
      true,
    );
  });

  it("supports additional international discovery helpers", () => {
    const byCurrency = getCountriesByCurrency("BDT");
    expect(byCurrency.some((country) => country.iso2 === "BD")).toBe(true);

    const byLanguage = getCountriesByLanguage("English");
    expect(byLanguage.length).toBeGreaterThan(0);
    expect(byLanguage.some((country) => country.iso2 === "US")).toBe(true);

    const byCallingCode = getCountriesByCallingCode("+880");
    expect(byCallingCode.some((country) => country.iso2 === "BD")).toBe(true);

    const byTimezone = getCountriesByTimezone("Asia/Dhaka");
    expect(byTimezone.some((country) => country.iso2 === "BD")).toBe(true);

    const byRegionLanguage = getCountriesByRegionAndLanguage("Asia", "English");
    expect(byRegionLanguage.length).toBeGreaterThan(0);

    const byRegionCurrency = getCountriesByRegionAndCurrency("Asia", "BDT");
    expect(byRegionCurrency.some((country) => country.iso2 === "BD")).toBe(true);

    const byTimezoneCurrency = getCountriesByTimezoneAndCurrency("Asia/Dhaka", "BDT");
    expect(byTimezoneCurrency.some((country) => country.iso2 === "BD")).toBe(true);

    const marketProfile = getCountryMarketProfile("BD");
    expect(marketProfile.countryCode).toBe("BD");
    expect(marketProfile.currencyCode).toBe("BDT");
    expect(marketProfile.timezoneCount).toBeGreaterThan(0);

    const matrix = getGlobalCountryMatrix({ region: "Asia" });
    expect(matrix.totalCountries).toBeGreaterThan(0);
    expect(matrix.countries.some((country) => country.countryCode === "BD")).toBe(true);

    const comparison = getCountryComparison("US", "BD");
    expect(comparison.baseCountry.countryCode).toBe("US");
    expect(comparison.compareCountry.countryCode).toBe("BD");
    expect(comparison.comparison.some((item) => item.label === "currency")).toBe(true);

    const summary = getCountrySummary("BD");
    expect(summary.countryCode).toBe("BD");
    expect(summary.flag.emoji).toBe("🇧🇩");
    expect(summary.currencyCode).toBe("BDT");
  });

  it("provides checkout-ready business hints for international flows", () => {
    const profile = getCountryBusinessProfile("US");
    expect(profile.countryCode).toBe("US");
    expect(profile.supportsPostalCode).toBe(true);
    expect(profile.postalCodeRequired).toBe(true);
    expect(profile.currencyCode).toBe("USD");
    expect(profile.deliveryHint).toMatch(/postal|zip|checkout/i);
    expect(profile.taxHint).toMatch(/tax|VAT|GST|sales/i);
  });

  it("formats currency and dates using country locale rules", () => {
    const currency = formatCountryCurrency(1234.5, "BD");
    expect(currency).toContain("৳");

    const formattedDate = formatCountryDate("2024-05-16", "DE");
    expect(formattedDate).toMatch(/16|05|2024/);
  });

  it("supports live dataset refresh and related country discovery", async () => {
    const original = getCountry("US");
    const related = getRelatedCountries("US");
    expect(related.some((country) => country.iso2 === "CA")).toBe(true);

    const customData = [
      {
        iso2: "US",
        iso3: "USA",
        numericCode: "840",
        name: "United States",
        commonName: "United States",
        region: "Americas",
        subregion: "North America",
        currencies: ["USD"],
        languages: ["English"],
        timezones: ["UTC-08:00", "UTC-05:00"],
        callingCodes: ["+1"],
        tlds: [".us"],
        independent: true,
        aliases: ["US", "United States"],
        flag: {
          emoji: "🇺🇸",
          shortcode: "US",
          alt: "Flag of United States",
          label: "United States flag",
          cssClass: "flag flag-us",
        },
        verification: {
          status: "verified",
          lastVerified: "2026-11-08",
          sources: [
            {
              id: "test-source",
              name: "Test Source",
              publisher: "Test Publisher",
              url: "https://example.com",
              accessedAt: "2026-11-08",
              reliability: "official",
            },
          ],
        },
      },
      {
        iso2: "CA",
        iso3: "CAN",
        numericCode: "124",
        name: "Canada",
        commonName: "Canada",
        region: "Americas",
        subregion: "North America",
        currencies: ["CAD"],
        languages: ["English", "French"],
        timezones: ["UTC-08:00", "UTC-05:00"],
        callingCodes: ["+1"],
        tlds: [".ca"],
        independent: true,
        aliases: ["CA", "Canada"],
        flag: {
          emoji: "🇨🇦",
          shortcode: "CA",
          alt: "Flag of Canada",
          label: "Canada flag",
          cssClass: "flag flag-ca",
        },
        verification: {
          status: "verified",
          lastVerified: "2026-11-08",
          sources: [
            {
              id: "test-source",
              name: "Test Source",
              publisher: "Test Publisher",
              url: "https://example.com",
              accessedAt: "2026-11-08",
              reliability: "official",
            },
          ],
        },
      },
    ] as Parameters<typeof setCountryData>[0];

    setCountryData(customData);
    expect(getRelatedCountries("US").some((country) => country.iso2 === "CA")).toBe(true);

    await refreshCountryData();
    expect(getCountry("US").iso2).toBe("US");
    expect(original.iso2).toBe("US");
  });

  it("throws documented errors for invalid ISO codes", () => {
    expect(() => getCountry("XXX")).toThrow();
    expect(() => getAddressSchema("XXX")).toThrow();
  });
});
