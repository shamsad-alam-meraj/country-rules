export type VerificationStatus = "verified" | "partially-verified" | "unverified" | "outdated";
export type Reliability = "official" | "trusted" | "community";
export type PostalStatus = "supported" | "optional" | "required" | "unknown" | "not-applicable";
export type CoverageModule =
  "country" | "address" | "postalCode" | "subdivisions" | "phone" | "currency" | "locale" | "date";

export interface DataSource {
  id: string;
  name: string;
  publisher: string;
  url: string;
  accessedAt: string;
  publishedAt?: string;
  license?: string;
  reliability: Reliability;
}

export interface DataVerification {
  status: VerificationStatus;
  lastVerified: string;
  sources: readonly DataSource[];
  notes?: string | undefined;
}

export interface AddressField {
  id: string;
  label: string;
  localizedLabel?: string;
  required: boolean;
  inputType: "text" | "tel" | "number" | "email" | "select" | "textarea";
  placeholder?: string;
  administrativeLevel?: string;
  countrySpecificName?: string;
  postalCodeRequired?: boolean;
  order: number;
  nativeScriptSupport?: boolean;
}

export interface AddressSchema {
  country: string;
  fields: readonly AddressField[];
  requiredFields: readonly string[];
  optionalFields: readonly string[];
  fieldOrder: readonly string[];
  postalCodeRequired: boolean;
  formatTemplate: readonly string[];
  notes?: string | undefined;
  verification: DataVerification;
}

export interface PostalCodeRules {
  country: string;
  supported: boolean;
  required: PostalStatus | boolean;
  pattern?: string;
  normalizationGuidance?: string;
  examples: readonly string[];
  validationConfidence: "high" | "medium" | "low";
  knownExceptions?: readonly string[];
  notes?: string | undefined;
  verification: DataVerification;
}

export interface Subdivision {
  id: string;
  code: string;
  name: string;
  commonName?: string;
  localizedName?: string;
  parentId?: string;
  level: string;
  isoCode?: string;
  verification: DataVerification;
}

export interface PhoneRules {
  country: string;
  callingCode: string;
  internationalPrefix: string;
  nationalPrefix?: string;
  trunkPrefix?: string;
  exampleFormats: readonly string[];
  e164Compatible: boolean;
  nationalNumberLength?: { min?: number; max?: number };
  notes?: string | undefined;
  verification: DataVerification;
}

export interface CurrencyRules {
  country: string;
  code: string;
  symbol?: string;
  minorUnit: number;
  displayName?: string;
  format?: string;
  verification: DataVerification;
}

export interface LocaleRules {
  country: string;
  primaryLocale: string;
  decimalSeparator: string;
  groupSeparator: string;
  groupingPattern: string;
  dateFormat: string;
  weekStart: string;
  timeZone: string;
  languageCodes: readonly string[];
  nativeLanguageNames: Record<string, string>;
  verification: DataVerification;
}

export interface Country {
  iso2: string;
  iso3: string;
  numericCode: string;
  name: string;
  commonName: string;
  nativeName?: string;
  capital?: string;
  region: string;
  subregion?: string;
  currencies: readonly string[];
  languages: readonly string[];
  timezones: readonly string[];
  callingCodes: readonly string[];
  tlds: readonly string[];
  independent: boolean;
  aliases: readonly string[];
  verification: DataVerification;
}

export interface CountryRecord extends Country {
  address?: AddressSchema | undefined;
  postalCode?: PostalCodeRules | undefined;
  subdivisions?: readonly Subdivision[] | undefined;
  phone?: PhoneRules | undefined;
  currency?: CurrencyRules | undefined;
  locale?: LocaleRules | undefined;
  date?: { dateFormat: string; weekStart: string; timeZone: string } | undefined;
}

export type CountryData = CountryRecord;

export interface CountryRuleSet {
  countryCode: string;
  country: Country;
  address?: AddressSchema | undefined;
  postalCode?: PostalCodeRules | undefined;
  subdivisions?: readonly Subdivision[] | undefined;
  phone?: PhoneRules | undefined;
  currency?: CurrencyRules | undefined;
  locale?: LocaleRules | undefined;
  date?: { dateFormat: string; weekStart: string; timeZone: string } | undefined;
  sources: readonly DataSource[];
  metadata: {
    lastVerified: string;
    completeness: "partial" | "moderate" | "full";
    version: string;
  };
}

export interface CoverageReport {
  countryCode: string;
  countryName: string;
  availableModules: CoverageModule[];
  missingModules: CoverageModule[];
  sourceCount: number;
  verificationStatus: VerificationStatus;
  completeness: number;
  limitations: string[];
}

export interface ValidationResult {
  valid: boolean;
  normalized?: string | undefined;
  missingFields?: string[] | undefined;
  unknownFields?: string[] | undefined;
  errors?: string[] | undefined;
  notes?: string | undefined;
}

export interface CountryQueryOptions {
  country?: string;
  modules?: CoverageModule[];
}
