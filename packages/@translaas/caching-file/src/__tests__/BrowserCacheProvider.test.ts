import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BrowserCacheProvider } from '../BrowserCacheProvider';
import {
  TranslaasOfflineCacheException,
  TranslationProject,
  TranslationGroup,
} from '@translaas/models';

// Mock localStorage
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }
}

describe('BrowserCacheProvider', () => {
  let provider: BrowserCacheProvider;
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    // Mock window.localStorage

    global.window = {
      localStorage: mockStorage as any,
    } as any;
    provider = new BrowserCacheProvider();
  });

  afterEach(() => {
    mockStorage.clear();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create instance of BrowserCacheProvider', () => {
      expect(provider).toBeInstanceOf(BrowserCacheProvider);
    });
  });

  describe('saveProjectAsync', () => {
    it('should save project data to localStorage', async () => {
      const project = new TranslationProject({
        common: {
          welcome: 'Welcome',
          goodbye: 'Goodbye',
        },
      });

      await provider.saveProjectAsync('test-project', 'en', project);

      const key = 'translaas:cache:test-project:en';
      const stored = mockStorage.getItem(key);
      expect(stored).not.toBeNull();

      const entry = JSON.parse(stored ?? '{}');
      expect(entry.project).toBe('test-project');
      expect(entry.lang).toBe('en');
      expect(entry.data).toEqual(project.groups);
      expect(entry.cachedAt).toBeTypeOf('number');
    });

    it('should handle multiple projects and languages', async () => {
      const project1 = new TranslationProject({ test1: { key: 'value1' } });
      const project2 = new TranslationProject({ test2: { key: 'value2' } });

      await provider.saveProjectAsync('project1', 'en', project1);
      await provider.saveProjectAsync('project2', 'fr', project2);

      const key1 = 'translaas:cache:project1:en';
      const key2 = 'translaas:cache:project2:fr';

      expect(mockStorage.getItem(key1)).not.toBeNull();
      expect(mockStorage.getItem(key2)).not.toBeNull();
    });

    it('should throw TranslaasOfflineCacheException when localStorage is not available', async () => {
      // Remove window.localStorage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (global as any).window;

      const project = new TranslationProject({});
      await expect(provider.saveProjectAsync('test-project', 'en', project)).rejects.toThrow(
        TranslaasOfflineCacheException
      );
    });

    it('should handle quota exceeded error', async () => {
      const project = new TranslationProject({ test: { key: 'value' } });

      // Mock setItem to throw quota error
      const originalSetItem = mockStorage.setItem.bind(mockStorage);

      mockStorage.setItem = vi.fn(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      }) as any;

      await expect(provider.saveProjectAsync('test-project', 'en', project)).rejects.toThrow(
        TranslaasOfflineCacheException
      );

      // Restore original
      mockStorage.setItem = originalSetItem;
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

  describe('getProjectAsync', () => {
    it('should retrieve cached project data', async () => {
      const originalProject = new TranslationProject({
        common: {
          welcome: 'Welcome',
          goodbye: 'Goodbye',
        },
      });

      await provider.saveProjectAsync('test-project', 'en', originalProject);
      const cached = await provider.getProjectAsync('test-project', 'en');

      expect(cached).toBeInstanceOf(TranslationProject);
      expect(cached?.groups).toEqual(originalProject.groups);
    });

    it('should return null for non-existent project', async () => {
      const cached = await provider.getProjectAsync('non-existent', 'en');
      expect(cached).toBeNull();
    });

    it('should return null for non-existent language', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('test-project', 'en', project);

      const cached = await provider.getProjectAsync('test-project', 'fr');
      expect(cached).toBeNull();
    });

    it('should return null for expired cache entry', async () => {
      const project = new TranslationProject({ test: { key: 'value' } });
      await provider.saveProjectAsync('test-project', 'en', project);

      // Manually set expiration
      const key = 'translaas:cache:test-project:en';
      const stored = mockStorage.getItem(key);
      expect(stored).not.toBeNull();
      const entry = JSON.parse(stored ?? '{}');
      entry.expiresAt = Date.now() - 1000; // Expired 1 second ago
      mockStorage.setItem(key, JSON.stringify(entry));

      const cached = await provider.getProjectAsync('test-project', 'en');
      expect(cached).toBeNull();

      // Expired entry should be removed
      expect(mockStorage.getItem(key)).toBeNull();
    });

    it('should remove corrupted entries', async () => {
      const key = 'translaas:cache:test-project:en';
      mockStorage.setItem(key, 'invalid json');

      const cached = await provider.getProjectAsync('test-project', 'en');
      expect(cached).toBeNull();

      // Corrupted entry should be removed
      expect(mockStorage.getItem(key)).toBeNull();
    });

    it('should handle cancellation token', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('test-project', 'en', project);

      const controller = new AbortController();
      controller.abort();

      await expect(
        provider.getProjectAsync('test-project', 'en', controller.signal)
      ).rejects.toThrow(TranslaasOfflineCacheException);
    });

    it('should throw TranslaasOfflineCacheException when localStorage is not available', async () => {
      delete (global as any).window;

      await expect(provider.getProjectAsync('test-project', 'en')).rejects.toThrow(
        TranslaasOfflineCacheException
      );
    });
  });

  describe('getGroupAsync', () => {
    it('should retrieve cached group data', async () => {
      const project = new TranslationProject({
        common: {
          welcome: 'Welcome',
        },
        messages: {
          error: 'Error',
        },
      });

      await provider.saveProjectAsync('test-project', 'en', project);
      const group = await provider.getGroupAsync('test-project', 'common', 'en');

      expect(group).toBeInstanceOf(TranslationGroup);
      expect(group?.entries).toEqual({
        welcome: 'Welcome',
      });
    });

    it('should return null for non-existent group', async () => {
      const project = new TranslationProject({
        common: {
          welcome: 'Welcome',
        },
      });

      await provider.saveProjectAsync('test-project', 'en', project);
      const group = await provider.getGroupAsync('test-project', 'non-existent', 'en');

      expect(group).toBeNull();
    });

    it('should return null if project is not cached', async () => {
      const group = await provider.getGroupAsync('non-existent', 'common', 'en');
      expect(group).toBeNull();
    });

    it('should handle cancellation token', async () => {
      const project = new TranslationProject({ common: { key: 'value' } });
      await provider.saveProjectAsync('test-project', 'en', project);

      const controller = new AbortController();
      controller.abort();

      await expect(
        provider.getGroupAsync('test-project', 'common', 'en', controller.signal)
      ).rejects.toThrow(TranslaasOfflineCacheException);
    });
  });

  describe('isCachedAsync', () => {
    it('should return true for cached project', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('test-project', 'en', project);

      const isCached = await provider.isCachedAsync('test-project', 'en');
      expect(isCached).toBe(true);
    });

    it('should return false for non-existent project', async () => {
      const isCached = await provider.isCachedAsync('non-existent', 'en');
      expect(isCached).toBe(false);
    });

    it('should return false for expired cache entry', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('test-project', 'en', project);

      // Manually set expiration
      const key = 'translaas:cache:test-project:en';
      const stored = mockStorage.getItem(key);
      expect(stored).not.toBeNull();
      const entry = JSON.parse(stored ?? '{}');
      entry.expiresAt = Date.now() - 1000; // Expired 1 second ago
      mockStorage.setItem(key, JSON.stringify(entry));

      const isCached = await provider.isCachedAsync('test-project', 'en');
      expect(isCached).toBe(false);
    });

    it('should return false when localStorage is not available', async () => {
      delete (global as any).window;

      const isCached = await provider.isCachedAsync('test-project', 'en');
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
    it('should remove all cached data', async () => {
      const project1 = new TranslationProject({ test1: { key: 'value1' } });
      const project2 = new TranslationProject({ test2: { key: 'value2' } });

      await provider.saveProjectAsync('project1', 'en', project1);
      await provider.saveProjectAsync('project2', 'fr', project2);

      // Add a non-translaas key to ensure we don't remove everything
      mockStorage.setItem('other-key', 'other-value');

      await provider.clearAllAsync();

      // Translaas cache keys should be removed
      expect(mockStorage.getItem('translaas:cache:project1:en')).toBeNull();
      expect(mockStorage.getItem('translaas:cache:project2:fr')).toBeNull();

      // Other keys should remain
      expect(mockStorage.getItem('other-key')).toBe('other-value');
    });

    it('should handle empty cache', async () => {
      await expect(provider.clearAllAsync()).resolves.not.toThrow();
    });

    it('should handle cancellation token', async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(provider.clearAllAsync(controller.signal)).rejects.toThrow(
        TranslaasOfflineCacheException
      );
    });

    it('should throw TranslaasOfflineCacheException when localStorage is not available', async () => {
      delete (global as any).window;

      await expect(provider.clearAllAsync()).rejects.toThrow(TranslaasOfflineCacheException);
    });
  });

  describe('error handling', () => {
    it('should include project and language in error context', async () => {
      delete (global as any).window;

      const project = new TranslationProject({});

      try {
        await provider.saveProjectAsync('my-project', 'en', project);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TranslaasOfflineCacheException);
        const cacheError = error as TranslaasOfflineCacheException;
        expect(cacheError.project).toBe('my-project');
        expect(cacheError.language).toBe('en');
      }
    });

    it('should handle various quota error formats', async () => {
      const project = new TranslationProject({ test: { key: 'value' } });

      const quotaErrors = [
        { name: 'QuotaExceededError' },
        { name: 'NS_ERROR_DOM_QUOTA_REACHED' },
        { message: 'Quota exceeded' },
      ];

      for (const quotaError of quotaErrors) {
        mockStorage.setItem = vi.fn(() => {
          throw quotaError;
        }) as any;

        await expect(provider.saveProjectAsync('test-project', 'en', project)).rejects.toThrow(
          TranslaasOfflineCacheException
        );
      }
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent saves', async () => {
      const project1 = new TranslationProject({ test1: { key: 'value1' } });
      const project2 = new TranslationProject({ test2: { key: 'value2' } });

      await Promise.all([
        provider.saveProjectAsync('project1', 'en', project1),
        provider.saveProjectAsync('project2', 'fr', project2),
      ]);

      const cached1 = await provider.getProjectAsync('project1', 'en');
      const cached2 = await provider.getProjectAsync('project2', 'fr');

      expect(cached1).toBeInstanceOf(TranslationProject);
      expect(cached2).toBeInstanceOf(TranslationProject);
    });

    it('should handle concurrent reads', async () => {
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
  });

  describe('localStorage availability check', () => {
    it('should detect when localStorage is not available', () => {
      delete (global as any).window;
      const newProvider = new BrowserCacheProvider();

      // This should not throw, but operations will fail
      expect(newProvider).toBeInstanceOf(BrowserCacheProvider);
    });

    it('should detect when localStorage is read-only', () => {
      const readOnlyStorage = {
        getItem: () => null,
        setItem: () => {
          throw new Error('Read-only');
        },
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null,
      };

      global.window = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        localStorage: readOnlyStorage as any,
      } as any;

      const newProvider = new BrowserCacheProvider();
      expect(newProvider).toBeInstanceOf(BrowserCacheProvider);
    });
  });
});
