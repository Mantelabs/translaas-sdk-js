import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { HybridCacheProvider } from '../HybridCacheProvider';
import { FileCacheProvider } from '../FileCacheProvider';
import {
  TranslaasOfflineCacheException,
  TranslationProject,
  TranslationGroup,
} from '@translaas/models';

describe('HybridCacheProvider', () => {
  let cacheDir: string;
  let l2Cache: FileCacheProvider;
  let provider: HybridCacheProvider;

  beforeEach(async () => {
    cacheDir = join(process.cwd(), '.test-cache', `hybrid-test-${Date.now()}-${Math.random()}`);
    l2Cache = new FileCacheProvider(cacheDir);
    provider = new HybridCacheProvider(l2Cache, {
      enabled: true,
      memoryCacheExpiration: 1000, // 1 second for testing
      maxMemoryCacheEntries: 10, // Small limit for testing eviction
    });
  });

  afterEach(async () => {
    try {
      await fs.rm(cacheDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('constructor', () => {
    it('should create instance with L2 cache and options', () => {
      expect(provider).toBeInstanceOf(HybridCacheProvider);
    });

    it('should throw when hybrid cache is disabled', () => {
      expect(() => {
        new HybridCacheProvider(l2Cache, { enabled: false });
      }).toThrow(TranslaasOfflineCacheException);
    });

    it('should use default options when not provided', () => {
      const defaultProvider = new HybridCacheProvider(l2Cache);
      expect(defaultProvider).toBeInstanceOf(HybridCacheProvider);
    });
  });

  describe('getProjectAsync - L1 hit', () => {
    it('should return from L1 cache when available', async () => {
      const project = new TranslationProject({
        common: { welcome: 'Welcome' },
      });

      // Save to both caches
      await provider.saveProjectAsync('test-project', 'en', project);

      // Clear L2 to ensure we're reading from L1
      await l2Cache.clearAllAsync();

      const result = await provider.getProjectAsync('test-project', 'en');
      expect(result).toBeInstanceOf(TranslationProject);
      expect(result?.groups).toEqual(project.groups);
    });

    it('should update LRU on L1 hit', async () => {
      const project = new TranslationProject({ test: { key: 'value' } });
      await provider.saveProjectAsync('test-project', 'en', project);

      // Access multiple times
      await provider.getProjectAsync('test-project', 'en');
      await provider.getProjectAsync('test-project', 'en');
      await provider.getProjectAsync('test-project', 'en');

      // Should still be in L1
      await l2Cache.clearAllAsync();
      const result = await provider.getProjectAsync('test-project', 'en');
      expect(result).toBeInstanceOf(TranslationProject);
    });
  });

  describe('getProjectAsync - L1 miss → L2 hit', () => {
    it('should check L2 cache on L1 miss', async () => {
      const project = new TranslationProject({
        common: { welcome: 'Welcome' },
      });

      // Save only to L2
      await l2Cache.saveProjectAsync('test-project', 'en', project);

      // Clear L1 to force L2 lookup
      provider['l1Cache'].clear();

      const result = await provider.getProjectAsync('test-project', 'en');
      expect(result).toBeInstanceOf(TranslationProject);
      expect(result?.groups).toEqual(project.groups);
    });

    it('should promote L2 entry to L1 on access', async () => {
      const project = new TranslationProject({
        common: { welcome: 'Welcome' },
      });

      // Save only to L2
      await l2Cache.saveProjectAsync('test-project', 'en', project);

      // Clear L1
      provider['l1Cache'].clear();

      // First access - should come from L2
      const result1 = await provider.getProjectAsync('test-project', 'en');
      expect(result1).toBeInstanceOf(TranslationProject);

      // Clear L2 to verify promotion
      await l2Cache.clearAllAsync();

      // Second access - should come from L1 (promoted)
      const result2 = await provider.getProjectAsync('test-project', 'en');
      expect(result2).toBeInstanceOf(TranslationProject);
      expect(result2?.groups).toEqual(project.groups);
    });
  });

  describe('getProjectAsync - both miss', () => {
    it('should return null when both caches miss', async () => {
      const result = await provider.getProjectAsync('non-existent', 'en');
      expect(result).toBeNull();
    });
  });

  describe('getGroupAsync', () => {
    it('should retrieve group from L1 cache', async () => {
      const project = new TranslationProject({
        common: { welcome: 'Welcome' },
        messages: { error: 'Error' },
      });

      await provider.saveProjectAsync('test-project', 'en', project);
      await l2Cache.clearAllAsync(); // Ensure L1 only

      const group = await provider.getGroupAsync('test-project', 'common', 'en');
      expect(group).toBeInstanceOf(TranslationGroup);
      expect(group?.entries).toEqual({ welcome: 'Welcome' });
    });

    it('should retrieve group from L2 cache on L1 miss', async () => {
      const project = new TranslationProject({
        common: { welcome: 'Welcome' },
      });

      await l2Cache.saveProjectAsync('test-project', 'en', project);
      provider['l1Cache'].clear();

      const group = await provider.getGroupAsync('test-project', 'common', 'en');
      expect(group).toBeInstanceOf(TranslationGroup);
      expect(group?.entries).toEqual({ welcome: 'Welcome' });
    });

    it('should return null for non-existent group', async () => {
      const project = new TranslationProject({
        common: { welcome: 'Welcome' },
      });

      await provider.saveProjectAsync('test-project', 'en', project);
      const group = await provider.getGroupAsync('test-project', 'non-existent', 'en');
      expect(group).toBeNull();
    });
  });

  describe('saveProjectAsync', () => {
    it('should save to both L1 and L2 caches', async () => {
      const project = new TranslationProject({
        common: { welcome: 'Welcome' },
      });

      await provider.saveProjectAsync('test-project', 'en', project);

      // Verify L1
      const l1Result = provider['l1Cache'].get<TranslationProject>('test-project:en');
      expect(l1Result).toBeInstanceOf(TranslationProject);

      // Verify L2
      const l2Result = await l2Cache.getProjectAsync('test-project', 'en');
      expect(l2Result).toBeInstanceOf(TranslationProject);
    });

    it('should handle cancellation token', async () => {
      const project = new TranslationProject({});
      const controller = new AbortController();
      controller.abort();

      await expect(
        provider.saveProjectAsync('test-project', 'en', project, controller.signal)
      ).rejects.toThrow(TranslaasOfflineCacheException);
    });
  });

  describe('isCachedAsync', () => {
    it('should return true when cached in L1', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('test-project', 'en', project);

      // Clear L2 to ensure we're checking L1
      await l2Cache.clearAllAsync();

      const isCached = await provider.isCachedAsync('test-project', 'en');
      expect(isCached).toBe(true);
    });

    it('should return true when cached in L2 only', async () => {
      const project = new TranslationProject({});
      await l2Cache.saveProjectAsync('test-project', 'en', project);

      // Clear L1
      provider['l1Cache'].clear();

      const isCached = await provider.isCachedAsync('test-project', 'en');
      expect(isCached).toBe(true);
    });

    it('should return false when not cached', async () => {
      const isCached = await provider.isCachedAsync('non-existent', 'en');
      expect(isCached).toBe(false);
    });

    it('should handle cancellation token', async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(provider.isCachedAsync('test-project', 'en', controller.signal)).rejects.toThrow(
        TranslaasOfflineCacheException
      );
    });
  });

  describe('clearAllAsync', () => {
    it('should clear both L1 and L2 caches', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('test-project', 'en', project);

      await provider.clearAllAsync();

      // Verify L1 is cleared
      const l1Result = provider['l1Cache'].get<TranslationProject>('test-project:en');
      expect(l1Result).toBeNull();

      // Verify L2 is cleared
      const l2Result = await l2Cache.getProjectAsync('test-project', 'en');
      expect(l2Result).toBeNull();
    });

    it('should handle cancellation token', async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(provider.clearAllAsync(controller.signal)).rejects.toThrow(
        TranslaasOfflineCacheException
      );
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used entries when limit reached', async () => {
      // Fill cache beyond limit
      for (let i = 0; i < 12; i++) {
        const project = new TranslationProject({ test: { key: `value${i}` } });
        await provider.saveProjectAsync(`project${i}`, 'en', project);
      }

      // Verify oldest entries are evicted
      const oldest = provider['l1Cache'].get<TranslationProject>('project0:en');
      expect(oldest).toBeNull();

      // Verify newer entries are still cached
      const newer = provider['l1Cache'].get<TranslationProject>('project11:en');
      expect(newer).toBeInstanceOf(TranslationProject);
    });

    it('should update LRU on access', async () => {
      // Fill cache
      for (let i = 0; i < 10; i++) {
        const project = new TranslationProject({ test: { key: `value${i}` } });
        await provider.saveProjectAsync(`project${i}`, 'en', project);
      }

      // Access oldest entry to update LRU
      await provider.getProjectAsync('project0', 'en');

      // Add one more entry - should evict project1, not project0
      const project = new TranslationProject({ test: { key: 'new' } });
      await provider.saveProjectAsync('project10', 'en', project);

      // project0 should still be cached (was accessed)
      const project0 = provider['l1Cache'].get<TranslationProject>('project0:en');
      expect(project0).toBeInstanceOf(TranslationProject);

      // project1 should be evicted (least recently used)
      const project1 = provider['l1Cache'].get<TranslationProject>('project1:en');
      expect(project1).toBeNull();
    });
  });

  describe('warmupAsync', () => {
    it('should load projects from L2 into L1', async () => {
      const project1 = new TranslationProject({ common: { welcome: 'Welcome' } });
      const project2 = new TranslationProject({ messages: { error: 'Error' } });

      await l2Cache.saveProjectAsync('project1', 'en', project1);
      await l2Cache.saveProjectAsync('project2', 'fr', project2);

      // Clear L1
      provider['l1Cache'].clear();

      await provider.warmupAsync(['project1', 'project2'], ['en', 'fr']);

      // Verify projects are in L1
      const l1Project1 = provider['l1Cache'].get<TranslationProject>('project1:en');
      const l1Project2 = provider['l1Cache'].get<TranslationProject>('project2:fr');

      expect(l1Project1).toBeInstanceOf(TranslationProject);
      expect(l1Project2).toBeInstanceOf(TranslationProject);
    });

    it('should handle missing projects gracefully', async () => {
      await provider.warmupAsync(['non-existent'], ['en']);

      // Should not throw, just skip missing entries
      const result = provider['l1Cache'].get<TranslationProject>('non-existent:en');
      expect(result).toBeNull();
    });

    it('should handle cancellation token', async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(provider.warmupAsync(['project1'], ['en'], controller.signal)).rejects.toThrow(
        TranslaasOfflineCacheException
      );
    });
  });

  describe('memory cache expiration', () => {
    it('should respect L1 cache expiration', async () => {
      vi.useFakeTimers();

      const project = new TranslationProject({ test: { key: 'value' } });
      await provider.saveProjectAsync('test-project', 'en', project);

      // Advance time past expiration
      vi.advanceTimersByTime(1001);

      // L1 should be expired
      const l1Result = provider['l1Cache'].get<TranslationProject>('test-project:en');
      expect(l1Result).toBeNull();

      // But L2 should still have it
      const l2Result = await l2Cache.getProjectAsync('test-project', 'en');
      expect(l2Result).toBeInstanceOf(TranslationProject);

      vi.useRealTimers();
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent getProjectAsync calls', async () => {
      const project = new TranslationProject({ test: { key: 'value' } });
      await provider.saveProjectAsync('test-project', 'en', project);

      const results = await Promise.all([
        provider.getProjectAsync('test-project', 'en'),
        provider.getProjectAsync('test-project', 'en'),
        provider.getProjectAsync('test-project', 'en'),
      ]);

      results.forEach(result => {
        expect(result).toBeInstanceOf(TranslationProject);
      });
    });

    it('should handle concurrent saveProjectAsync calls', async () => {
      const project1 = new TranslationProject({ test1: { key: 'value1' } });
      const project2 = new TranslationProject({ test2: { key: 'value2' } });

      await Promise.all([
        provider.saveProjectAsync('project1', 'en', project1),
        provider.saveProjectAsync('project2', 'fr', project2),
      ]);

      const result1 = await provider.getProjectAsync('project1', 'en');
      const result2 = await provider.getProjectAsync('project2', 'fr');

      expect(result1).toBeInstanceOf(TranslationProject);
      expect(result2).toBeInstanceOf(TranslationProject);
    });
  });
});
