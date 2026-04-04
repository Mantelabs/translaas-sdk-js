import type { SdkTranslationQueryParams, TranslationEntryValue } from './types';
import { TranslationGroup, TranslationProject } from './types';

const PROJECT_ROOT_METADATA = new Set([
  'project',
  'lang',
  'version',
  'generatedAt',
  'groupEntryContext',
  'groups',
]);

/**
 * Appends SDK query params to an existing {@link URLSearchParams} instance.
 */
export function appendSdkTranslationQueryParams(
  target: URLSearchParams,
  params?: SdkTranslationQueryParams
): void {
  if (!params) {
    return;
  }
  if (params.channel !== undefined && params.channel !== '') {
    target.set('channel', params.channel);
  }
  if (params.v !== undefined && params.v !== '') {
    target.set('v', params.v);
  }
  if (params.includeContext === true) {
    target.set('includeContext', 'true');
  } else if (params.includeContext === false) {
    target.set('includeContext', 'false');
  }
}

/**
 * Parses `GET …/group` JSON: {@link TranslationGroup} plus optional `entryContext` / `version` / `generatedAt`
 * from {@link GetGroupTranslationsResponse}. Supports legacy bare entry maps for backward compatibility.
 */
export function parseGroupTranslationsResponse(raw: unknown): TranslationGroup {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return new TranslationGroup();
  }
  const o = raw as Record<string, unknown>;

  if (o.entries !== null && typeof o.entries === 'object' && !Array.isArray(o.entries)) {
    return new TranslationGroup(o.entries as Record<string, TranslationEntryValue>, {
      entryContext: normalizeEntryContext(o.entryContext),
      version: typeof o.version === 'number' ? o.version : undefined,
      generatedAt: typeof o.generatedAt === 'string' ? o.generatedAt : undefined,
    });
  }

  return new TranslationGroup(raw as Record<string, TranslationEntryValue>);
}

function normalizeEntryContext(raw: unknown): Record<string, Record<string, string>> | undefined {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return undefined;
  }
  return raw as Record<string, Record<string, string>>;
}

function flatCompositeProjectJsonToProject(flat: Record<string, unknown>): TranslationProject {
  const groups: Record<string, Record<string, TranslationEntryValue>> = {};
  for (const [compositeKey, value] of Object.entries(flat)) {
    if (typeof value !== 'string') {
      continue;
    }
    const dot = compositeKey.indexOf('.');
    if (dot <= 0) {
      continue;
    }
    const g = compositeKey.slice(0, dot);
    const e = compositeKey.slice(dot + 1);
    if (!groups[g]) {
      groups[g] = {};
    }
    groups[g][e] = value;
  }
  return new TranslationProject(groups);
}

function isLikelyFlatCompositeProjectShape(o: Record<string, unknown>): boolean {
  const keys = Object.keys(o).filter(k => !PROJECT_ROOT_METADATA.has(k));
  if (keys.length === 0) {
    return false;
  }
  return keys.every(k => k.includes('.') && typeof o[k] === 'string');
}

function projectGroupsFromLegacyRoot(
  o: Record<string, unknown>
): Record<string, Record<string, TranslationEntryValue>> {
  const out: Record<string, Record<string, TranslationEntryValue>> = {};
  for (const [k, v] of Object.entries(o)) {
    if (PROJECT_ROOT_METADATA.has(k)) {
      continue;
    }
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = v as Record<string, TranslationEntryValue>;
    }
  }
  return out;
}

/**
 * Parses `GET …/project` JSON into {@link TranslationProject}.
 * Supports wrapped `groups`, `format=flat-json` composite keys, and legacy nested maps.
 */
export function parseProjectTranslationsResponse(
  raw: unknown,
  formatHint?: string
): TranslationProject {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return new TranslationProject();
  }
  const o = raw as Record<string, unknown>;

  if (typeof o.groups === 'object' && o.groups !== null && !Array.isArray(o.groups)) {
    return new TranslationProject(
      o.groups as Record<string, Record<string, TranslationEntryValue>>
    );
  }

  if (formatHint === 'flat-json' || (!('groups' in o) && isLikelyFlatCompositeProjectShape(o))) {
    return flatCompositeProjectJsonToProject(o);
  }

  return new TranslationProject(projectGroupsFromLegacyRoot(o));
}
