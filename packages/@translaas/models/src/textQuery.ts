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

export interface TextEntryQueryParams {
  group: string;
  entry: string;
  lang: string;
  number?: number;
  project?: string;
  parameters?: Record<string, string>;
}

/**
 * Builds query params for GET /sdk/v1/translations/text.
 *
 * Mirrors .NET `BuildGetRequest`: request-model fields first (`n` from number),
 * then merged parameters overwrite case-insensitively — so auto-merged `N` replaces `n`.
 */
export function buildTextEntryQueryParams(options: TextEntryQueryParams): Record<string, string> {
  const queryParams: Record<string, string> = {
    group: options.group,
    entry: options.entry,
    lang: options.lang,
  };

  if (options.project) {
    queryParams.project = options.project;
  }

  if (options.number !== undefined) {
    queryParams.n = formatNumberForQuery(options.number);
  }

  const mergedParameters = mergeNumberIntoParameters(options.number, options.parameters);
  if (mergedParameters) {
    for (const [key, value] of Object.entries(mergedParameters)) {
      if (value == null || value === '') {
        continue;
      }

      const existingKey = Object.keys(queryParams).find(
        candidate => candidate.toLowerCase() === key.toLowerCase()
      );
      if (existingKey) {
        delete queryParams[existingKey];
      }
      queryParams[key] = value;
    }
  }

  return queryParams;
}
