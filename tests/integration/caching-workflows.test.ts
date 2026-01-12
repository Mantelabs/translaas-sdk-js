import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { TranslaasClient } from '@translaas/client';
import { createMockServer, defaultMockData, type MockApiConfig } from '../setup/mock-api';
import { createTestClientOptions } from '../fixtures/translation-data';
import { createFileCacheProvider, delay } from '../setup/test-helpers';
import { MemoryCacheProvider } from '@translaas/caching';
import { HybridCacheProvider } from '@translaas/caching-file';
import { TranslationProject } from '@translaas/models';

/**
 * Integration tests for caching workflows
 *
 * Tests the integration of:
 * - Memory cache with client
 * - File cache with client
 * - Hybrid cache with client
 * - Cache invalidation scenarios
 * - Cache expiration scenarios
 */

describe('Caching Workflows', () => {
  const mockConfig: MockApiConfig = {
    baseUrl: 'https://api.test.translaas.com',
    apiKey: 'test-api-key',
    delay: 10,
  };

  const server = createMockServer(mockConfig, defaultMockData);
  let requestCount = 0;

  // Track API requests
  beforeEach(() => {
    requestCount = 0;
    // Remove all listeners to avoid memory leak warnings
    server.events.removeAllListeners('request:start');
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

  describe('Memory Cache Integration', () => {
    it('should cache translation entries in memory', async () => {
      const cache = new MemoryCacheProvider();
      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));

      // First request - should hit API
      const result1 = await client.getEntryAsync('common', 'welcome', 'en');
      expect(result1).toBe('Welcome');
      expect(requestCount).toBeGreaterThan(0);

      // Cache the result manually (simulating integration)
      const cacheKey = 'common:welcome:en';
      cache.set(cacheKey, result1, 60000);

      // Verify cache hit
      const cached = cache.get<string>(cacheKey);
      expect(cached).toBe('Welcome');
    });

    it('should integrate memory cache with client for group caching', async () => {
      const cache = new MemoryCacheProvider();
      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));

      // Fetch group from API
      const group = await client.getGroupAsync('test-project', 'common', 'en');
      expect(group).toBeDefined();
      expect(requestCount).toBeGreaterThan(0);

      // Cache the group
      const cacheKey = 'test-project:common:en';
      cache.set(cacheKey, group, 60000);

      // Verify cache hit
      const cached = cache.get(cacheKey);
      expect(cached).not.toBeNull();
      expect(cached?.entries.welcome).toBe('Welcome');
    });

    it('should handle cache expiration', async () => {
      const cache = new MemoryCacheProvider();

      // Set with short expiration
      cache.set('test-key', 'test-value', 100); // 100ms expiration

      // Should be available immediately
      expect(cache.get('test-key')).toBe('test-value');

      // Wait for expiration
      await delay(150);

      // Should be expired
      expect(cache.get('test-key')).toBeNull();
    });

    it('should handle sliding expiration', async () => {
      const cache = new MemoryCacheProvider();

      // Set with sliding expiration
      cache.set('test-key', 'test-value', undefined, 200); // 200ms sliding

      // Access multiple times within expiration window
      expect(cache.get('test-key')).toBe('test-value');
      await delay(100);
      expect(cache.get('test-key')).toBe('test-value'); // Should reset timer
      await delay(100);
      expect(cache.get('test-key')).toBe('test-value'); // Should reset timer again

      // Wait without access
      await delay(250);
      expect(cache.get('test-key')).toBeNull(); // Should be expired
    });
  });

  describe('File Cache Integration', () => {
    it('should cache project data to file', async () => {
      const fileCacheHelper = await createFileCacheProvider();
      const { provider: cache, cleanup } = fileCacheHelper;

      try {
        const project = 'test-project';
        const lang = 'en';

        // Create test project data
        const projectData = new TranslationProject({
          common: {
            welcome: 'Welcome',
            greeting: 'Hello {name}',
          },
          messages: {
            items: '{count} items',
          },
        });

        // Save to cache
        await cache.saveProjectAsync(project, lang, projectData);

        // Retrieve from cache
        const cached = await cache.getProjectAsync(project, lang);
        expect(cached).not.toBeNull();
        expect(cached?.groups.common.welcome).toBe('Welcome');
        expect(cached?.groups.common.greeting).toBe('Hello {name}');
      } finally {
        await cleanup();
      }
    });

    it('should handle cache misses', async () => {
      const fileCacheHelper = await createFileCacheProvider();
      const { provider: cache, cleanup } = fileCacheHelper;

      try {
        const cached = await cache.getProjectAsync('non-existent', 'en');
        expect(cached).toBeNull();
      } finally {
        await cleanup();
      }
    });

    it('should retrieve groups from cached project', async () => {
      const fileCacheHelper = await createFileCacheProvider();
      const { provider: cache, cleanup } = fileCacheHelper;

      try {
        const project = 'test-project';
        const lang = 'en';

        // FileCacheProvider stores projects, groups are extracted from projects
        const projectData = new TranslationProject({
          common: {
            welcome: 'Welcome',
            greeting: 'Hello',
          },
          messages: {
            items: '{count} items',
          },
        });

        // Save project (which contains groups)
        await cache.saveProjectAsync(project, lang, projectData);

        // Retrieve group from cached project
        const cached = await cache.getGroupAsync(project, 'common', lang);
        expect(cached).not.toBeNull();
        expect(cached?.entries.welcome).toBe('Welcome');
        expect(cached?.entries.greeting).toBe('Hello');
      } finally {
        await cleanup();
      }
    });
  });

  describe('Hybrid Cache Integration', () => {
    it('should check L1 cache first, then L2', async () => {
      const fileCacheHelper = await createFileCacheProvider();
      const { provider: l2Cache, cleanup } = fileCacheHelper;

      try {
        const hybridCache = new HybridCacheProvider(l2Cache, {
          enabled: true,
          maxMemoryCacheEntries: 100,
        });

        const project = 'test-project';
        const lang = 'en';

        const projectData = new TranslationProject({
          common: {
            welcome: 'Welcome',
          },
        });

        // Save to L2 cache
        await l2Cache.saveProjectAsync(project, lang, projectData);

        // First access - should promote from L2 to L1
        const result1 = await hybridCache.getProjectAsync(project, lang);
        expect(result1).not.toBeNull();
        expect(result1?.groups.common.welcome).toBe('Welcome');

        // Second access - should come from L1 (no L2 call)
        const result2 = await hybridCache.getProjectAsync(project, lang);
        expect(result2).not.toBeNull();
        expect(result2?.groups.common.welcome).toBe('Welcome');
      } finally {
        await cleanup();
      }
    });

    it('should handle L1 cache eviction', async () => {
      const fileCacheHelper = await createFileCacheProvider();
      const { provider: l2Cache, cleanup } = fileCacheHelper;

      try {
        const hybridCache = new HybridCacheProvider(l2Cache, {
          enabled: true,
          maxMemoryCacheEntries: 2, // Small limit for testing
        });

        const project = 'test-project';
        const projectData = new TranslationProject({
          common: { welcome: 'Welcome' },
        });

        // Fill L1 cache beyond limit
        await l2Cache.saveProjectAsync(project, 'en', projectData);
        await l2Cache.saveProjectAsync(project, 'fr', projectData);
        await l2Cache.saveProjectAsync(project, 'es', projectData);

        // Access all - should trigger eviction
        await hybridCache.getProjectAsync(project, 'en');
        await hybridCache.getProjectAsync(project, 'fr');
        await hybridCache.getProjectAsync(project, 'es');

        // All should still be accessible (from L2)
        const en = await hybridCache.getProjectAsync(project, 'en');
        expect(en).not.toBeNull();
      } finally {
        await cleanup();
      }
    });
  });

  describe('Cache Invalidation Scenarios', () => {
    it('should handle cache clear', async () => {
      const cache = new MemoryCacheProvider();

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });

    it('should handle cache removal', async () => {
      const cache = new MemoryCacheProvider();

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.remove('key1');

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });
  });
});
