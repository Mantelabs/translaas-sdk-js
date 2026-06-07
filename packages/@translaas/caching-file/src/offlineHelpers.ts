import { PluralCategory } from '@translaas/models';

/** Matches .NET offline `DeterminePluralCategory` (one/other only). */
export function determinePluralCategory(number: number | undefined): PluralCategory {
  if (number === undefined) {
    return PluralCategory.Other;
  }
  return number === 1 ? PluralCategory.One : PluralCategory.Other;
}

function getParamValue(parameters: Record<string, string>, name: string): string | undefined {
  if (Object.prototype.hasOwnProperty.call(parameters, name)) {
    return parameters[name];
  }
  const match = Object.entries(parameters).find(
    ([key]) => key.toLowerCase() === name.toLowerCase()
  );
  return match?.[1];
}

function hasParamKey(parameters: Record<string, string>, name: string): boolean {
  return getParamValue(parameters, name) !== undefined;
}

/** Mirrors .NET offline `SubstituteParameters` ({name} placeholders only). */
export function substituteParameters(
  template: string,
  parameters?: Record<string, string>,
  number?: number
): string {
  const merged: Record<string, string> = { ...(parameters ?? {}) };
  if (number !== undefined && !hasParamKey(merged, 'N')) {
    merged.N = String(number);
  }

  if (Object.keys(merged).length === 0) {
    return template;
  }

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name: string) => {
    const value = getParamValue(merged, name);
    return value !== undefined ? value : match;
  });
}
