import { TranslaasClient } from '@translaas/client';
import type { TranslaasOptions } from '@translaas/models';
import { TranslaasApiException } from '@translaas/models';
import {
  testEntry,
  testGroup,
  testPluralEntry,
  testPluralGroup,
  testProject,
} from '../../fixtures/translation-data';

/** Fixture ids aligned with translaas-sdk-examples (translaas_sdk_samples_strings.csv). */
export const DEFAULT_BASE_URL = 'https://api.translaas.local';
export const DEFAULT_PROJECT = testProject;
export const FIXTURE_GROUP = testGroup;
export const FIXTURE_GROUP_MESSAGES = testPluralGroup;
export const FIXTURE_ENTRY = testEntry;
export const FIXTURE_ENTRY_PLURAL = testPluralEntry;
export const FIXTURE_LANG = 'en';
export const COMMON_LOCALES = ['en', 'fr', 'es', 'de'] as const;

export const SDK_NOT_FOUND_SKIP_MESSAGE =
  'SDK resource not found (HTTP 404) — set TRANSLAAS_DEFAULT_PROJECT to an existing project id (default: translaas-sdk-samples)';

export interface LiveConfig {
  apiKey: string;
  baseUrl: string;
  defaultProject: string;
}

export function loadLiveConfig(): LiveConfig | null {
  const apiKey = process.env.TRANSLAAS_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const baseUrl = process.env.TRANSLAAS_BASE_URL?.trim() || DEFAULT_BASE_URL;
  const defaultProject = process.env.TRANSLAAS_DEFAULT_PROJECT?.trim() || DEFAULT_PROJECT;

  return { apiKey, baseUrl, defaultProject };
}

export function buildClientOptions(
  config: LiveConfig,
  overrides: Partial<TranslaasOptions> = {}
): TranslaasOptions {
  return {
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    defaultProjectId: config.defaultProject,
    timeout: 30_000,
    ...overrides,
  };
}

export function createLiveClient(
  config: LiveConfig,
  overrides: Partial<TranslaasOptions> = {}
): TranslaasClient {
  return new TranslaasClient(buildClientOptions(config, overrides));
}

export function isSdkNotFound(error: unknown): boolean {
  return error instanceof TranslaasApiException && error.statusCode === 404;
}

export function skipIfSdkNotFound(
  task: { skip: (note?: string | boolean) => void },
  error: unknown
): void {
  if (isSdkNotFound(error)) {
    task.skip(SDK_NOT_FOUND_SKIP_MESSAGE);
  }
}

export function skipIfMissingFixture(
  task: { skip: (note?: string | boolean) => void },
  value: string | undefined | null,
  entryKey: string
): void {
  if (!value || value === entryKey) {
    task.skip('fixture data not available in API');
  }
}

let reachability: boolean | null = null;

function isTransportFailure(error: TranslaasApiException): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('fetch failed') ||
    message.includes('network error') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('certificate') ||
    message.includes('unable to verify')
  );
}

export async function ensureApiReachable(config: LiveConfig): Promise<boolean> {
  if (reachability !== null) {
    return reachability;
  }

  const client = createLiveClient(config, { timeout: 5_000 });
  try {
    await client.validateApiKeyAsync();
    reachability = true;
  } catch (error) {
    if (error instanceof TranslaasApiException) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        reachability = true;
        return reachability;
      }
      if (isTransportFailure(error)) {
        reachability = false;
        return reachability;
      }
      reachability = true;
      return reachability;
    }
    reachability = false;
  }

  return reachability;
}

export async function prepareLiveSuite(config: LiveConfig | null): Promise<LiveConfig | null> {
  if (!config) {
    return null;
  }
  if (!(await ensureApiReachable(config))) {
    return null;
  }
  return config;
}
