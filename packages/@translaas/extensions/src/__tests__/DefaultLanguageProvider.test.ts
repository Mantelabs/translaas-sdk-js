import { describe, it, expect } from 'vitest';
import { DefaultLanguageProvider } from '../providers/DefaultLanguageProvider';

describe('DefaultLanguageProvider', () => {
  describe('constructor', () => {
    it('should create provider with valid default language', () => {
      const provider = new DefaultLanguageProvider('en');
      expect(provider).toBeInstanceOf(DefaultLanguageProvider);
    });

    it('should throw error when default language is empty', () => {
      expect(() => new DefaultLanguageProvider('')).toThrow('Default language cannot be empty');
    });

    it('should throw error when default language is whitespace', () => {
      expect(() => new DefaultLanguageProvider('   ')).toThrow('Default language cannot be empty');
    });
  });

  describe('getLanguageAsync', () => {
    it('should return normalized language code', async () => {
      const provider = new DefaultLanguageProvider('en');
      const result = await provider.getLanguageAsync();
      expect(result).toBe('en');
    });

    it('should normalize locale codes to language codes', async () => {
      const provider = new DefaultLanguageProvider('en-US');
      const result = await provider.getLanguageAsync();
      expect(result).toBe('en');
    });

    it('should normalize uppercase language codes', async () => {
      const provider = new DefaultLanguageProvider('FR');
      const result = await provider.getLanguageAsync();
      expect(result).toBe('fr');
    });

    it('should normalize mixed case locale codes', async () => {
      const provider = new DefaultLanguageProvider('Fr-Ca');
      const result = await provider.getLanguageAsync();
      expect(result).toBe('fr');
    });

    it('should handle various locale formats', async () => {
      const testCases = [
        { input: 'en-US', expected: 'en' },
        { input: 'fr-CA', expected: 'fr' },
        { input: 'de-DE', expected: 'de' },
        { input: 'zh-CN', expected: 'zh' },
        { input: 'ja-JP', expected: 'ja' },
      ];

      for (const testCase of testCases) {
        const provider = new DefaultLanguageProvider(testCase.input);
        const result = await provider.getLanguageAsync();
        expect(result).toBe(testCase.expected);
      }
    });
  });
});
