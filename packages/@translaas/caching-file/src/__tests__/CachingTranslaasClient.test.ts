import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CachingTranslaasClient } from '../CachingTranslaasClient';
import type { IOfflineCacheProvider } from '../types';
import type { ITranslaasClient } from '@translaas/client';
import {
  OfflineFallbackMode,
  OfflineCacheOptions,
  PluralCategory,
  TranslaasApiException,
  TranslaasOfflineCacheMissException,
  TranslationGroup,
  TranslationProject,
} from '@translaas/models';

const DEFAULT_PROJECT = 'test-project';

function createTranslationGroup(key: string, value: string): TranslationGroup {
  return new TranslationGroup({ [key]: value });
}

function createPluralGroup(
  key: string,
  forms: Partial<Record<PluralCategory, string>>
): TranslationGroup {
  return new TranslationGroup({
    [key]: {
      [PluralCategory.One]: forms.one ?? '',
      [PluralCategory.Other]: forms.other ?? '',
    },
  });
}

describe('CachingTranslaasClient', () => {
  let innerClient: ITranslaasClient;
  let cacheProvider: IOfflineCacheProvider;
  let options: OfflineCacheOptions;

  beforeEach(() => {
    innerClient = {
      getEntryAsync: vi.fn(),
      getGroupAsync: vi.fn(),
      getProjectAsync: vi.fn(),
      getProjectLocalesAsync: vi.fn(),
      reportMissingKeysAsync: vi.fn(),
      getOfflineCacheZipAsync: vi.fn(),
      validateApiKeyAsync: vi.fn(),
    };
    cacheProvider = {
      getProjectAsync: vi.fn(),
      getGroupAsync: vi.fn(),
      saveProjectAsync: vi.fn(),
      isCachedAsync: vi.fn(),
      clearAllAsync: vi.fn(),
    };
    options = {
      enabled: true,
      fallbackMode: OfflineFallbackMode.CacheFirst,
    };
  });

  function createClient(mode: OfflineFallbackMode = OfflineFallbackMode.CacheFirst) {
    return new CachingTranslaasClient(
      innerClient,
      cacheProvider,
      { ...options, fallbackMode: mode },
      DEFAULT_PROJECT
    );
  }

  describe('constructor', () => {
    it('requires inner client, cache provider, options, and project id', () => {
      expect(
        () =>
          new CachingTranslaasClient(
            null as unknown as ITranslaasClient,
            cacheProvider,
            options,
            DEFAULT_PROJECT
          )
      ).toThrow('innerClient is required');
      expect(
        () =>
          new CachingTranslaasClient(
            innerClient,
            null as unknown as IOfflineCacheProvider,
            options,
            DEFAULT_PROJECT
          )
      ).toThrow('cacheProvider is required');
      expect(
        () =>
          new CachingTranslaasClient(
            innerClient,
            cacheProvider,
            null as unknown as OfflineCacheOptions,
            DEFAULT_PROJECT
          )
      ).toThrow('options is required');
      expect(() => new CachingTranslaasClient(innerClient, cacheProvider, options, '  ')).toThrow(
        'projectId is required'
      );
    });
  });

  describe('getEntryAsync CacheFirst', () => {
    it('returns cached value on cache hit without calling API', async () => {
      const client = createClient(OfflineFallbackMode.CacheFirst);
      vi.mocked(cacheProvider.getGroupAsync).mockResolvedValue(
        createTranslationGroup('hello', 'Hello World')
      );

      const result = await client.getEntryAsync('common', 'hello', 'en');

      expect(result).toBe('Hello World');
      expect(innerClient.getEntryAsync).not.toHaveBeenCalled();
    });

    it('calls API on cache miss', async () => {
      const client = createClient(OfflineFallbackMode.CacheFirst);
      vi.mocked(cacheProvider.getGroupAsync).mockResolvedValue(null);
      vi.mocked(innerClient.getEntryAsync).mockResolvedValue('Hello from API');
      vi.mocked(innerClient.getGroupAsync).mockResolvedValue(
        createTranslationGroup('hello', 'Hello from API')
      );

      const result = await client.getEntryAsync('common', 'hello', 'en');

      expect(result).toBe('Hello from API');
      expect(innerClient.getEntryAsync).toHaveBeenCalledWith(
        'common',
        'hello',
        'en',
        undefined,
        undefined,
        DEFAULT_PROJECT,
        undefined
      );
    });

    it('throws cache miss when API fails and cache is empty', async () => {
      const client = createClient(OfflineFallbackMode.CacheFirst);
      vi.mocked(cacheProvider.getGroupAsync).mockResolvedValue(null);
      vi.mocked(innerClient.getEntryAsync).mockRejectedValue(
        new TranslaasApiException('Network error', 503)
      );

      await expect(client.getEntryAsync('common', 'hello', 'en')).rejects.toThrow(
        TranslaasOfflineCacheMissException
      );
    });
  });

  describe('getEntryAsync ApiFirst', () => {
    it('calls API first', async () => {
      const client = createClient(OfflineFallbackMode.ApiFirst);
      vi.mocked(innerClient.getEntryAsync).mockResolvedValue('Hello from API');
      vi.mocked(innerClient.getGroupAsync).mockResolvedValue(
        createTranslationGroup('hello', 'Hello from API')
      );

      const result = await client.getEntryAsync('common', 'hello', 'en');

      expect(result).toBe('Hello from API');
      expect(innerClient.getEntryAsync).toHaveBeenCalledOnce();
    });

    it('falls back to cache on API failure', async () => {
      const client = createClient(OfflineFallbackMode.ApiFirst);
      vi.mocked(innerClient.getEntryAsync).mockRejectedValue(
        new TranslaasApiException('Network error', 503)
      );
      vi.mocked(cacheProvider.getGroupAsync).mockResolvedValue(
        createTranslationGroup('hello', 'Hello from Cache')
      );

      const result = await client.getEntryAsync('common', 'hello', 'en');

      expect(result).toBe('Hello from Cache');
    });
  });

  describe('getEntryAsync CacheOnly', () => {
    it('returns cached value without calling API', async () => {
      const client = createClient(OfflineFallbackMode.CacheOnly);
      vi.mocked(cacheProvider.getGroupAsync).mockResolvedValue(
        createTranslationGroup('hello', 'Hello from Cache')
      );

      const result = await client.getEntryAsync('common', 'hello', 'en');

      expect(result).toBe('Hello from Cache');
      expect(innerClient.getEntryAsync).not.toHaveBeenCalled();
    });

    it('throws when entry is not cached', async () => {
      const client = createClient(OfflineFallbackMode.CacheOnly);
      vi.mocked(cacheProvider.getGroupAsync).mockResolvedValue(null);

      await expect(client.getEntryAsync('common', 'hello', 'en')).rejects.toThrow(
        TranslaasOfflineCacheMissException
      );
    });

    it('performs parameter substitution with {name} placeholders', async () => {
      const client = createClient(OfflineFallbackMode.CacheOnly);
      vi.mocked(cacheProvider.getGroupAsync).mockResolvedValue(
        createTranslationGroup('greeting', 'Hello {userName}, you have {count} items')
      );

      const result = await client.getEntryAsync('messages', 'greeting', 'en', undefined, {
        userName: 'John',
        count: '5',
      });

      expect(result).toBe('Hello John, you have 5 items');
    });

    it('performs number substitution into {N}', async () => {
      const client = createClient(OfflineFallbackMode.CacheOnly);
      vi.mocked(cacheProvider.getGroupAsync).mockResolvedValue(
        createTranslationGroup('items', 'You have {N} items')
      );

      const result = await client.getEntryAsync('messages', 'items', 'en', 5);

      expect(result).toBe('You have 5 items');
    });

    it('combines number and parameters', async () => {
      const client = createClient(OfflineFallbackMode.CacheOnly);
      vi.mocked(cacheProvider.getGroupAsync).mockResolvedValue(
        createTranslationGroup(
          'greeting',
          'Hello {userName}, you have {N} items and {pending} pending'
        )
      );

      const result = await client.getEntryAsync('messages', 'greeting', 'en', 5, {
        userName: 'John',
        pending: '3',
      });

      expect(result).toBe('Hello John, you have 5 items and 3 pending');
    });

    it('uses one/other plural rules offline', async () => {
      const client = createClient(OfflineFallbackMode.CacheOnly);
      vi.mocked(cacheProvider.getGroupAsync).mockResolvedValue(
        createPluralGroup('items', {
          one: 'one item',
          other: '{N} items',
        })
      );

      expect(await client.getEntryAsync('messages', 'items', 'en', 1)).toBe('one item');
      expect(await client.getEntryAsync('messages', 'items', 'en', 5)).toBe('5 items');
    });
  });

  describe('getProjectAsync', () => {
    it('returns cached project on CacheFirst hit', async () => {
      const client = createClient(OfflineFallbackMode.CacheFirst);
      const cachedProject = new TranslationProject();
      vi.mocked(cacheProvider.getProjectAsync).mockResolvedValue(cachedProject);

      const result = await client.getProjectAsync('my-project', 'en');

      expect(result).toBe(cachedProject);
      expect(innerClient.getProjectAsync).not.toHaveBeenCalled();
    });

    it('falls back to cache on ApiFirst failure', async () => {
      const client = createClient(OfflineFallbackMode.ApiFirst);
      const cachedProject = new TranslationProject();
      vi.mocked(innerClient.getProjectAsync).mockRejectedValue(
        new TranslaasApiException('Network error', 503)
      );
      vi.mocked(cacheProvider.getProjectAsync).mockResolvedValue(cachedProject);

      const result = await client.getProjectAsync('my-project', 'en');

      expect(result).toBe(cachedProject);
    });
  });
});
