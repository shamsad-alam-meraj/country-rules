# country-rules

Production-grade TypeScript utilities for country intelligence, international address rules, postal validation, currency metadata, and locale-aware formatting.

This package is built for teams that need trustworthy country metadata in checkout, shipping, customer onboarding, compliance, and global localization flows. The library intentionally combines a full world catalog with a curated set of deeply verified rule sets for the countries that need the strongest shipping and address confidence.

## Why teams choose country-rules

- Full ISO-style world country catalog
- TypeScript-first API with strong public typings
- ESM + CommonJS output for modern Node usage
- Country lookup by ISO 2, ISO 3, or normalized name
- Address schema, postal code, phone, currency, and locale metadata
- Explicit provenance and verification metadata on every record
- Built for compliance, localization, B2B onboarding, and international checkout

## Installation

```bash
npm install country-rules
```

## Quick start

```ts
import {
  formatCountryCurrency,
  formatCountryDate,
  getCountry,
  getCountries,
  getCountriesByRegion,
  getAddressSchema,
  getPostalCodeRules,
  searchCountries,
  validatePostalCode,
  getCurrencyRules,
  getDataCoverage,
} from "country-rules";

const bangladesh = getCountry("BD");
console.log(bangladesh.name); // Bangladesh
console.log(bangladesh.callingCodes); // [ "+880" ]

const japanSchema = getAddressSchema("JP");
console.log(japanSchema.country); // JP
console.log(japanSchema.formatTemplate[0]); // ${postalCode}

const usPostal = getPostalCodeRules("US");
console.log(usPostal.required); // true
console.log(validatePostalCode("10001", "US")); // true

const currency = getCurrencyRules("BD");
console.log(currency.code); // BDT
console.log(formatCountryCurrency(1234.5, "BD")); // ৳1,234.50 or equivalent locale output
console.log(formatCountryDate("2024-05-16", "DE")); // localized date string

const coverage = getDataCoverage("BD");
console.log(coverage.verificationStatus); // verified

const asia = getCountriesByRegion("asia");
console.log(asia.length);
console.log(searchCountries("bangladesh")[0].iso2); // BD

console.log(getCountries().length); // 250+ records
```

## World coverage

The package exposes a full international country catalog covering countries and territories across Africa, the Americas, Asia, Europe, and Oceania.

```ts
import { getCountry, getCountries } from "country-rules";

const countries = getCountries();
console.log(countries.length);
console.log(getCountry("US").name);
console.log(getCountry("DE").capital);
console.log(getCountry("JP").commonName);
```

## Core API

- `getCountry()` / `getCountries()` / `findCountry()` / `searchCountries()` / `getCountriesByRegion()`
- `getAddressSchema()` / `validateAddress()` / `formatPostalAddress()`
- `getPostalCodeRules()` / `supportsPostalCode()` / `validatePostalCode()`
- `getSubdivisions()` / `getAdministrativeLevels()`
- `getPhoneRules()` / `getCallingCode()`
- `getCurrencyRules()` / `formatCountryNumber()` / `formatCountryCurrency()`
- `getLocaleRules()` / `getDateRules()` / `formatCountryDate()`
- `getDataCoverage()` / `buildCountryRuleSet()`

## Data quality policy

This package is intentionally transparent about quality:

- all records include provenance metadata and verification status
- the full catalog is broad and discoverable across the world
- rule-heavy modules such as address formatting and postal validation remain curated for countries with the highest-confidence data
- metadata is treated as a support layer for software workflows, not a legal or postal-delivery guarantee

## High-confidence rule coverage

Deeply verified rule sets are maintained for countries such as Bangladesh, the United States, Japan, Germany, the United Kingdom, India, Australia, Singapore, the UAE, Brazil, China, and South Korea.

## License

MIT

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, tests, and contribution workflow.

## Security

Please review [SECURITY.md](SECURITY.md) for vulnerability disclosure and security reporting guidance.
