import { PluralCategory } from './types';

/**
 * Language pluralization patterns
 */
enum PluralPattern {
  EnglishLike = 'english-like',
  FrenchLike = 'french-like',
  Slavic = 'slavic',
  Arabic = 'arabic',
}

/**
 * Language to pattern mapping
 */
const LANGUAGE_PATTERNS: Record<string, PluralPattern> = {
  // English-like: one vs other
  en: PluralPattern.EnglishLike,
  de: PluralPattern.EnglishLike,
  nl: PluralPattern.EnglishLike,
  sv: PluralPattern.EnglishLike,
  no: PluralPattern.EnglishLike,
  da: PluralPattern.EnglishLike,
  fi: PluralPattern.EnglishLike,
  is: PluralPattern.EnglishLike,

  // French-like: one vs other (n == 0 || n == 1)
  fr: PluralPattern.FrenchLike,
  pt: PluralPattern.FrenchLike,
  es: PluralPattern.FrenchLike,
  it: PluralPattern.FrenchLike,
  ca: PluralPattern.FrenchLike,
  gl: PluralPattern.FrenchLike,

  // Slavic: one, few, many, other
  ru: PluralPattern.Slavic,
  uk: PluralPattern.Slavic,
  pl: PluralPattern.Slavic,
  cs: PluralPattern.Slavic,
  sk: PluralPattern.Slavic,
  sr: PluralPattern.Slavic,
  hr: PluralPattern.Slavic,
  sl: PluralPattern.Slavic,
  bg: PluralPattern.Slavic,
  mk: PluralPattern.Slavic,

  // Arabic: zero, one, two, few, many, other
  ar: PluralPattern.Arabic,
};

/**
 * PluralResolver utility class that determines the correct plural category
 * for a given number and language code based on CLDR rules.
 */
export class PluralResolver {
  /**
   * Normalizes a language code by extracting the base language from locale codes.
   * Examples: "en-US" → "en", "fr-CA" → "fr", "en" → "en"
   * @param lang Language or locale code
   * @returns Normalized language code (lowercase)
   */
  static normalizeLanguageCode(lang: string): string {
    if (!lang || typeof lang !== 'string') {
      return 'en'; // Default fallback
    }

    // Extract base language code (before hyphen)
    const baseLang = lang.split('-')[0].toLowerCase();
    return baseLang;
  }

  /**
   * Gets the plural pattern for a given language code
   * @param lang Language code (will be normalized)
   * @returns Plural pattern or null if not found
   */
  static getPattern(lang: string): PluralPattern | null {
    const normalizedLang = this.normalizeLanguageCode(lang);
    return LANGUAGE_PATTERNS[normalizedLang] || null;
  }

  /**
   * Resolves the plural category for a given number and language code.
   *
   * @param number The number to determine plural category for
   * @param lang Language code (e.g., "en", "fr", "ru", "ar") or locale code (e.g., "en-US", "fr-CA")
   * @returns The appropriate PluralCategory
   *
   * @example
   * ```typescript
   * PluralResolver.resolveCategory(1, 'en'); // PluralCategory.One
   * PluralResolver.resolveCategory(0, 'en'); // PluralCategory.Other
   * PluralResolver.resolveCategory(0, 'ar'); // PluralCategory.Zero
   * PluralResolver.resolveCategory(2, 'ar'); // PluralCategory.Two
   * PluralResolver.resolveCategory(5, 'ru'); // PluralCategory.Many
   * ```
   */
  static resolveCategory(number: number, lang: string): PluralCategory {
    // Handle zero case first (returns Zero category when number is 0)
    if (number === 0) {
      const pattern = this.getPattern(lang);
      // Arabic has explicit zero category
      if (pattern === PluralPattern.Arabic) {
        return PluralCategory.Zero;
      }
      // For other languages, zero typically falls into "many" or "other"
      // but we'll let the pattern logic handle it
    }

    const pattern = this.getPattern(lang);

    if (!pattern) {
      // Fallback to simple one/other logic for unsupported languages
      return this.resolveEnglishLike(number);
    }

    switch (pattern) {
      case PluralPattern.EnglishLike:
        return this.resolveEnglishLike(number);
      case PluralPattern.FrenchLike:
        return this.resolveFrenchLike(number);
      case PluralPattern.Slavic:
        return this.resolveSlavic(number, lang);
      case PluralPattern.Arabic:
        return this.resolveArabic(number);
      default:
        return this.resolveEnglishLike(number);
    }
  }

