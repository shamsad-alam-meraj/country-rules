import {
  formatCountryCurrency,
  formatCountryDate,
  getAddressSchema,
  getCountries,
  getCountriesByRegion,
  getCountriesByRegionAndCurrency,
  getCountriesByTimezoneAndCurrency,
  getCountry,
  getCountryCustomizationProfile,
  getCountryFlag,
  getCountryMarketProfile,
  getCurrencyRules,
  getDataCoverage,
  getGlobalCountryMatrix,
  getPostalCodeRules,
  searchCountries,
  validatePostalCode,
} from "country-rules";

const bangladesh = getCountry("BD");
console.log("Country:", bangladesh.name);
console.log("Flag:", bangladesh.flag.emoji);
console.log("Currency:", getCurrencyRules("BD").code);
console.log("Postal support:", getPostalCodeRules("BD").supported);
console.log("Coverage:", getDataCoverage("BD").verificationStatus);
console.log("Currency value:", formatCountryCurrency(1234.5, "BD"));
console.log("Date:", formatCountryDate("2024-05-16", "DE"));

const schema = getAddressSchema("JP");
console.log("JP schema fields:", schema.fields.length);
console.log("Postal validation:", validatePostalCode("100-0001", "JP"));

const customization = getCountryCustomizationProfile("US");
console.log("US checkout style:", customization.checkoutStyle);
console.log("US flag:", getCountryFlag("US").emoji);

const profile = getCountryMarketProfile("BD");
console.log("BD market profile:", profile.currencyCode, profile.timezoneCount);

const asia = getCountriesByRegion("asia");
console.log(
  "Asian countries sample:",
  asia.slice(0, 5).map((country) => country.iso2),
);

console.log(
  "Asian countries using BDT:",
  getCountriesByRegionAndCurrency("Asia", "BDT").map((country) => country.iso2),
);

console.log(
  "Countries in Asia/Dhaka with BDT:",
  getCountriesByTimezoneAndCurrency("Asia/Dhaka", "BDT").map((country) => country.iso2),
);

console.log(
  "Search results:",
  searchCountries("bangladesh").map((country) => country.iso2),
);

const matrix = getGlobalCountryMatrix({ region: "Asia" });
console.log("Asia country matrix size:", matrix.totalCountries);

const totalCountries = getCountries().length;
console.log(`World catalog size: ${totalCountries} countries and territories`);
