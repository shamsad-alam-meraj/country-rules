import { getCountryRecord, getCountryRecords } from "./data";
import { InvalidAddressError, UnknownCountryError } from "./errors";
import type { AddressField, AddressSchema, ValidationResult } from "./types";

export function getAddressSchema(country: string): AddressSchema {
  const record = getCountryRecord(country);
  if (!record.address) {
    throw new UnknownCountryError(country);
  }
  return record.address;
}

export function getAddressFields(country: string): readonly AddressField[] {
  return getAddressSchema(country).fields;
}

export function validateAddress(
  country: string,
  address: Record<string, string | undefined>,
): ValidationResult {
  const schema = getAddressSchema(country);
  const knownFields = new Set(schema.fields.map((field) => field.id));
  const unknownFields = Object.keys(address).filter((key) => !knownFields.has(key));
  const missingFields = schema.requiredFields.filter(
    (key) => !address[key] || !String(address[key]).trim(),
  );

  return {
    valid: unknownFields.length === 0 && missingFields.length === 0,
    missingFields,
    unknownFields,
    errors:
      missingFields.length > 0
        ? [`Missing required fields: ${missingFields.join(", ")}`]
        : undefined,
    notes: schema.notes,
  } satisfies ValidationResult;
}

export function formatPostalAddress(input: {
  country: string;
  address: Record<string, string | undefined>;
}): string {
  const { country, address } = input;
  const schema = getAddressSchema(country);

  if (!address || Object.keys(address).length === 0) {
    throw new InvalidAddressError(`No address data was provided for ${country}.`);
  }

  const replacements = new Map<string, string>();
  for (const field of schema.fields) {
    const value = address[field.id];
    if (value && value.trim()) {
      replacements.set(field.id, value.trim());
    }
  }

  const formatted = schema.formatTemplate
    .map((template) =>
      template.replace(/\$\{(.*?)\}/g, (_, key: string) => replacements.get(key.trim()) ?? ""),
    )
    .filter((line) => line.trim().length > 0)
    .join("\n");

  if (!formatted.trim()) {
    throw new InvalidAddressError(`Could not format a postal address for ${country}.`);
  }

  return formatted;
}

export function getCountryAddressExamples(): Record<string, string> {
  const countries = getCountryRecords();
  return Object.fromEntries(
    countries.map((country) => [country.iso2, country.iso2]).filter(([, code]) => code !== ""),
  );
}
