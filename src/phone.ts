import { getCountryRecord } from "./data";
import { UnknownCountryError } from "./errors";
import type { PhoneRules } from "./types";

export function getPhoneRules(country: string): PhoneRules {
  const record = getCountryRecord(country);
  if (!record.phone) {
    throw new UnknownCountryError(country);
  }
  return record.phone;
}

export function getCallingCode(country: string): string {
  return getPhoneRules(country).callingCode;
}
