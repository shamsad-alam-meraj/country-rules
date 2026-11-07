import { getCountryRecord } from "./data";
import { UnknownCountryError } from "./errors";
import type { PostalCodeRules } from "./types";

export function getPostalCodeRules(country: string): PostalCodeRules {
  const record = getCountryRecord(country);
  const postal = record.postalCode as Record<string, unknown> | undefined;

  if (!postal) {
    throw new UnknownCountryError(country);
  }

  return {
    ...(postal as Record<string, unknown>),
    required:
      typeof postal.required === "boolean" ? postal.required : postal.required === "required",
  } as PostalCodeRules;
}

export function supportsPostalCode(country: string): boolean {
  try {
    return getCountryRecord(country).postalCode?.supported === true;
  } catch {
    return false;
  }
}

export function validatePostalCode(
  value: string,
  country: string,
): {
  valid: boolean;
  normalized?: string | undefined;
  reason?: string | undefined;
  pattern?: string | undefined;
} {
  const record = getCountryRecord(country);
  const postal = record.postalCode;
  if (!postal) {
    throw new UnknownCountryError(country);
  }

  const normalized = value.trim().replace(/\s+/g, "");
  if (!postal.supported) {
    return {
      valid: false,
      normalized,
      reason: "Postal codes are not supported for this country.",
      pattern: postal.pattern,
    };
  }

  if (!postal.pattern) {
    return {
      valid: false,
      normalized,
      reason: "No verified postal-code pattern is available.",
      pattern: undefined as string | undefined,
    };
  }

  const regex = new RegExp(postal.pattern, "i");
  const valid = regex.test(normalized);

  return {
    valid,
    normalized,
    reason: valid
      ? "Postal code matches the verified syntax for this country."
      : "Postal code does not match the available verified pattern.",
    pattern: postal.pattern,
  };
}
