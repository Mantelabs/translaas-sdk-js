export interface ResolvedServiceTArgs {
  lang?: string;
  number?: number;
  parameters?: Record<string, string>;
  project?: string;
  cancellationToken?: AbortSignal;
}

function isAbortSignal(value: unknown): value is AbortSignal {
  return typeof AbortSignal !== 'undefined' && value instanceof AbortSignal;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' && value !== null && !Array.isArray(value) && !isAbortSignal(value)
  );
}

function normalizeParameters(value: Record<string, unknown>): {
  parameters: Record<string, string>;
  number?: number;
} {
  const parameters: Record<string, string> = {};
  let number: number | undefined;

  for (const [key, raw] of Object.entries(value)) {
    if (raw == null) {
      continue;
    }
    if (key === 'number' && typeof raw === 'number' && Number.isFinite(raw)) {
      number = raw;
      continue;
    }
    parameters[key] = String(raw);
  }

  return { parameters, number };
}

function parseTrailingArgs(
  projectOrCancellation?: string | AbortSignal,
  cancellationToken?: AbortSignal
): Pick<ResolvedServiceTArgs, 'project' | 'cancellationToken'> {
  if (projectOrCancellation === undefined) {
    return { cancellationToken };
  }
  if (isAbortSignal(projectOrCancellation)) {
    return { cancellationToken: projectOrCancellation };
  }
  return { project: projectOrCancellation, cancellationToken };
}

/**
 * Normalizes positional `TranslaasService.t()` arguments to match .NET `ITranslaasService.T`.
 *
 * Supports `t(group, entry, number)` with automatic language resolution, plus
 * `t(group, entry, { number: 5, name: 'John' })` style parameter objects.
 */
export function resolveServiceTArgs(
  langOrNumberOrParams?: string | number | Record<string, string | number>,
  numberOrParams?: number | Record<string, string | number>,
  parameters?: Record<string, string>,
  projectOrCancellation?: string | AbortSignal,
  cancellationToken?: AbortSignal
): ResolvedServiceTArgs {
  const trailing = parseTrailingArgs(projectOrCancellation, cancellationToken);
  let lang: string | undefined;
  let number: number | undefined;
  let resolvedParameters = parameters;

  if (typeof langOrNumberOrParams === 'number' && Number.isFinite(langOrNumberOrParams)) {
    number = langOrNumberOrParams;
  } else if (typeof langOrNumberOrParams === 'string') {
    lang = langOrNumberOrParams;
  } else if (isPlainRecord(langOrNumberOrParams)) {
    const normalized = normalizeParameters(langOrNumberOrParams);
    resolvedParameters = { ...normalized.parameters, ...(resolvedParameters ?? {}) };
    number = normalized.number ?? number;
  }

  if (typeof numberOrParams === 'number' && Number.isFinite(numberOrParams)) {
    number = numberOrParams;
  } else if (isPlainRecord(numberOrParams)) {
    const normalized = normalizeParameters(numberOrParams);
    resolvedParameters = { ...normalized.parameters, ...(resolvedParameters ?? {}) };
    number = normalized.number ?? number;
  }

  return {
    lang,
    number,
    parameters: resolvedParameters,
    ...trailing,
  };
}
