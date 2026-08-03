import { describe, it, expect, beforeAll } from 'vitest';
import { TranslaasApiException } from '@translaas/models';
import {
  createLiveClient,
  FIXTURE_ENTRY,
  FIXTURE_GROUP,
  FIXTURE_LANG,
  isSdkNotFound,
  loadLiveConfig,
  prepareLiveSuite,
  type LiveConfig,
} from './helpers';

const liveConfig = loadLiveConfig();
let suiteConfig: LiveConfig | null = null;

describe.skipIf(!liveConfig)('Live API — error scenarios', () => {
  beforeAll(async () => {
    suiteConfig = await prepareLiveSuite(liveConfig);
  });

  it.skipIf(() => !suiteConfig)('rejects an invalid API key', async () => {
    const client = createLiveClient(suiteConfig!, { apiKey: 'invalid-api-key-12345' });

    await expect(
      client.getEntryAsync(FIXTURE_GROUP, FIXTURE_ENTRY, FIXTURE_LANG)
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(TranslaasApiException);
      const status = (error as TranslaasApiException).statusCode;
      expect(status === 401 || status === 403).toBe(true);
      return true;
    });
  });

  it.skipIf(() => !suiteConfig)('fails against an invalid base URL', async () => {
    const client = createLiveClient(suiteConfig!, {
      baseUrl: 'https://invalid-url-that-does-not-exist-12345.com',
    });

    await expect(
      client.getEntryAsync(FIXTURE_GROUP, FIXTURE_ENTRY, FIXTURE_LANG)
    ).rejects.toBeInstanceOf(TranslaasApiException);
  });

  it.skipIf(() => !suiteConfig)('times out on slow requests', async () => {
    const client = createLiveClient(suiteConfig!, { timeout: 1 });

    await expect(
      client.getEntryAsync(FIXTURE_GROUP, FIXTURE_ENTRY, FIXTURE_LANG)
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(TranslaasApiException);
      const message = (error as TranslaasApiException).message.toLowerCase();
      expect(message.includes('timed out') || message.includes('cancelled')).toBe(true);
      return true;
    });
  });

  it.skipIf(() => !suiteConfig)(
    'returns the entry key when group is missing (legacy API)',
    async () => {
      const client = createLiveClient(suiteConfig!);
      const entry = 'nonexistent-entry';

      try {
        const result = await client.getEntryAsync('nonexistent-group', entry, 'nonexistent-lang');
        expect(result).toBe(entry);
      } catch (error) {
        if (isSdkNotFound(error)) {
          return;
        }
        throw error;
      }
    }
  );
});
