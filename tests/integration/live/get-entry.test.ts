import { describe, it, expect, beforeAll } from 'vitest';
import {
  createLiveClient,
  FIXTURE_ENTRY,
  FIXTURE_ENTRY_PLURAL,
  FIXTURE_GROUP,
  FIXTURE_GROUP_MESSAGES,
  FIXTURE_LANG,
  isSdkNotFound,
  loadLiveConfig,
  prepareLiveSuite,
  skipIfMissingFixture,
  skipIfSdkNotFound,
  type LiveConfig,
} from './helpers';

const liveConfig = loadLiveConfig();
let suiteConfig: LiveConfig | null = null;
let client: ReturnType<typeof createLiveClient>;

describe.skipIf(!liveConfig)('Live API — getEntryAsync', () => {
  beforeAll(async () => {
    suiteConfig = await prepareLiveSuite(liveConfig);
    if (suiteConfig) {
      client = createLiveClient(suiteConfig);
    }
  });

  it.skipIf(() => !suiteConfig)('fetches an existing entry', async ({ skip }) => {
    try {
      const result = await client.getEntryAsync(FIXTURE_GROUP, FIXTURE_ENTRY, FIXTURE_LANG);
      skipIfMissingFixture({ skip }, result, FIXTURE_ENTRY);
      expect(result.length).toBeGreaterThan(0);
    } catch (error) {
      skipIfSdkNotFound({ skip }, error);
      throw error;
    }
  });

  it.skipIf(() => !suiteConfig)('fetches an entry with pluralization', async ({ skip }) => {
    try {
      const result = await client.getEntryAsync(
        FIXTURE_GROUP_MESSAGES,
        FIXTURE_ENTRY_PLURAL,
        FIXTURE_LANG,
        5
      );
      skipIfMissingFixture({ skip }, result, FIXTURE_ENTRY_PLURAL);
      expect(result.length).toBeGreaterThan(0);
    } catch (error) {
      skipIfSdkNotFound({ skip }, error);
      throw error;
    }
  });

  it.skipIf(() => !suiteConfig)('returns the entry key when not found (legacy API)', async () => {
    const entry = 'nonexistent.entry';
    try {
      const result = await client.getEntryAsync('nonexistent', entry, FIXTURE_LANG);
      expect(result).toBe(entry);
    } catch (error) {
      if (isSdkNotFound(error)) {
        return;
      }
      throw error;
    }
  });
});
