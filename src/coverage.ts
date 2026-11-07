import type { CountryQueryOptions, CoverageReport } from "./types";
import { getCountryRulesForCoverage } from "./data";

export function getDataCoverage(country: string | CountryQueryOptions): CoverageReport {
  return getCountryRulesForCoverage(country);
}
