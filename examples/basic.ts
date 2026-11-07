import {
  getAddressSchema,
  getCountries,
  getCountry,
  getCurrencyRules,
  getDataCoverage,
  getPostalCodeRules,
  validatePostalCode,
} from "country-rules";

const bangladesh = getCountry("BD");
console.log("Country:", bangladesh.name);
console.log("Currency:", getCurrencyRules("BD").code);
console.log("Postal support:", getPostalCodeRules("BD").supported);
console.log("Coverage:", getDataCoverage("BD").verificationStatus);

const schema = getAddressSchema("JP");
console.log("JP schema fields:", schema.fields.length);
console.log("Postal validation:", validatePostalCode("100-0001", "JP"));

const totalCountries = getCountries().length;
console.log(`World catalog size: ${totalCountries} countries and territories`);
