import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TranslaasService } from './TranslaasService';
import { TranslaasConfigurationException } from '@translaas/models';
import { LanguageResolver } from '@translaas/extensions';
import { DefaultLanguageProvider } from '@translaas/extensions';
import type { ILanguageProvider } from '@translaas/extensions';

describe('TranslaasService', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const defaultOptions = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.example.com',
  };

  beforeEach(() => {
    mockFetch = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.fetch = mockFetch as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create service with valid options', () => {
      const service = new TranslaasService(defaultOptions);
      expect(service).toBeInstanceOf(TranslaasService);
    });

    it('should create service with language resolver', () => {
      const resolver = new LanguageResolver([new DefaultLanguageProvider('en')]);
      const service = new TranslaasService({
        ...defaultOptions,
        languageResolver: resolver,
      });
      expect(service).toBeInstanceOf(TranslaasService);
    });

    it('should create service with default language', () => {
      const service = new TranslaasService({
        ...defaultOptions,
        defaultLanguage: 'fr',
      });
      expect(service).toBeInstanceOf(TranslaasService);
    });
  });

  describe('t method', () => {
    it('should use provided language parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Hello',
      } as Response);

      const service = new TranslaasService(defaultOptions);
      const result = await service.t('common', 'welcome', 'en');

      expect(result).toBe('Hello');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('lang=en'),
        expect.any(Object)
      );
    });

    it('should use language resolver when language is not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Bonjour',
      } as Response);

      const resolver = new LanguageResolver([new DefaultLanguageProvider('fr')]);
      const service = new TranslaasService({
        ...defaultOptions,
        languageResolver: resolver,
      });

      const result = await service.t('common', 'welcome');

      expect(result).toBe('Bonjour');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('lang=fr'),
        expect.any(Object)
      );
    });

    it('should fallback to default language when resolver returns null', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Hola',
      } as Response);

      const provider: ILanguageProvider = {
        getLanguageAsync: vi.fn().mockResolvedValue(null),
      };
      const resolver = new LanguageResolver([provider]);
      const service = new TranslaasService({
        ...defaultOptions,
        languageResolver: resolver,
        defaultLanguage: 'es',
      });

      const result = await service.t('common', 'welcome');

      expect(result).toBe('Hola');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('lang=es'),
        expect.any(Object)
      );
    });

    it('should throw error when language cannot be resolved and no default language', async () => {
      const provider: ILanguageProvider = {
        getLanguageAsync: vi.fn().mockResolvedValue(null),
      };
      const resolver = new LanguageResolver([provider]);
      const service = new TranslaasService({
        ...defaultOptions,
        languageResolver: resolver,
      });

      await expect(service.t('common', 'welcome')).rejects.toThrow(TranslaasConfigurationException);
      await expect(service.t('common', 'welcome')).rejects.toThrow('Language is required');
    });

    it('should throw error when no resolver and no default language', async () => {
      const service = new TranslaasService(defaultOptions);

      await expect(service.t('common', 'welcome')).rejects.toThrow(TranslaasConfigurationException);
    });

    it('should prioritize provided language over resolver', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Hello',
      } as Response);

      const resolver = new LanguageResolver([new DefaultLanguageProvider('fr')]);
      const service = new TranslaasService({
        ...defaultOptions,
        languageResolver: resolver,
      });

      const result = await service.t('common', 'welcome', 'en');

      expect(result).toBe('Hello');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('lang=en'),
        expect.any(Object)
      );
    });

    it('should work with pluralization', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '5 items',
      } as Response);

      const service = new TranslaasService(defaultOptions);
      const result = await service.t('messages', 'item', 'en', 5);

      expect(result).toBe('5 items');
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('n=5'), expect.any(Object));
    });

    it('should work with parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Hello John',
      } as Response);

      const service = new TranslaasService(defaultOptions);
      const result = await service.t('common', 'greeting', 'en', undefined, { name: 'John' });

      expect(result).toBe('Hello John');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('name=John'),
        expect.any(Object)
      );
    });

    it('should chain multiple providers in resolver', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Bonjour',
      } as Response);

      const provider1: ILanguageProvider = {
        getLanguageAsync: vi.fn().mockResolvedValue(null),
      };
      const provider2 = new DefaultLanguageProvider('fr');
      const resolver = new LanguageResolver([provider1, provider2]);
      const service = new TranslaasService({
        ...defaultOptions,
        languageResolver: resolver,
      });

      const result = await service.t('common', 'welcome');

      expect(result).toBe('Bonjour');
      expect(provider1.getLanguageAsync).toHaveBeenCalled();
    });
  });
});
