import { describe, expect, it } from "vitest";

import {
  findCountry,
  formatCountryNumber,
  getAddressSchema,
  getCallingCode,
  getCountry,
  getCountryByName,
  getCountryRules,
  getCurrencyRules,
  getDataCoverage,
  getPhoneRules,
  getPostalCodeRules,
  getSubdivisions,
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

  it("throws documented errors for invalid ISO codes", () => {
    expect(() => getCountry("XXX")).toThrow();
    expect(() => getAddressSchema("XXX")).toThrow();
  });
});
