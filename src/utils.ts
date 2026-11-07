export function normalizeCountryInput(value: string): string {
  const cleaned = value.trim();
  if (!cleaned) {
    return "";
  }

  return cleaned.toUpperCase();
}

export function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

export function isAlpha2(value: string): boolean {
  return /^[A-Z]{2}$/i.test(value);
}

export function isAlpha3(value: string): boolean {
  return /^[A-Z]{3}$/i.test(value);
}

export function getDateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function arrayToRecord<T extends { id?: string; code?: string; iso2?: string }>(
  items: T[],
  key: "id" | "code" | "iso2",
): Record<string, T> {
  return items.reduce<Record<string, T>>((acc, item) => {
    const entryKey = item[key];
    if (entryKey) {
      acc[entryKey] = item;
    }
    return acc;
  }, {});
}

export function getOptionalString(value: string | undefined): string | undefined {
  return value && value.trim() ? value : undefined;
}
