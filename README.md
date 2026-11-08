# country-rules

Production-grade country intelligence for global product, checkout, compliance, localization, and marketplace workflows.

country-rules gives you a TypeScript-first catalog of the world’s countries and territories with flags, regional metadata, address rules, postal validation, locale-aware formatting, and high-value market intelligence for international commerce.

## Why teams use country-rules

- Full global country catalog with ISO, region, subregion, language, timezone, and currency metadata
- Flag-aware country records for UIs, selectors, onboarding, and country-specific experience design
- Checkout and personalization profiles for shipping, billing, tax, and localized user journeys
- Address schema and postal validation helpers for real-world international forms
- Market discovery helpers for region, currency, timezone, and country matrix analysis
- Strong provenance and verification metadata for trust and auditability
- ESM + CommonJS builds with TypeScript declarations for modern Node and browser apps

## Installation

```bash
npm install country-rules
```

## Quick start

```ts
import {
  formatCountryCurrency,
  formatCountryDate,
  getCountriesByRegion,
  getCountry,
  getCountryCustomizationProfile,
  getCountryFlag,
  getCountryMarketProfile,
  getCountryPresentation,
  getDataCoverage,
  getGlobalCountryMatrix,
  searchCountries,
  validatePostalCode,
} from "country-rules";

const bd = getCountry("BD");
console.log(bd.name); // Bangladesh
console.log(bd.flag.emoji); // 🇧🇩
console.log(getCountryFlag("BD").alt); // Flag of Bangladesh

const market = getCountryMarketProfile("BD");
console.log(market.currencyCode); // BDT
console.log(market.timezoneCount); // 1+

const usProfile = getCountryCustomizationProfile("US");
console.log(usProfile.checkoutStyle);
console.log(usProfile.flags); // ["🇺🇸", "🇺🇳"]

const presentation = getCountryPresentation("JP");
console.log(presentation.displayName); // 🇯🇵 Japan

const coverage = getDataCoverage("BD");
console.log(coverage.verificationStatus); // verified

const asia = getCountriesByRegion("asia");
console.log(asia.length);
console.log(searchCountries("france")[0]?.iso2); // FR

console.log(validatePostalCode("10001", "US"));
console.log(formatCountryCurrency(1234.5, "BD"));
console.log(formatCountryDate("2024-05-16", "DE"));

console.log(getGlobalCountryMatrix({ region: "Asia" }).totalCountries);
```

## Market intelligence helpers

Use the package not just for country lookup, but for global market analysis and product personalization.

```ts
import {
  getCountriesByRegionAndCurrency,
  getCountriesByTimezoneAndCurrency,
  getCountryMarketProfile,
  getGlobalCountryMatrix,
} from "country-rules";

const market = getCountryMarketProfile("BD");
console.log(market.currencyCode); // BDT
console.log(market.timezoneCount);

const asianBangladeshCurrency = getCountriesByRegionAndCurrency("Asia", "BDT");
console.log(asianBangladeshCurrency.some((country) => country.iso2 === "BD"));

const dhakaCurrencyMatches = getCountriesByTimezoneAndCurrency("Asia/Dhaka", "BDT");
console.log(dhakaCurrencyMatches.some((country) => country.iso2 === "BD"));

const matrix = getGlobalCountryMatrix({ region: "Asia" });
console.log(matrix.totalCountries);
console.log(matrix.countries[0]);
```

## Core API

- `getCountry()` / `getCountries()` / `findCountry()` / `searchCountries()`
- `getCountryFlag()` / `getCountryPresentation()` / `getCountryCustomizationProfile()`
- `getCountryMarketProfile()` / `getGlobalCountryMatrix()`
- `getCountriesByRegion()` / `getCountriesBySubregion()` / `getAvailableRegions()`
- `getCountriesByCurrency()` / `getCountriesByLanguage()` / `getCountriesByTimezone()`
- `getCountriesByRegionAndCurrency()` / `getCountriesByRegionAndLanguage()`
- `getCountriesByTimezoneAndCurrency()`
- `getAddressSchema()` / `validateAddress()` / `formatPostalAddress()`
- `getPostalCodeRules()` / `supportsPostalCode()` / `validatePostalCode()`
- `getSubdivisions()` / `getPhoneRules()` / `getCallingCode()`
- `getCurrencyRules()` / `formatCountryNumber()` / `formatCountryCurrency()`
- `getLocaleRules()` / `getDateRules()` / `formatCountryDate()`
- `getDataCoverage()` / `buildCountryRuleSet()`

## Typical use cases

- Checkout and shipping rules for international buyers
- Customer onboarding and address capture for global sign-up
- Tax and VAT/GST-aware billing and UX flows
- Locale-aware formatting for dates, numbers, and currencies
- Country selector UIs with flags and regional grouping
- Market expansion analysis, region filtering, and global intelligence exploration

## Data quality

This package is intentionally transparent about confidence and coverage:

- Records include provenance and verification metadata
- The catalog spans countries and territories across the world
- Legal, tax, and shipping rules are contextual rather than absolute guarantees
- High-confidence rule modules are curated for markets that need reliable validation

## License

MIT

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidance.

## Security

Please review [SECURITY.md](SECURITY.md) for the vulnerability disclosure process.
