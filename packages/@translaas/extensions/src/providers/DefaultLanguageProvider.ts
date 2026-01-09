import type { ILanguageProvider } from '../types';

/**
 * Default language provider that returns a configured default language.
 *
 * This provider always returns the same language code, making it useful as
 * a fallback in language resolver chains.
 *
 * @example
 * ```typescript
 * // Use as fallback in resolver chain
 * const resolver = new LanguageResolver([
 *   new RequestLanguageProvider(req),
 *   new DefaultLanguageProvider('en') // Always fallback to English
 * ]);
 *
 * // Or use standalone
 * const provider = new DefaultLanguageProvider('en');
 * const lang = await provider.getLanguageAsync(); // Always returns 'en'
 * ```
 *
 * @see {@link ILanguageProvider} for the interface definition
 */
export class DefaultLanguageProvider implements ILanguageProvider {
  /**
   * Creates a new DefaultLanguageProvider instance.
   *
   * @param defaultLanguage - The default language code (ISO 639-1, e.g., 'en', 'fr')
   * @throws Error if defaultLanguage is empty or whitespace
   *
   * @example
   * ```typescript
   * const provider = new DefaultLanguageProvider('en');
   * ```
   */
  constructor(private readonly defaultLanguage: string) {
    if (!defaultLanguage || defaultLanguage.trim() === '') {
      throw new Error('Default language cannot be empty');
    }
  }

  /**
   * Returns the configured default language.
   *
   * The language code is normalized (e.g., "en-US" → "en") before being returned.
   *
   * @returns Promise resolving to the normalized default language code
   *
   * @example
   * ```typescript
   * const provider = new DefaultLanguageProvider('en-US');
   * const lang = await provider.getLanguageAsync(); // Returns 'en'
   * ```
   */
  async getLanguageAsync(): Promise<string | null> {
    return this.normalizeLanguage(this.defaultLanguage);
  }

  /**
   * Normalizes a language code (e.g., "en-US" -> "en")
   * @param lang Language code to normalize
   * @returns Normalized language code
   */
  private normalizeLanguage(lang: string): string {
    // Extract the primary language code (ISO 639-1)
    // "en-US" -> "en", "fr-CA" -> "fr", etc.
    const parts = lang.split('-');
    return parts[0].toLowerCase();
  }
}
