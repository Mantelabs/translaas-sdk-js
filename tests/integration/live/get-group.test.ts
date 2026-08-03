import { describe, it, expect, beforeAll } from 'vitest';
import {
  createLiveClient,
  FIXTURE_GROUP,
  FIXTURE_LANG,
  isSdkNotFound,
  loadLiveConfig,
  prepareLiveSuite,
  skipIfSdkNotFound,
  type LiveConfig,
} from './helpers';

const liveConfig = loadLiveConfig();
let suiteConfig: LiveConfig | null = null;
let client: ReturnType<typeof createLiveClient>;

describe.skipIf(!liveConfig)('Live API — getGroupAsync', () => {
  beforeAll(async () => {
    suiteConfig = await prepareLiveSuite(liveConfig);
    if (suiteConfig) {
      client = createLiveClient(suiteConfig);
    }
  });

  it.skipIf(() => !suiteConfig)('fetches an existing group', async ({ skip }) => {
    try {
      const group = await client.getGroupAsync(
        suiteConfig!.defaultProject,
        FIXTURE_GROUP,
        FIXTURE_LANG
      );
      if (!group.entries || Object.keys(group.entries).length === 0) {
        skip('fixture data not available in API');
      }
      expect(Object.keys(group.entries).length).toBeGreaterThan(0);
    } catch (error) {
      skipIfSdkNotFound({ skip }, error);
      throw error;
    }
  });

  it.skipIf(() => !suiteConfig)(
    'returns empty entries for a missing group (legacy API)',
    async () => {
      try {
        const group = await client.getGroupAsync(
          suiteConfig!.defaultProject,
          'nonexistent-group',
          FIXTURE_LANG
        );
        expect(group.entries).toEqual({});
      } catch (error) {
        if (isSdkNotFound(error)) {
          return;
        }
        throw error;
      }
    }
  );

  it.skipIf(() => !suiteConfig)(
    'returns empty entries for a missing project (legacy API)',
    async () => {
      try {
        const group = await client.getGroupAsync(
          'nonexistent-project',
          FIXTURE_GROUP,
          FIXTURE_LANG
        );
        expect(group.entries).toEqual({});
      } catch (error) {
        if (isSdkNotFound(error)) {
          return;
        }
        throw error;
      }
    }
  );
});
