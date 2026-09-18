import { describe, it, expect } from 'vitest';
import { PluralResolver } from '../PluralResolver';
import { PluralCategory } from '../types';

function intlToPluralCategory(locale: string, n: number): PluralCategory {
  const selected = new Intl.PluralRules(locale).select(n);
  const mapped: Record<string, PluralCategory> = {
    zero: PluralCategory.Zero,
    one: PluralCategory.One,
    two: PluralCategory.Two,
    few: PluralCategory.Few,
    many: PluralCategory.Many,
    other: PluralCategory.Other,
  };
  return mapped[selected] ?? PluralCategory.Other;
}

function expectResolveCategory(n: number, locale: string): void {
  expect(PluralResolver.resolveCategory(n, locale)).toBe(intlToPluralCategory(locale, n));
}

describe('PluralResolver', () => {
  describe('normalizeLanguageCode', () => {
    it('normalizeLanguageCode_whenLocaleHasRegion_extractsBaseLanguage', () => {
      expect(PluralResolver.normalizeLanguageCode('en-US')).toBe('en');
      expect(PluralResolver.normalizeLanguageCode('fr-CA')).toBe('fr');
      expect(PluralResolver.normalizeLanguageCode('de-DE')).toBe('de');
      expect(PluralResolver.normalizeLanguageCode('ru-RU')).toBe('ru');
    });

    it('normalizeLanguageCode_whenSimpleCode_returnsLowercase', () => {
      expect(PluralResolver.normalizeLanguageCode('en')).toBe('en');
      expect(PluralResolver.normalizeLanguageCode('fr')).toBe('fr');
    });

    it('should convert to lowercase', () => {
      expect(PluralResolver.normalizeLanguageCode('EN')).toBe('en');
      expect(PluralResolver.normalizeLanguageCode('FR-CA')).toBe('fr');
      expect(PluralResolver.normalizeLanguageCode('De')).toBe('de');
    });

    it('normalizeLanguageCode_whenInvalidInput_fallsBackToEn', () => {
      expect(PluralResolver.normalizeLanguageCode('')).toBe('en');
      expect(PluralResolver.normalizeLanguageCode(null as unknown as string)).toBe('en');
      expect(PluralResolver.normalizeLanguageCode(undefined as unknown as string)).toBe('en');
    });
  });

  describe('resolveCategory', () => {
    it.each([
      ['ar', 0, PluralCategory.Zero],
      ['ar', 2, PluralCategory.Two],
      ['pl', 2, PluralCategory.Few],
      ['fr', 0, PluralCategory.One],
      ['en', 0, PluralCategory.Other],
      ['en', 1, PluralCategory.One],
    ] as const)(
      'resolveCategory_whenGoldenTableRow_matchesIntlPluralRules (%s, %s)',
      (locale, n, category) => {
        expect(PluralResolver.resolveCategory(n, locale)).toBe(category);
        expectResolveCategory(n, locale);
      }
    );

    it('resolveCategory_whenHebrewTwo_matchesIntlPluralRules', () => {
      expect(PluralResolver.resolveCategory(2, 'he')).toBe(PluralCategory.Two);
      expectResolveCategory(2, 'he');
    });

    it('resolveCategory_whenLithuanianTwo_matchesIntlPluralRules', () => {
      expect(PluralResolver.resolveCategory(2, 'lt')).toBe(PluralCategory.Few);
      expectResolveCategory(2, 'lt');
    });

    it('resolveCategory_whenIrishThreeAndSeven_matchIntlPluralRules', () => {
      expect(PluralResolver.resolveCategory(3, 'ga')).toBe(PluralCategory.Few);
      expect(PluralResolver.resolveCategory(7, 'ga')).toBe(PluralCategory.Many);
      expectResolveCategory(3, 'ga');
      expectResolveCategory(7, 'ga');
    });

    it('resolveCategory_whenPortugueseBrazilZero_matchesIntlOne', () => {
      expect(PluralResolver.resolveCategory(0, 'pt')).toBe(PluralCategory.One);
      expectResolveCategory(0, 'pt');
    });

    it('resolveCategory_whenPortuguesePortugalZero_matchesIntlOther', () => {
      expect(PluralResolver.resolveCategory(0, 'pt-PT')).toBe(PluralCategory.Other);
      expectResolveCategory(0, 'pt-PT');
    });

    it('resolveCategory_whenJapaneseOne_matchesIntlNotEnglishLike', () => {
      expect(PluralResolver.resolveCategory(1, 'ja')).toBe(PluralCategory.Other);
      expectResolveCategory(1, 'ja');
    });

    it('resolveCategory_whenBulgarianTwo_matchesIntlNotSlavicFew', () => {
      expect(PluralResolver.resolveCategory(2, 'bg')).toBe(PluralCategory.Other);
      expectResolveCategory(2, 'bg');
    });

    it('resolveCategory_whenSpanishZero_matchesIntlNotFrenchLike', () => {
      expect(PluralResolver.resolveCategory(0, 'es')).toBe(PluralCategory.Other);
      expectResolveCategory(0, 'es');
    });

    it('resolveCategory_whenCzechFive_matchesIntlNotHomemadeMany', () => {
      expect(PluralResolver.resolveCategory(5, 'cs')).toBe(PluralCategory.Other);
      expectResolveCategory(5, 'cs');
    });

    it('resolveCategory_whenLocaleSample_matchesIntlForRandomPairs', () => {
      const locales = ['en', 'fr', 'ru', 'pl', 'ar', 'he', 'lt', 'ga'];
      const counts = [0, 1, 2, 3, 5, 7, 11, 21, 100];
      for (const locale of locales) {
        for (const n of counts) {
          expectResolveCategory(n, locale);
        }
      }
    });

    it('resolveCategory_whenNegativeN_matchesIntl', () => {
      expectResolveCategory(-1, 'en');
      expectResolveCategory(-2, 'ar');
    });

    it('resolveCategory_whenDecimalN_matchesIntl', () => {
      expectResolveCategory(1.5, 'en');
      expectResolveCategory(1.5, 'fr');
    });

    it('resolveCategory_whenVeryLargeN_matchesIntl', () => {
      expectResolveCategory(1_000_000, 'en');
      expectResolveCategory(1_000_021, 'ru');
    });

    it('resolveCategory_whenEmptyLang_fallsBackToEnglish', () => {
      expect(PluralResolver.resolveCategory(1, '')).toBe(PluralCategory.One);
      expect(PluralResolver.resolveCategory(2, '')).toBe(PluralCategory.Other);
    });

    it('resolveCategory_whenInvalidLang_doesNotThrow', () => {
      expect(() => PluralResolver.resolveCategory(1, 'not a locale!!!')).not.toThrow();
      expect(PluralResolver.resolveCategory(1, 'not a locale!!!')).toBe(
        intlToPluralCategory('en', 1)
      );
    });

    it('resolveCategory_whenUnderscoreLocale_normalizesToBcp47', () => {
      expect(PluralResolver.resolveCategory(1, 'en_US')).toBe(PluralCategory.One);
      expect(PluralResolver.resolveCategory(2, 'en_US')).toBe(PluralCategory.Other);
    });
  });
});
