import { describe, it, expect, beforeAll } from 'vitest';
import {
  createLiveClient,
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

describe.skipIf(!liveConfig)('Live API — getProjectAsync', () => {
  beforeAll(async () => {
    suiteConfig = await prepareLiveSuite(liveConfig);
    if (suiteConfig) {
      client = createLiveClient(suiteConfig);
    }
  });

  it.skipIf(() => !suiteConfig)('fetches an existing project', async ({ skip }) => {
    try {
      const project = await client.getProjectAsync(suiteConfig!.defaultProject, FIXTURE_LANG);
      if (!project.groups || Object.keys(project.groups).length === 0) {
        skip('fixture data not available in API');
      }
      expect(Object.keys(project.groups).length).toBeGreaterThan(0);
    } catch (error) {
      skipIfSdkNotFound({ skip }, error);
      throw error;
    }
  });

  it.skipIf(() => !suiteConfig)(
    'returns empty groups for a missing project (legacy API)',
    async () => {
      try {
        const project = await client.getProjectAsync('nonexistent-project', FIXTURE_LANG);
        expect(project.groups).toEqual({});
      } catch (error) {
        if (isSdkNotFound(error)) {
          return;
        }
        throw error;
      }
    }
  );
});