  /**
   * English-like pattern: one vs other
   * Languages: en, de, nl, sv, no, da, fi, is
   * Rule: n == 1 → one, else → other
   */
  private static resolveEnglishLike(number: number): PluralCategory {
    const n = Math.abs(number);
    if (n === 1) {
      return PluralCategory.One;
    }
    return PluralCategory.Other;
  }

  /**
   * French-like pattern: one vs other
   * Languages: fr, pt, es, it, ca, gl
   * Rule: n == 0 || n == 1 → one, else → other
   */
  private static resolveFrenchLike(number: number): PluralCategory {
    const n = Math.abs(number);
    if (n === 0 || n === 1) {
      return PluralCategory.One;
    }
    return PluralCategory.Other;
  }

  /**
   * Slavic pattern: one, few, many, other
   * Languages: ru, uk, pl, cs, sk, sr, hr, sl, bg, mk
   *
   * Rules vary by language:
   * - Russian/Ukrainian: one (1, 21, 31...), few (2-4, 22-24...), many (0, 5-20, 25-30...), other
   * - Polish: one (1), few (2-4, 22-24...), many (0, 5-21, 25-31...), other
   * - Czech/Slovak: one (1), few (2-4), many (0, 5+), other
   */
  private static resolveSlavic(number: number, lang: string): PluralCategory {
    const normalizedLang = this.normalizeLanguageCode(lang);
    const n = Math.abs(number);
    const mod10 = n % 10;
    const mod100 = n % 100;

    // Polish pattern
    if (normalizedLang === 'pl') {
      if (n === 1) {
        return PluralCategory.One;
      }
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return PluralCategory.Few;
      }
      return PluralCategory.Many;
    }

    // Czech and Slovak pattern
    if (normalizedLang === 'cs' || normalizedLang === 'sk') {
      if (n === 1) {
        return PluralCategory.One;
      }
      if (n >= 2 && n <= 4) {
        return PluralCategory.Few;
      }
      return PluralCategory.Many;
    }

    // Russian, Ukrainian, Serbian, Croatian, Slovenian, Bulgarian, Macedonian pattern
    // one: 1, 21, 31, 41, ...
    // few: 2-4, 22-24, 32-34, ...
    // many: 0, 5-20, 25-30, 35-40, ...
    if (mod10 === 1 && mod100 !== 11) {
      return PluralCategory.One;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return PluralCategory.Few;
    }
    return PluralCategory.Many;
  }

  /**
   * Arabic pattern: zero, one, two, few, many, other
   * Language: ar
   *
   * Rules:
   * - zero: 0
   * - one: 1
   * - two: 2
   * - few: 3-10, 103-110, 1003-1010, ...
   * - many: 11-99, 111-199, 1011-1099, ...
   * - other: 100, 200, 300, ...
   */
  private static resolveArabic(number: number): PluralCategory {
    const n = Math.abs(number);

    if (n === 0) {
      return PluralCategory.Zero;
    }
    if (n === 1) {
      return PluralCategory.One;
    }
    if (n === 2) {
      return PluralCategory.Two;
    }

    const mod100 = n % 100;

    // few: 3-10, 103-110, 1003-1010, ...
    if (mod100 >= 3 && mod100 <= 10) {
      return PluralCategory.Few;
    }

    // many: 11-99, 111-199, 1011-1099, ...
    if (mod100 >= 11 && mod100 <= 99) {
      return PluralCategory.Many;
    }

    // other: 100, 200, 300, ... (mod100 === 0)
    return PluralCategory.Other;
  }
}
