import { describe, it, expect, vi } from 'vitest';
import { LanguageResolver } from '../resolvers/LanguageResolver';
import type { ILanguageProvider } from '../types';
import { DefaultLanguageProvider } from '../providers/DefaultLanguageProvider';

describe('LanguageResolver', () => {
  describe('constructor', () => {
    it('should create resolver with valid providers', () => {
      const provider = new DefaultLanguageProvider('en');
      const resolver = new LanguageResolver([provider]);
      expect(resolver).toBeInstanceOf(LanguageResolver);
    });

    it('should throw error when providers array is empty', () => {
      expect(() => new LanguageResolver([])).toThrow('At least one language provider is required');
    });

    it('should throw error when providers is null', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => new LanguageResolver(null as any)).toThrow(
        'At least one language provider is required'
      );
    });
  });

  describe('resolveLanguageAsync', () => {
    it('should return first non-null result from providers', async () => {
      const provider1 = {
        getLanguageAsync: vi.fn().mockResolvedValue(null),
      } as unknown as ILanguageProvider;

      const provider2 = {
        getLanguageAsync: vi.fn().mockResolvedValue('fr'),
      } as unknown as ILanguageProvider;

      const provider3 = {
        getLanguageAsync: vi.fn().mockResolvedValue('de'),
      } as unknown as ILanguageProvider;

      const resolver = new LanguageResolver([provider1, provider2, provider3]);
      const result = await resolver.resolveLanguageAsync();

      expect(result).toBe('fr');
      expect(provider1.getLanguageAsync).toHaveBeenCalled();
      expect(provider2.getLanguageAsync).toHaveBeenCalled();
      expect(provider3.getLanguageAsync).not.toHaveBeenCalled();
    });

    it('should return null when all providers return null', async () => {
      const provider1 = {
        getLanguageAsync: vi.fn().mockResolvedValue(null),
      } as unknown as ILanguageProvider;

      const provider2 = {
        getLanguageAsync: vi.fn().mockResolvedValue(null),
      } as unknown as ILanguageProvider;

      const resolver = new LanguageResolver([provider1, provider2]);
      const result = await resolver.resolveLanguageAsync();

      expect(result).toBeNull();
      expect(provider1.getLanguageAsync).toHaveBeenCalled();
      expect(provider2.getLanguageAsync).toHaveBeenCalled();
    });

    it('should return null when all providers return empty strings', async () => {
      const provider1 = {
        getLanguageAsync: vi.fn().mockResolvedValue(''),
      } as unknown as ILanguageProvider;

      const provider2 = {
        getLanguageAsync: vi.fn().mockResolvedValue('   '),
      } as unknown as ILanguageProvider;

      const resolver = new LanguageResolver([provider1, provider2]);
      const result = await resolver.resolveLanguageAsync();

      expect(result).toBeNull();
    });

    it('should continue to next provider when current provider throws error', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const provider1 = {
        getLanguageAsync: vi.fn().mockRejectedValue(new Error('Provider error')),
      } as unknown as ILanguageProvider;

      const provider2 = {
        getLanguageAsync: vi.fn().mockResolvedValue('en'),
      } as unknown as ILanguageProvider;

      const resolver = new LanguageResolver([provider1, provider2]);
      const result = await resolver.resolveLanguageAsync();

      expect(result).toBe('en');
      expect(provider1.getLanguageAsync).toHaveBeenCalled();
      expect(provider2.getLanguageAsync).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should respect provider priority order', async () => {
      const provider1 = {
        getLanguageAsync: vi.fn().mockResolvedValue('en'),
      } as unknown as ILanguageProvider;

      const provider2 = {
        getLanguageAsync: vi.fn().mockResolvedValue('fr'),
      } as unknown as ILanguageProvider;

      const resolver = new LanguageResolver([provider1, provider2]);
      const result = await resolver.resolveLanguageAsync();

      expect(result).toBe('en');
      expect(provider2.getLanguageAsync).not.toHaveBeenCalled();
    });

    it('should work with real providers', async () => {
      const defaultProvider = new DefaultLanguageProvider('en');
      const resolver = new LanguageResolver([defaultProvider]);
      const result = await resolver.resolveLanguageAsync();
      expect(result).toBe('en');
    });

    it('should chain multiple real providers', async () => {
      const provider1 = {
        getLanguageAsync: vi.fn().mockResolvedValue(null),
      } as unknown as ILanguageProvider;

      const provider2 = new DefaultLanguageProvider('fr');
      const resolver = new LanguageResolver([provider1, provider2]);
      const result = await resolver.resolveLanguageAsync();
      expect(result).toBe('fr');
    });
  });

  describe('addProvider', () => {
    it('should add provider to the chain', () => {
      const provider1 = new DefaultLanguageProvider('en');
      const provider2 = new DefaultLanguageProvider('fr');
      const resolver = new LanguageResolver([provider1]);

      expect(resolver.getProviders().length).toBe(1);
      resolver.addProvider(provider2);
      expect(resolver.getProviders().length).toBe(2);
    });
  });

  describe('getProviders', () => {
    it('should return copy of providers array', () => {
      const provider1 = new DefaultLanguageProvider('en');
      const provider2 = new DefaultLanguageProvider('fr');
      const resolver = new LanguageResolver([provider1, provider2]);

      const providers = resolver.getProviders();
      expect(providers).toHaveLength(2);
      expect(providers[0]).toBe(provider1);
      expect(providers[1]).toBe(provider2);

      // Verify it's a copy (not the same reference)
      providers.push(new DefaultLanguageProvider('de'));
      expect(resolver.getProviders().length).toBe(2);
    });
  });
});
