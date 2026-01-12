import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { TranslaasClient } from '@translaas/client';
import { TranslaasService } from '@translaas/client';
import { MemoryCacheProvider } from '@translaas/caching';
import { HybridCacheProvider } from '@translaas/caching-file';
import { LanguageResolver } from '@translaas/extensions';
import { DefaultLanguageProvider } from '@translaas/extensions';
import { createMockServer, defaultMockData, type MockApiConfig } from '../setup/mock-api';
import { createTestClientOptions } from '../fixtures/translation-data';
import { createFileCacheProvider, delay } from '../setup/test-helpers';
import { TranslationProject } from '@translaas/models';

/**
 * Full stack integration tests
 *
 * Tests the complete integration of:
 * - Service → Client → Cache → API
 * - Client + Memory Cache integration
 * - Client + File Cache integration
 * - Client + Hybrid Cache integration
 * - Service + Language Resolver + Cache integration
 */

describe('Full Stack Integration', () => {
  const mockConfig: MockApiConfig = {
    baseUrl: 'https://api.test.translaas.com',
    apiKey: 'test-api-key',
    delay: 10,
  };

  const server = createMockServer(mockConfig, defaultMockData);
  let requestCount = 0;

  beforeEach(() => {
    requestCount = 0;
    server.events.on('request:start', () => {
      requestCount++;
    });
  });

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('Client + Memory Cache Integration', () => {
    it('should integrate client with memory cache for project caching', async () => {
      const memoryCache = new MemoryCacheProvider();
      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      const project = 'test-project';
      const lang = 'en';

      // First request - fetch from API and cache
      const project1 = await client.getProjectAsync(project, lang);
      expect(project1).toBeDefined();
      expect(requestCount).toBeGreaterThan(0);

      // Cache the project
      const cacheKey = `${project}:${lang}`;
      memoryCache.set(cacheKey, project1, 60000); // 1 minute expiration

      // Second request - should use cache (simulated by checking cache directly)
      const cached = memoryCache.get<TranslationProject>(cacheKey);
      expect(cached).not.toBeNull();
      expect(cached?.groups.common.welcome).toBe('Welcome');
    });

    it('should handle cache expiration with client requests', async () => {
      const memoryCache = new MemoryCacheProvider();
      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      const project = 'test-project';
      const lang = 'en';

      // Fetch and cache with short expiration
      const project1 = await client.getProjectAsync(project, lang);
      const cacheKey = `${project}:${lang}`;
      memoryCache.set(cacheKey, project1, 100); // 100ms expiration

      // Should be in cache immediately
      expect(memoryCache.get<TranslationProject>(cacheKey)).not.toBeNull();

      // Wait for expiration
      await delay(150);

      // Should be expired
      expect(memoryCache.get<TranslationProject>(cacheKey)).toBeNull();
    });
  });

  describe('Client + File Cache Integration', () => {
    it('should integrate client with file cache for offline support', async () => {
      const fileCacheHelper = await createFileCacheProvider();
      const { provider: fileCache, cleanup } = fileCacheHelper;

      try {
        const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
        const project = 'test-project';
        const lang = 'en';

        // Fetch from API
        const project1 = await client.getProjectAsync(project, lang);
        expect(project1).toBeDefined();

        // Save to file cache
        await fileCache.saveProjectAsync(project, lang, project1);

        // Retrieve from cache
        const cached = await fileCache.getProjectAsync(project, lang);
        expect(cached).not.toBeNull();
        expect(cached?.groups.common.welcome).toBe('Welcome');
        expect(cached?.groups.common.greeting).toBe('Hello {name}');
      } finally {
        await cleanup();
      }
    });

    it('should handle cache misses gracefully', async () => {
      const fileCacheHelper = await createFileCacheProvider();
      const { provider: fileCache, cleanup } = fileCacheHelper;

      try {
        const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));

        // Try to get non-existent project from cache
        const cached = await fileCache.getProjectAsync('non-existent', 'en');
        expect(cached).toBeNull();

        // Fetch from API as fallback
        const project = await client.getProjectAsync('test-project', 'en');
        expect(project).toBeDefined();
      } finally {
        await cleanup();
      }
    });
  });

  describe('Client + Hybrid Cache Integration', () => {
    it('should integrate client with hybrid cache (L1 + L2)', async () => {
      const fileCacheHelper = await createFileCacheProvider();
      const { provider: l2Cache, cleanup } = fileCacheHelper;

      try {
        const hybridCache = new HybridCacheProvider(l2Cache, {
          enabled: true,
          maxMemoryCacheEntries: 100,
        });

        const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
        const project = 'test-project';
        const lang = 'en';

        // Fetch from API
        const project1 = await client.getProjectAsync(project, lang);
        expect(project1).toBeDefined();

        // Save to L2 cache
        await l2Cache.saveProjectAsync(project, lang, project1);

        // First access - should promote from L2 to L1
        const cached1 = await hybridCache.getProjectAsync(project, lang);
        expect(cached1).not.toBeNull();
        expect(cached1?.groups.common.welcome).toBe('Welcome');

        // Second access - should come from L1
        const cached2 = await hybridCache.getProjectAsync(project, lang);
        expect(cached2).not.toBeNull();
        expect(cached2?.groups.common.welcome).toBe('Welcome');
      } finally {
        await cleanup();
      }
    });

    it('should handle L1 cache eviction and fallback to L2', async () => {
      const fileCacheHelper = await createFileCacheProvider();
      const { provider: l2Cache, cleanup } = fileCacheHelper;

      try {
        const hybridCache = new HybridCacheProvider(l2Cache, {
          enabled: true,
          maxMemoryCacheEntries: 2, // Small limit
        });

        const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
        const project = 'test-project';

        // Fetch and cache multiple languages
        const projectEn = await client.getProjectAsync(project, 'en');
        const projectFr = await client.getProjectAsync(project, 'fr');
        const projectEs = await client.getProjectAsync(project, 'es');

        // Save all to L2
        await l2Cache.saveProjectAsync(project, 'en', projectEn);
        await l2Cache.saveProjectAsync(project, 'fr', projectFr);
        await l2Cache.saveProjectAsync(project, 'es', projectEs);

        // Access all - should trigger L1 eviction
        const en1 = await hybridCache.getProjectAsync(project, 'en');
        expect(en1).not.toBeNull();

        const fr1 = await hybridCache.getProjectAsync(project, 'fr');
        expect(fr1).not.toBeNull();

        const es1 = await hybridCache.getProjectAsync(project, 'es');
        expect(es1).not.toBeNull();

        // All should still be accessible from L2 (even if evicted from L1)
        const en2 = await hybridCache.getProjectAsync(project, 'en');
        const fr2 = await hybridCache.getProjectAsync(project, 'fr');
        const es2 = await hybridCache.getProjectAsync(project, 'es');

        expect(en2).not.toBeNull();
        expect(fr2).not.toBeNull();
        expect(es2).not.toBeNull();
      } finally {
        await cleanup();
      }
    });
  });

  describe('Service + Language Resolver + Cache Integration', () => {
    it('should integrate service with language resolver and cache', async () => {
      const memoryCache = new MemoryCacheProvider();
      const resolver = new LanguageResolver([new DefaultLanguageProvider('fr')]);
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        languageResolver: resolver,
      });

      // Translate using service (language resolved automatically)
      const result = await service.t('common', 'welcome');
      expect(result).toBe('Bienvenue');

      // Cache the result (simulated)
      const cacheKey = 'common:welcome:fr';
      memoryCache.set(cacheKey, result, 60000);
      expect(memoryCache.get(cacheKey)).toBe('Bienvenue');
    });

    it('should handle language resolution with cache fallback', async () => {
      const fileCacheHelper = await createFileCacheProvider();
      const { provider: fileCache, cleanup } = fileCacheHelper;

      try {
        const resolver = new LanguageResolver([new DefaultLanguageProvider('en')]);
        const service = new TranslaasService({
          ...createTestClientOptions(mockConfig.baseUrl),
          languageResolver: resolver,
        });

        // Fetch and cache project
        const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
        const project = await client.getProjectAsync('test-project', 'en');
        await fileCache.saveProjectAsync('test-project', 'en', project);

        // Service should work with resolver
        const result = await service.t('common', 'welcome');
        expect(result).toBe('Welcome');

        // Cache should be available
        const cached = await fileCache.getProjectAsync('test-project', 'en');
        expect(cached).not.toBeNull();
      } finally {
        await cleanup();
      }
    });
  });

  describe('End-to-End Workflow', () => {
    it('should handle complete translation workflow with caching', async () => {
      const fileCacheHelper = await createFileCacheProvider();
      const { provider: fileCache, cleanup } = fileCacheHelper;

      try {
        const resolver = new LanguageResolver([new DefaultLanguageProvider('en')]);
        const service = new TranslaasService({
          ...createTestClientOptions(mockConfig.baseUrl),
          languageResolver: resolver,
        });

        // Step 1: First translation request (API call)
        const result1 = await service.t('common', 'welcome');
        expect(result1).toBe('Welcome');
        expect(requestCount).toBeGreaterThan(0);

        // Step 2: Cache the project
        const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
        const project = await client.getProjectAsync('test-project', 'en');
        await fileCache.saveProjectAsync('test-project', 'en', project);

        // Step 3: Subsequent requests should work
        const result2 = await service.t('common', 'greeting', 'en', undefined, {
          name: 'Alice',
        });
        expect(result2).toBe('Hello Alice');
      } finally {
        await cleanup();
      }
    });

    it('should handle multiple languages with caching', async () => {
      const fileCacheHelper = await createFileCacheProvider();
      const { provider: fileCache, cleanup } = fileCacheHelper;

      try {
        const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
        const project = 'test-project';

        // Fetch and cache multiple languages
        const en = await client.getProjectAsync(project, 'en');
        const fr = await client.getProjectAsync(project, 'fr');
        const es = await client.getProjectAsync(project, 'es');

        await fileCache.saveProjectAsync(project, 'en', en);
        await fileCache.saveProjectAsync(project, 'fr', fr);
        await fileCache.saveProjectAsync(project, 'es', es);

        // Verify all are cached
        const cachedEn = await fileCache.getProjectAsync(project, 'en');
        const cachedFr = await fileCache.getProjectAsync(project, 'fr');
        const cachedEs = await fileCache.getProjectAsync(project, 'es');

        expect(cachedEn?.groups.common.welcome).toBe('Welcome');
        expect(cachedFr?.groups.common.welcome).toBe('Bienvenue');
        expect(cachedEs?.groups.common.welcome).toBe('Bienvenido');
      } finally {
        await cleanup();
      }
    });
  });
});
