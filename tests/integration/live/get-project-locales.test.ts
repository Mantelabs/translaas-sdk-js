import { describe, it, expect, beforeAll } from 'vitest';
import {
  COMMON_LOCALES,
  createLiveClient,
  loadLiveConfig,
  prepareLiveSuite,
  isSdkNotFound,
  skipIfSdkNotFound,
  type LiveConfig,
} from './helpers';

const liveConfig = loadLiveConfig();
let suiteConfig: LiveConfig | null = null;
let client: ReturnType<typeof createLiveClient>;

describe.skipIf(!liveConfig)('Live API — getProjectLocalesAsync', () => {
  beforeAll(async () => {
    suiteConfig = await prepareLiveSuite(liveConfig);
    if (suiteConfig) {
      client = createLiveClient(suiteConfig);
    }
  });

  it.skipIf(() => !suiteConfig)('fetches locales for an existing project', async ({ skip }) => {
    try {
      const locales = await client.getProjectLocalesAsync(suiteConfig!.defaultProject);
      if (!locales.locales || locales.locales.length === 0) {
        skip('fixture data not available in API');
      }
      expect(locales.locales.length).toBeGreaterThan(0);
    } catch (error) {
      skipIfSdkNotFound({ skip }, error);
      throw error;
    }
  });

  it.skipIf(() => !suiteConfig)(
    'includes at least one common locale when fixture data is seeded',
    async ({ skip }) => {
      try {
        const locales = await client.getProjectLocalesAsync(suiteConfig!.defaultProject);
        if (!locales.locales || locales.locales.length === 0) {
          skip('fixture data not available in API');
        }

        const found = locales.locales.some(locale =>
          COMMON_LOCALES.includes(locale as (typeof COMMON_LOCALES)[number])
        );
        if (!found) {
          skip(`expected at least one common locale in ${locales.locales.join(', ')}`);
        }
        expect(found).toBe(true);
      } catch (error) {
        skipIfSdkNotFound({ skip }, error);
        throw error;
      }
    }
  );

  it.skipIf(() => !suiteConfig)(
    'returns empty locales for a missing project (legacy API)',
    async () => {
      try {
        const locales = await client.getProjectLocalesAsync('nonexistent-project');
        expect(locales.locales).toEqual([]);
      } catch (error) {
        if (isSdkNotFound(error)) {
          return;
        }
        throw error;
      }
    }
  );
});
