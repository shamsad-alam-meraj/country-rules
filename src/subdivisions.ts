import { getCountryRecord } from "./data";
import { UnknownCountryError } from "./errors";
import type { Subdivision } from "./types";

export function getSubdivisions(country: string): Subdivision[] {
  const record = getCountryRecord(country);
  const subdivisions = (record as { subdivisions?: readonly Subdivision[] | undefined })
    .subdivisions;
  if (!subdivisions?.length) {
    throw new UnknownCountryError(country);
  }
  return [...subdivisions];
}

export function getSubdivision(country: string, subdivisionId: string): Subdivision | undefined {
  return getSubdivisions(country).find(
    (entry) =>
      entry.id === subdivisionId || entry.code === subdivisionId || entry.isoCode === subdivisionId,
  );
}

export function getAdministrativeLevels(country: string): string[] {
  return [...new Set(getSubdivisions(country).map((subdivision) => subdivision.level))];
}
