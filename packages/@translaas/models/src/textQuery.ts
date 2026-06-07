/**
 * Inject `N` (invariant formatting) when `number` is set and `N` is not already present.
 * Mirrors .NET `TranslaasClient.MergeNumberIntoParameters` and Python `merge_number_into_parameters`.
 */
export function mergeNumberIntoParameters(
  number: number | undefined,
  parameters?: Record<string, string>
): Record<string, string> | undefined {
  if (number === undefined && !parameters) {
    return undefined;
  }

  const merged: Record<string, string> = {};
  if (parameters) {
    for (const [key, value] of Object.entries(parameters)) {
      if (key != null && value != null) {
        merged[key] = value;
      }
    }
  }

  if (number !== undefined && !Object.keys(merged).some(key => key.toUpperCase() === 'N')) {
    merged.N = formatNumberForQuery(number);
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

/** Format a numeric query value the same way Python/.NET SDKs do. */
export function formatNumberForQuery(number: number): string {
  if (!Number.isFinite(number)) {
    return String(number);
  }
  return Number(number.toPrecision(15)).toString();
}
