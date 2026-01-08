import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CultureLanguageProvider } from '../providers/CultureLanguageProvider';

describe('CultureLanguageProvider', () => {
  let originalNavigator: typeof navigator;

  beforeEach(() => {
    // Save original navigator
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    // Restore original navigator using Object.defineProperty
    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    } else {
      // @ts-expect-error - intentionally removing navigator
      delete global.navigator;
    }
  });

  describe('getLanguageAsync', () => {
    it('should return language from navigator.language', async () => {
      // Mock navigator using Object.defineProperty
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'en-US',
        },
        writable: true,
        configurable: true,
      });

      const provider = new CultureLanguageProvider();
      const result = await provider.getLanguageAsync();
      expect(result).toBe('en');
    });

    it('should normalize locale codes to language codes', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'fr-CA',
        },
        writable: true,
        configurable: true,
      });

      const provider = new CultureLanguageProvider();
      const result = await provider.getLanguageAsync();
      expect(result).toBe('fr');
    });

    it('should normalize uppercase language codes', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'DE-DE',
        },
        writable: true,
        configurable: true,
      });

      const provider = new CultureLanguageProvider();
      const result = await provider.getLanguageAsync();
      expect(result).toBe('de');
    });

    it('should return null when navigator is undefined', async () => {
      // @ts-expect-error - intentionally removing navigator
      delete global.navigator;

      const provider = new CultureLanguageProvider();
      const result = await provider.getLanguageAsync();
      expect(result).toBeNull();
    });

    it('should return null when navigator.language is undefined', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      });

      const provider = new CultureLanguageProvider();
      const result = await provider.getLanguageAsync();
      expect(result).toBeNull();
    });

    it('should handle various locale formats', async () => {
      const testCases = [
        { input: 'en-US', expected: 'en' },
        { input: 'fr-CA', expected: 'fr' },
        { input: 'de-DE', expected: 'de' },
        { input: 'zh-CN', expected: 'zh' },
        { input: 'ja-JP', expected: 'ja' },
        { input: 'es-ES', expected: 'es' },
      ];

      for (const testCase of testCases) {
        Object.defineProperty(global, 'navigator', {
          value: {
            language: testCase.input,
          },
          writable: true,
          configurable: true,
        });

        const provider = new CultureLanguageProvider();
        const result = await provider.getLanguageAsync();
        expect(result).toBe(testCase.expected);
      }
    });
  });
});
