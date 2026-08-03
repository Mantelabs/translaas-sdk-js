import { describe, it, expect, beforeAll } from 'vitest';
import { TranslaasClient } from '@translaas/client';
import {
  createLiveClient,
  FIXTURE_ENTRY,
  FIXTURE_GROUP,
  FIXTURE_LANG,
  loadLiveConfig,
  prepareLiveSuite,
  skipIfMissingFixture,
  skipIfSdkNotFound,
  type LiveConfig,
} from './helpers';

const liveConfig = loadLiveConfig();
let suiteConfig: LiveConfig | null = null;
let client: ReturnType<typeof createLiveClient>;

describe.skipIf(!liveConfig)('Live API — validateApiKeyAsync', () => {
  beforeAll(async () => {
    suiteConfig = await prepareLiveSuite(liveConfig);
    if (suiteConfig) {
      client = createLiveClient(suiteConfig);
    }
  });

  it.skipIf(() => !suiteConfig)('accepts a valid API key', async () => {
    const result = await client.validateApiKeyAsync();
    expect(result.isValid).toBe(true);
    expect(result.tenantId).toBeTruthy();
  });

  it.skipIf(() => !suiteConfig)(
    'resolves default project for single-project keys',
    async ({ skip }) => {
      const resolved = await TranslaasClient.createAsync({
        apiKey: suiteConfig!.apiKey,
        baseUrl: suiteConfig!.baseUrl,
      });

      const validation = await resolved.validateApiKeyAsync();
      if (!validation.projectId) {
        skip('API key is not single-project scoped');
      }

      try {
        const entry = await resolved.getEntryAsync(FIXTURE_GROUP, FIXTURE_ENTRY, FIXTURE_LANG);
        skipIfMissingFixture({ skip }, entry, FIXTURE_ENTRY);
        expect(entry.length).toBeGreaterThan(0);
      } catch (error) {
        skipIfSdkNotFound({ skip }, error);
        throw error;
      }
    }
  );
});
