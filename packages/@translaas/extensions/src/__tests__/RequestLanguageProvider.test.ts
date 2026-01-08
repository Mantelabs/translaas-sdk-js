import { describe, it, expect } from 'vitest';
import { RequestLanguageProvider } from '../providers/RequestLanguageProvider';

describe('RequestLanguageProvider', () => {
  describe('getLanguageAsync', () => {
    it('should return language from route parameters', async () => {
      const request = {
        params: { lang: 'en' },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBe('en');
    });

    it('should return language from query string', async () => {
      const request = {
        query: { lang: 'fr' },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBe('fr');
    });

    it('should return language from cookies', async () => {
      const request = {
        cookies: { lang: 'de' },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBe('de');
    });

    it('should return language from Accept-Language header', async () => {
      const request = {
        headers: { 'accept-language': 'es-ES,es;q=0.9' },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBe('es');
    });

    it('should prioritize route params over query string', async () => {
      const request = {
        params: { lang: 'en' },
        query: { lang: 'fr' },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBe('en');
    });

    it('should prioritize query string over cookies', async () => {
      const request = {
        query: { lang: 'fr' },
        cookies: { lang: 'de' },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBe('fr');
    });

    it('should prioritize cookies over headers', async () => {
      const request = {
        cookies: { lang: 'de' },
        headers: { 'accept-language': 'es-ES,es;q=0.9' },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBe('de');
    });

    it('should normalize locale codes to language codes', async () => {
      const request = {
        params: { lang: 'en-US' },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBe('en');
    });

    it('should handle custom parameter names', async () => {
      const request = {
        params: { locale: 'fr' },
        query: { language: 'de' },
        cookies: { culture: 'es' },
        headers: { 'x-language': 'it' },
      };
      const provider = new RequestLanguageProvider(request, {
        route: 'locale',
        query: 'language',
        cookie: 'culture',
        header: 'x-language',
      });
      const result = await provider.getLanguageAsync();
      expect(result).toBe('fr');
    });

    it('should handle array query parameters', async () => {
      const request = {
        query: { lang: ['en', 'fr'] },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBe('en');
    });

    it('should handle array headers', async () => {
      const request = {
        headers: { 'accept-language': ['en-US,en;q=0.9', 'fr;q=0.8'] },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBe('en');
    });

    it('should parse Accept-Language header correctly', async () => {
      const request = {
        headers: { 'accept-language': 'fr-CA,fr;q=0.9,en;q=0.8' },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBe('fr');
    });

    it('should return null when no language is found', async () => {
      const request = {};
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBeNull();
    });

    it('should return null when language parameter is empty', async () => {
      const request = {
        params: { lang: '' },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBeNull();
    });

    it('should handle undefined query parameters', async () => {
      const request = {
        query: { lang: undefined },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBeNull();
    });

    it('should normalize uppercase language codes', async () => {
      const request = {
        params: { lang: 'FR' },
      };
      const provider = new RequestLanguageProvider(request);
      const result = await provider.getLanguageAsync();
      expect(result).toBe('fr');
    });
  });
});
