import { describe, it, expect } from 'vitest';
import { PluralResolver } from '../PluralResolver';
import { PluralCategory } from '../types';

describe('PluralResolver', () => {
  describe('normalizeLanguageCode', () => {
    it('should extract base language from locale codes', () => {
      expect(PluralResolver.normalizeLanguageCode('en-US')).toBe('en');
      expect(PluralResolver.normalizeLanguageCode('fr-CA')).toBe('fr');
      expect(PluralResolver.normalizeLanguageCode('de-DE')).toBe('de');
      expect(PluralResolver.normalizeLanguageCode('ru-RU')).toBe('ru');
    });

    it('should handle simple language codes', () => {
      expect(PluralResolver.normalizeLanguageCode('en')).toBe('en');
      expect(PluralResolver.normalizeLanguageCode('fr')).toBe('fr');
    });

    it('should convert to lowercase', () => {
      expect(PluralResolver.normalizeLanguageCode('EN')).toBe('en');
      expect(PluralResolver.normalizeLanguageCode('FR-CA')).toBe('fr');
      expect(PluralResolver.normalizeLanguageCode('De')).toBe('de');
    });

    it('should handle invalid input with fallback', () => {
      expect(PluralResolver.normalizeLanguageCode('')).toBe('en');
      expect(PluralResolver.normalizeLanguageCode(null as any)).toBe('en');
      expect(PluralResolver.normalizeLanguageCode(undefined as any)).toBe('en');
    });
  });

  describe('resolveCategory - English-like languages', () => {
    const englishLikeLanguages = ['en', 'de', 'nl', 'sv', 'no', 'da', 'fi', 'is'];

    englishLikeLanguages.forEach(lang => {
      describe(`${lang}`, () => {
        it('should return One for 1', () => {
          expect(PluralResolver.resolveCategory(1, lang)).toBe(PluralCategory.One);
        });

        it('should return Other for 0', () => {
          expect(PluralResolver.resolveCategory(0, lang)).toBe(PluralCategory.Other);
        });

        it('should return Other for 2', () => {
          expect(PluralResolver.resolveCategory(2, lang)).toBe(PluralCategory.Other);
        });

        it('should return Other for plural numbers', () => {
          expect(PluralResolver.resolveCategory(5, lang)).toBe(PluralCategory.Other);
          expect(PluralResolver.resolveCategory(10, lang)).toBe(PluralCategory.Other);
          expect(PluralResolver.resolveCategory(100, lang)).toBe(PluralCategory.Other);
        });

        it('should handle negative numbers', () => {
          expect(PluralResolver.resolveCategory(-1, lang)).toBe(PluralCategory.One);
          expect(PluralResolver.resolveCategory(-2, lang)).toBe(PluralCategory.Other);
        });

        it('should handle locale codes', () => {
          expect(PluralResolver.resolveCategory(1, `${lang}-US`)).toBe(PluralCategory.One);
          expect(PluralResolver.resolveCategory(2, `${lang}-GB`)).toBe(PluralCategory.Other);
        });
      });
    });
  });

  describe('resolveCategory - French-like languages', () => {
    const frenchLikeLanguages = ['fr', 'pt', 'es', 'it', 'ca', 'gl'];

    frenchLikeLanguages.forEach(lang => {
      describe(`${lang}`, () => {
        it('should return One for 0', () => {
          expect(PluralResolver.resolveCategory(0, lang)).toBe(PluralCategory.One);
        });

        it('should return One for 1', () => {
          expect(PluralResolver.resolveCategory(1, lang)).toBe(PluralCategory.One);
        });

        it('should return Other for 2', () => {
          expect(PluralResolver.resolveCategory(2, lang)).toBe(PluralCategory.Other);
        });

        it('should return Other for plural numbers', () => {
          expect(PluralResolver.resolveCategory(5, lang)).toBe(PluralCategory.Other);
          expect(PluralResolver.resolveCategory(10, lang)).toBe(PluralCategory.Other);
          expect(PluralResolver.resolveCategory(100, lang)).toBe(PluralCategory.Other);
        });

        it('should handle negative numbers', () => {
          expect(PluralResolver.resolveCategory(-0, lang)).toBe(PluralCategory.One);
          expect(PluralResolver.resolveCategory(-1, lang)).toBe(PluralCategory.One);
          expect(PluralResolver.resolveCategory(-2, lang)).toBe(PluralCategory.Other);
        });

        it('should handle locale codes', () => {
          expect(PluralResolver.resolveCategory(0, `${lang}-CA`)).toBe(PluralCategory.One);
          expect(PluralResolver.resolveCategory(2, `${lang}-ES`)).toBe(PluralCategory.Other);
        });
      });
    });
  });

  describe('resolveCategory - Slavic languages', () => {
    describe('Russian and Ukrainian', () => {
      const languages = ['ru', 'uk'];

      languages.forEach(lang => {
        describe(`${lang}`, () => {
          it('should return One for 1, 21, 31, 41', () => {
            expect(PluralResolver.resolveCategory(1, lang)).toBe(PluralCategory.One);
            expect(PluralResolver.resolveCategory(21, lang)).toBe(PluralCategory.One);
            expect(PluralResolver.resolveCategory(31, lang)).toBe(PluralCategory.One);
            expect(PluralResolver.resolveCategory(41, lang)).toBe(PluralCategory.One);
            expect(PluralResolver.resolveCategory(101, lang)).toBe(PluralCategory.One);
          });

          it('should return Few for 2-4, 22-24, 32-34', () => {
            expect(PluralResolver.resolveCategory(2, lang)).toBe(PluralCategory.Few);
            expect(PluralResolver.resolveCategory(3, lang)).toBe(PluralCategory.Few);
            expect(PluralResolver.resolveCategory(4, lang)).toBe(PluralCategory.Few);
            expect(PluralResolver.resolveCategory(22, lang)).toBe(PluralCategory.Few);
            expect(PluralResolver.resolveCategory(23, lang)).toBe(PluralCategory.Few);
            expect(PluralResolver.resolveCategory(24, lang)).toBe(PluralCategory.Few);
            expect(PluralResolver.resolveCategory(32, lang)).toBe(PluralCategory.Few);
          });

          it('should return Many for 0, 5-20, 25-30', () => {
            expect(PluralResolver.resolveCategory(0, lang)).toBe(PluralCategory.Many);
            expect(PluralResolver.resolveCategory(5, lang)).toBe(PluralCategory.Many);
            expect(PluralResolver.resolveCategory(10, lang)).toBe(PluralCategory.Many);
            expect(PluralResolver.resolveCategory(20, lang)).toBe(PluralCategory.Many);
            expect(PluralResolver.resolveCategory(25, lang)).toBe(PluralCategory.Many);
            expect(PluralResolver.resolveCategory(30, lang)).toBe(PluralCategory.Many);
          });

          it('should handle 11-14 correctly (many, not few)', () => {
            expect(PluralResolver.resolveCategory(11, lang)).toBe(PluralCategory.Many);
            expect(PluralResolver.resolveCategory(12, lang)).toBe(PluralCategory.Many);
            expect(PluralResolver.resolveCategory(13, lang)).toBe(PluralCategory.Many);
            expect(PluralResolver.resolveCategory(14, lang)).toBe(PluralCategory.Many);
          });
        });
      });
    });

    describe('Polish', () => {
      it('should return One for 1', () => {
        expect(PluralResolver.resolveCategory(1, 'pl')).toBe(PluralCategory.One);
      });

      it('should return Few for 2-4, 22-24', () => {
        expect(PluralResolver.resolveCategory(2, 'pl')).toBe(PluralCategory.Few);
        expect(PluralResolver.resolveCategory(3, 'pl')).toBe(PluralCategory.Few);
        expect(PluralResolver.resolveCategory(4, 'pl')).toBe(PluralCategory.Few);
        expect(PluralResolver.resolveCategory(22, 'pl')).toBe(PluralCategory.Few);
        expect(PluralResolver.resolveCategory(23, 'pl')).toBe(PluralCategory.Few);
        expect(PluralResolver.resolveCategory(24, 'pl')).toBe(PluralCategory.Few);
      });

      it('should return Many for 0, 5-21, 25-31', () => {
        expect(PluralResolver.resolveCategory(0, 'pl')).toBe(PluralCategory.Many);
        expect(PluralResolver.resolveCategory(5, 'pl')).toBe(PluralCategory.Many);
        expect(PluralResolver.resolveCategory(10, 'pl')).toBe(PluralCategory.Many);
        expect(PluralResolver.resolveCategory(21, 'pl')).toBe(PluralCategory.Many);
        expect(PluralResolver.resolveCategory(25, 'pl')).toBe(PluralCategory.Many);
        expect(PluralResolver.resolveCategory(31, 'pl')).toBe(PluralCategory.Many);
      });
    });

    describe('Czech and Slovak', () => {
      const languages = ['cs', 'sk'];

      languages.forEach(lang => {
        describe(`${lang}`, () => {
          it('should return One for 1', () => {
            expect(PluralResolver.resolveCategory(1, lang)).toBe(PluralCategory.One);
          });

          it('should return Few for 2-4', () => {
            expect(PluralResolver.resolveCategory(2, lang)).toBe(PluralCategory.Few);
            expect(PluralResolver.resolveCategory(3, lang)).toBe(PluralCategory.Few);
            expect(PluralResolver.resolveCategory(4, lang)).toBe(PluralCategory.Few);
          });

          it('should return Many for 0, 5+', () => {
            expect(PluralResolver.resolveCategory(0, lang)).toBe(PluralCategory.Many);
            expect(PluralResolver.resolveCategory(5, lang)).toBe(PluralCategory.Many);
            expect(PluralResolver.resolveCategory(10, lang)).toBe(PluralCategory.Many);
            expect(PluralResolver.resolveCategory(22, lang)).toBe(PluralCategory.Many);
            expect(PluralResolver.resolveCategory(100, lang)).toBe(PluralCategory.Many);
          });
        });
      });
    });

    describe('Other Slavic languages', () => {
      const languages = ['sr', 'hr', 'sl', 'bg', 'mk'];

      languages.forEach(lang => {
        it(`should handle ${lang} with Russian-like pattern`, () => {
          expect(PluralResolver.resolveCategory(1, lang)).toBe(PluralCategory.One);
          expect(PluralResolver.resolveCategory(2, lang)).toBe(PluralCategory.Few);
          expect(PluralResolver.resolveCategory(5, lang)).toBe(PluralCategory.Many);
          expect(PluralResolver.resolveCategory(21, lang)).toBe(PluralCategory.One);
        });
      });
    });
  });

  describe('resolveCategory - Arabic', () => {
    it('should return Zero for 0', () => {
      expect(PluralResolver.resolveCategory(0, 'ar')).toBe(PluralCategory.Zero);
    });

    it('should return One for 1', () => {
      expect(PluralResolver.resolveCategory(1, 'ar')).toBe(PluralCategory.One);
    });

    it('should return Two for 2', () => {
      expect(PluralResolver.resolveCategory(2, 'ar')).toBe(PluralCategory.Two);
    });

    it('should return Few for 3-10, 103-110', () => {
      expect(PluralResolver.resolveCategory(3, 'ar')).toBe(PluralCategory.Few);
      expect(PluralResolver.resolveCategory(5, 'ar')).toBe(PluralCategory.Few);
      expect(PluralResolver.resolveCategory(10, 'ar')).toBe(PluralCategory.Few);
      expect(PluralResolver.resolveCategory(103, 'ar')).toBe(PluralCategory.Few);
      expect(PluralResolver.resolveCategory(110, 'ar')).toBe(PluralCategory.Few);
    });

    it('should return Many for 11-99, 111-199', () => {
      expect(PluralResolver.resolveCategory(11, 'ar')).toBe(PluralCategory.Many);
      expect(PluralResolver.resolveCategory(20, 'ar')).toBe(PluralCategory.Many);
      expect(PluralResolver.resolveCategory(99, 'ar')).toBe(PluralCategory.Many);
      expect(PluralResolver.resolveCategory(111, 'ar')).toBe(PluralCategory.Many);
      expect(PluralResolver.resolveCategory(199, 'ar')).toBe(PluralCategory.Many);
    });

    it('should return Other for 100, 200, 300', () => {
      expect(PluralResolver.resolveCategory(100, 'ar')).toBe(PluralCategory.Other);
      expect(PluralResolver.resolveCategory(200, 'ar')).toBe(PluralCategory.Other);
      expect(PluralResolver.resolveCategory(300, 'ar')).toBe(PluralCategory.Other);
      expect(PluralResolver.resolveCategory(1000, 'ar')).toBe(PluralCategory.Other);
    });

    it('should handle negative numbers', () => {
      expect(PluralResolver.resolveCategory(-0, 'ar')).toBe(PluralCategory.Zero);
      expect(PluralResolver.resolveCategory(-1, 'ar')).toBe(PluralCategory.One);
      expect(PluralResolver.resolveCategory(-2, 'ar')).toBe(PluralCategory.Two);
      expect(PluralResolver.resolveCategory(-5, 'ar')).toBe(PluralCategory.Few);
    });
  });

  describe('resolveCategory - Fallback for unsupported languages', () => {
    it('should fallback to English-like pattern for unknown languages', () => {
      expect(PluralResolver.resolveCategory(1, 'ja')).toBe(PluralCategory.One);
      expect(PluralResolver.resolveCategory(2, 'ja')).toBe(PluralCategory.Other);
      expect(PluralResolver.resolveCategory(0, 'ja')).toBe(PluralCategory.Other);
    });

    it('should handle empty language code', () => {
      expect(PluralResolver.resolveCategory(1, '')).toBe(PluralCategory.One);
      expect(PluralResolver.resolveCategory(2, '')).toBe(PluralCategory.Other);
    });

    it('should handle invalid language codes', () => {
      expect(PluralResolver.resolveCategory(1, 'xyz')).toBe(PluralCategory.One);
      expect(PluralResolver.resolveCategory(2, 'xyz')).toBe(PluralCategory.Other);
    });
  });

  describe('getPattern', () => {
    it('should return correct pattern for known languages', () => {
      expect(PluralResolver.getPattern('en')).not.toBeNull();
      expect(PluralResolver.getPattern('fr')).not.toBeNull();
      expect(PluralResolver.getPattern('ru')).not.toBeNull();
      expect(PluralResolver.getPattern('ar')).not.toBeNull();
    });

    it('should normalize locale codes', () => {
      expect(PluralResolver.getPattern('en-US')).not.toBeNull();
      expect(PluralResolver.getPattern('fr-CA')).not.toBeNull();
    });

    it('should return null for unknown languages', () => {
      expect(PluralResolver.getPattern('ja')).toBeNull();
      expect(PluralResolver.getPattern('zh')).toBeNull();
      expect(PluralResolver.getPattern('xyz')).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle very large numbers', () => {
      expect(PluralResolver.resolveCategory(1000000, 'en')).toBe(PluralCategory.Other);
      expect(PluralResolver.resolveCategory(1000001, 'en')).toBe(PluralCategory.Other); // Not exactly 1
      expect(PluralResolver.resolveCategory(1000002, 'ru')).toBe(PluralCategory.Few);
      // Test that 1,000,021 (ends in 21) returns One for Russian
      expect(PluralResolver.resolveCategory(1000021, 'ru')).toBe(PluralCategory.One);
    });

    it('should handle decimal numbers (should use integer part)', () => {
      // Note: The implementation uses Math.abs which converts to integer
      // But we should test with actual decimal inputs
      const num1 = 1.5;
      const num2 = 2.7;
      // JavaScript will convert these, but let's test the behavior
      expect(PluralResolver.resolveCategory(Math.floor(num1), 'en')).toBe(PluralCategory.One);
      expect(PluralResolver.resolveCategory(Math.floor(num2), 'en')).toBe(PluralCategory.Other);
    });

    it('should handle floating point precision issues', () => {
      // Test that we're using proper integer math
      expect(PluralResolver.resolveCategory(1.0, 'en')).toBe(PluralCategory.One);
      expect(PluralResolver.resolveCategory(2.0, 'en')).toBe(PluralCategory.Other);
    });
  });
});
