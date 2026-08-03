import { describe, it, expect, beforeAll } from 'vitest';
import { TranslaasService } from '@translaas/client';
import { DefaultLanguageProvider, LanguageResolver } from '@translaas/extensions';
import {
  buildClientOptions,
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
let service: TranslaasService;

describe.skipIf(!liveConfig)('Live API — TranslaasService.t()', () => {
  beforeAll(async () => {
    suiteConfig = await prepareLiveSuite(liveConfig);
    if (suiteConfig) {
      service = new TranslaasService({
        ...buildClientOptions(suiteConfig),
        languageResolver: new LanguageResolver([new DefaultLanguageProvider(FIXTURE_LANG)]),
      });
    }
  });

  it.skipIf(() => !suiteConfig)('translates with an explicit language', async ({ skip }) => {
    try {
      const result = await service.t(FIXTURE_GROUP, FIXTURE_ENTRY, FIXTURE_LANG);
      skipIfMissingFixture({ skip }, result, FIXTURE_ENTRY);
      expect(result.length).toBeGreaterThan(0);
    } catch (error) {
      skipIfSdkNotFound({ skip }, error);
      throw error;
    }
  });
});
