import { PluralCategory } from './types';

/**
 * Resolves CLDR plural categories (`zero` / `one` / `two` / `few` / `many` / `other`)
 * via `Intl.PluralRules`. Requires a runtime that implements `Intl.PluralRules`
 * (Node `^20.19.0 || >=22.12.0` and modern browsers). No ICU polyfill is bundled.
 *
 * `resolveCategory` passes the request BCP-47 tag to Intl when it is a valid locale.
 * `normalizeLanguageCode` is a public helper and is used only as a constructor fallback.
 */
export class PluralResolver {
  private static readonly PLURAL_RULES_CACHE = new Map<string, Intl.PluralRules>();

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
   * Resolves the plural category for a given number and language code using CLDR
   * cardinal rules from `Intl.PluralRules`.
   *
   * @param number The number to determine plural category for (passed to `select` as-is)
   * @param lang Language code (e.g., "en", "fr", "ru", "ar") or locale code (e.g., "en-US", "pt-PT")
   * @returns The appropriate PluralCategory
   *
   * @example
   * ```typescript
   * PluralResolver.resolveCategory(1, 'en'); // PluralCategory.One
   * PluralResolver.resolveCategory(0, 'en'); // PluralCategory.Other
   * PluralResolver.resolveCategory(0, 'ar'); // PluralCategory.Zero
   * PluralResolver.resolveCategory(2, 'ar'); // PluralCategory.Two
   * PluralResolver.resolveCategory(0, 'pt-PT'); // PluralCategory.Other
   * ```
   */
  static resolveCategory(number: number, lang: string): PluralCategory {
    const rules = this.getPluralRules(lang);
    return this.categoryFromSelect(rules.select(number));
  }

  private static categoryFromSelect(selected: string): PluralCategory {
    switch (selected) {
      case 'zero':
        return PluralCategory.Zero;
      case 'one':
        return PluralCategory.One;
      case 'two':
        return PluralCategory.Two;
      case 'few':
        return PluralCategory.Few;
      case 'many':
        return PluralCategory.Many;
      default:
        return PluralCategory.Other;
    }
  }

  private static resolveLocaleTag(lang: string): string {
    if (!lang || typeof lang !== 'string') {
      return 'en';
    }

    const trimmed = lang.trim().replace(/_/g, '-');
    return trimmed.length === 0 ? 'en' : trimmed;
  }

  private static getPluralRules(lang: string): Intl.PluralRules {
    const locale = this.resolveLocaleTag(lang);
    const cached = this.PLURAL_RULES_CACHE.get(locale);
    if (cached) {
      return cached;
    }

    const rules = this.createPluralRules(locale);
    this.PLURAL_RULES_CACHE.set(locale, rules);
    return rules;
  }

  private static createPluralRules(locale: string): Intl.PluralRules {
    try {
      return new Intl.PluralRules(locale);
    } catch {
      const base = this.normalizeLanguageCode(locale);
      if (base !== locale) {
        try {
          return new Intl.PluralRules(base);
        } catch {
          return new Intl.PluralRules('en');
        }
      }
      return new Intl.PluralRules('en');
    }
  }
}
