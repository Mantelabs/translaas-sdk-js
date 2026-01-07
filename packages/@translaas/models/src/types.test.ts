import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  TranslaasOptions,
  OfflineCacheOptions,
  HybridCacheOptions,
  LanguageCode,
  TranslationEntryValue,
} from './types';
import { CacheMode, OfflineFallbackMode, PluralCategory, LanguageCodes } from './types';

describe('Type Definitions', () => {
  describe('TranslaasOptions', () => {
    it('should accept valid configuration with required fields', () => {
      const options: TranslaasOptions = {
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
      };
      expect(options.apiKey).toBe('test-api-key');
      expect(options.baseUrl).toBe('https://api.example.com');
    });

    it('should accept optional cacheMode', () => {
      const options: TranslaasOptions = {
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
        cacheMode: CacheMode.Group,
      };
      expect(options.cacheMode).toBe(CacheMode.Group);
    });

    it('should accept optional timeout', () => {
      const options: TranslaasOptions = {
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
        timeout: 5000,
      };
      expect(options.timeout).toBe(5000);
    });

    it('should accept optional cache expiration settings', () => {
      const options: TranslaasOptions = {
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
        cacheAbsoluteExpiration: 3600000,
        cacheSlidingExpiration: 1800000,
      };
      expect(options.cacheAbsoluteExpiration).toBe(3600000);
      expect(options.cacheSlidingExpiration).toBe(1800000);
    });

    it('should accept optional offlineCache', () => {
      const options: TranslaasOptions = {
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
        offlineCache: {
          enabled: true,
        },
      };
      expect(options.offlineCache?.enabled).toBe(true);
    });

    it('should accept optional defaultLanguage', () => {
      const options: TranslaasOptions = {
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
        defaultLanguage: 'en',
      };
      expect(options.defaultLanguage).toBe('en');
    });

    it('should enforce required apiKey and baseUrl', () => {
      // TypeScript compile-time check - this should fail if types are wrong
      expectTypeOf<TranslaasOptions>().toMatchTypeOf<{
        apiKey: string;
        baseUrl: string;
      }>();
    });
  });

  describe('OfflineCacheOptions', () => {
    it('should accept valid configuration with required enabled field', () => {
      const options: OfflineCacheOptions = {
        enabled: true,
      };
      expect(options.enabled).toBe(true);
    });

    it('should accept optional cacheDirectory', () => {
      const options: OfflineCacheOptions = {
        enabled: true,
        cacheDirectory: '/path/to/cache',
      };
      expect(options.cacheDirectory).toBe('/path/to/cache');
    });

    it('should accept optional fallbackMode', () => {
      const options: OfflineCacheOptions = {
        enabled: true,
        fallbackMode: OfflineFallbackMode.CacheFirst,
      };
      expect(options.fallbackMode).toBe(OfflineFallbackMode.CacheFirst);
    });

    it('should accept optional autoSync settings', () => {
      const options: OfflineCacheOptions = {
        enabled: true,
        autoSync: true,
        autoSyncInterval: 60000,
      };
      expect(options.autoSync).toBe(true);
      expect(options.autoSyncInterval).toBe(60000);
    });

    it('should accept optional projects and languages filters', () => {
      const options: OfflineCacheOptions = {
        enabled: true,
        projects: ['project1', 'project2'],
        languages: ['en', 'fr'],
      };
      expect(options.projects).toEqual(['project1', 'project2']);
      expect(options.languages).toEqual(['en', 'fr']);
    });

    it('should accept optional defaultProjectId', () => {
      const options: OfflineCacheOptions = {
        enabled: true,
        defaultProjectId: 'default-project',
      };
      expect(options.defaultProjectId).toBe('default-project');
    });

    it('should accept optional hybridCache', () => {
      const options: OfflineCacheOptions = {
        enabled: true,
        hybridCache: {
          enabled: true,
        },
      };
      expect(options.hybridCache?.enabled).toBe(true);
    });
  });

  describe('HybridCacheOptions', () => {
    it('should accept valid configuration with required enabled field', () => {
      const options: HybridCacheOptions = {
        enabled: true,
      };
      expect(options.enabled).toBe(true);
    });

    it('should accept optional memory cache settings', () => {
      const options: HybridCacheOptions = {
        enabled: true,
        memoryCacheExpiration: 300000,
        maxMemoryCacheEntries: 1000,
      };
      expect(options.memoryCacheExpiration).toBe(300000);
      expect(options.maxMemoryCacheEntries).toBe(1000);
    });

    it('should accept optional warmupOnStartup', () => {
      const options: HybridCacheOptions = {
        enabled: true,
        warmupOnStartup: true,
      };
      expect(options.warmupOnStartup).toBe(true);
    });
  });

  describe('LanguageCode', () => {
    it('should accept valid language codes from LanguageCodes constant', () => {
      const code1: LanguageCode = LanguageCodes.English;
      const code2: LanguageCode = LanguageCodes.French;
      const code3: LanguageCode = LanguageCodes.Spanish;

      expect(code1).toBe('en');
      expect(code2).toBe('fr');
      expect(code3).toBe('es');
    });

    it('should enforce type safety for language codes', () => {
      expectTypeOf<LanguageCode>().toMatchTypeOf<string>();
    });
  });

  describe('TranslationEntryValue', () => {
    it('should accept string values', () => {
      const value1: TranslationEntryValue = 'Hello';
      expect(value1).toBe('Hello');
    });

    it('should accept plural forms object', () => {
      const value2: TranslationEntryValue = {
        [PluralCategory.One]: 'one item',
        [PluralCategory.Other]: '{count} items',
      };
      expect(value2[PluralCategory.One]).toBe('one item');
      expect(value2[PluralCategory.Other]).toBe('{count} items');
    });

    it('should enforce type safety', () => {
      expectTypeOf<TranslationEntryValue>().toMatchTypeOf<
        string | Record<PluralCategory, string>
      >();
    });
  });

  describe('Enums', () => {
    it('should have correct CacheMode values', () => {
      expect(CacheMode.None).toBe(0);
      expect(CacheMode.Entry).toBe(1);
      expect(CacheMode.Group).toBe(2);
      expect(CacheMode.Project).toBe(3);
    });

    it('should have correct OfflineFallbackMode values', () => {
      expect(OfflineFallbackMode.CacheFirst).toBe(0);
      expect(OfflineFallbackMode.ApiFirst).toBe(1);
      expect(OfflineFallbackMode.CacheOnly).toBe(2);
      expect(OfflineFallbackMode.ApiOnlyWithBackup).toBe(3);
    });

    it('should have correct PluralCategory values', () => {
      expect(PluralCategory.Zero).toBe('zero');
      expect(PluralCategory.One).toBe('one');
      expect(PluralCategory.Two).toBe('two');
      expect(PluralCategory.Few).toBe('few');
      expect(PluralCategory.Many).toBe('many');
      expect(PluralCategory.Other).toBe('other');
    });
  });
});
