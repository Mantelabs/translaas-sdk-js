import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { TranslaasService } from '@translaas/client';
import { LanguageResolver } from '@translaas/extensions';
import { DefaultLanguageProvider } from '@translaas/extensions';
import { CultureLanguageProvider } from '@translaas/extensions';
import type { ILanguageProvider } from '@translaas/extensions';
import { createMockServer, defaultMockData, type MockApiConfig } from '../setup/mock-api';
import { createTestClientOptions } from '../fixtures/translation-data';
import { vi } from 'vitest';

/**
 * Integration tests for language resolution
 *
 * Tests the integration of:
 * - Service with language resolver
 * - Multiple language providers chaining
 * - Default language fallback
 * - Language resolution priority
 */

describe('Language Resolution Integration', () => {
  const mockConfig: MockApiConfig = {
    baseUrl: 'https://api.test.translaas.com',
    apiKey: 'test-api-key',
    delay: 10,
  };

  const server = createMockServer(mockConfig, defaultMockData);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('Service with Language Resolver', () => {
    it('should resolve language from resolver', async () => {
      const provider = new DefaultLanguageProvider('fr');
      const resolver = new LanguageResolver([provider]);
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        languageResolver: resolver,
      });

      const result = await service.t('common', 'welcome');
      expect(result).toBe('Bienvenue');
    });

    it('should chain multiple providers', async () => {
      const provider1: ILanguageProvider = {
        getLanguageAsync: vi.fn().mockResolvedValue(null),
      };
      const provider2 = new DefaultLanguageProvider('es');
      const resolver = new LanguageResolver([provider1, provider2]);
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        languageResolver: resolver,
      });

      const result = await service.t('common', 'welcome');
      expect(result).toBe('Bienvenido');
      expect(provider1.getLanguageAsync).toHaveBeenCalled();
    });

    it('should use first non-null provider result', async () => {
      const provider1: ILanguageProvider = {
        getLanguageAsync: vi.fn().mockResolvedValue('fr'),
      };
      const provider2 = new DefaultLanguageProvider('es');
      const resolver = new LanguageResolver([provider1, provider2]);
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        languageResolver: resolver,
      });

      const result = await service.t('common', 'welcome');
      expect(result).toBe('Bienvenue'); // Should use 'fr' from provider1
    });

    it('should fallback to default language when resolver returns null', async () => {
      const provider: ILanguageProvider = {
        getLanguageAsync: vi.fn().mockResolvedValue(null),
      };
      const resolver = new LanguageResolver([provider]);
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        languageResolver: resolver,
        defaultLanguage: 'es',
      });

      const result = await service.t('common', 'welcome');
      expect(result).toBe('Bienvenido');
    });

    it('should prioritize explicit language over resolver', async () => {
      const provider = new DefaultLanguageProvider('fr');
      const resolver = new LanguageResolver([provider]);
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        languageResolver: resolver,
      });

      // Explicit language should override resolver
      const result = await service.t('common', 'welcome', 'es');
      expect(result).toBe('Bienvenido');
    });

    it('should throw error when no language can be resolved', async () => {
      const provider: ILanguageProvider = {
        getLanguageAsync: vi.fn().mockResolvedValue(null),
      };
      const resolver = new LanguageResolver([provider]);
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        languageResolver: resolver,
        // No defaultLanguage
      });

      await expect(service.t('common', 'welcome')).rejects.toThrow();
    });
  });

  describe('Language Provider Chaining', () => {
    it('should continue to next provider on error', async () => {
      const provider1: ILanguageProvider = {
        getLanguageAsync: vi.fn().mockRejectedValue(new Error('Provider error')),
      };
      const provider2 = new DefaultLanguageProvider('en');
      const resolver = new LanguageResolver([provider1, provider2]);
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        languageResolver: resolver,
      });

      const result = await service.t('common', 'welcome');
      expect(result).toBe('Welcome'); // Should use provider2
    });

    it('should handle empty string as null', async () => {
      const provider1: ILanguageProvider = {
        getLanguageAsync: vi.fn().mockResolvedValue(''),
      };
      const provider2 = new DefaultLanguageProvider('en');
      const resolver = new LanguageResolver([provider1, provider2]);
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        languageResolver: resolver,
      });

      const result = await service.t('common', 'welcome');
      expect(result).toBe('Welcome'); // Should use provider2
    });

    it('should handle whitespace-only string as null', async () => {
      const provider1: ILanguageProvider = {
        getLanguageAsync: vi.fn().mockResolvedValue('   '),
      };
      const provider2 = new DefaultLanguageProvider('en');
      const resolver = new LanguageResolver([provider1, provider2]);
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        languageResolver: resolver,
      });

      const result = await service.t('common', 'welcome');
      expect(result).toBe('Welcome'); // Should use provider2
    });
  });

  describe('Default Language Provider', () => {
    it('should return configured language', async () => {
      const provider = new DefaultLanguageProvider('fr');
      const language = await provider.getLanguageAsync();
      expect(language).toBe('fr');
    });

    it('should work with service', async () => {
      const resolver = new LanguageResolver([new DefaultLanguageProvider('fr')]);
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        languageResolver: resolver,
      });

      const result = await service.t('common', 'welcome');
      expect(result).toBe('Bienvenue');
    });
  });

  describe('Culture Language Provider', () => {
    it('should return browser language when available', async () => {
      // Mock navigator.language
      const originalLanguage = global.navigator?.language;
      Object.defineProperty(global, 'navigator', {
        value: {
          ...global.navigator,
          language: 'fr-FR',
        },
        configurable: true,
      });

      try {
        const provider = new CultureLanguageProvider();
        const language = await provider.getLanguageAsync();
        expect(language).toBe('fr');
      } finally {
        // Restore original
        if (originalLanguage !== undefined) {
          Object.defineProperty(global, 'navigator', {
            value: {
              ...global.navigator,
              language: originalLanguage,
            },
            configurable: true,
          });
        }
      }
    });

    it('should return null when navigator is not available', async () => {
      const originalNavigator = global.navigator;
      // @ts-expect-error - intentionally removing navigator
      delete global.navigator;

      try {
        const provider = new CultureLanguageProvider();
        const language = await provider.getLanguageAsync();
        expect(language).toBeNull();
      } finally {
        // Restore original
        if (originalNavigator) {
          global.navigator = originalNavigator;
        }
      }
    });
  });
});
