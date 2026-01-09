import type { ILanguageProvider } from '../types';

/**
 * Browser culture language provider that uses navigator.language.
 *
 * This provider extracts the language from the browser's `navigator.language` property,
 * which reflects the user's preferred language setting. This provider is only available
 * in browser environments and returns null in Node.js or other non-browser environments.
 *
 * @example
 * ```typescript
 * // Use in browser applications
 * const resolver = new LanguageResolver([
 *   new CultureLanguageProvider(),      // Try browser language first
 *   new DefaultLanguageProvider('en')     // Fallback to English
 * ]);
 *
 * // Or use standalone
 * const provider = new CultureLanguageProvider();
 * const lang = await provider.getLanguageAsync(); // Returns browser language or null
 * ```
 *
 * @see {@link ILanguageProvider} for the interface definition
 */
export class CultureLanguageProvider implements ILanguageProvider {
  /**
   * Returns the browser's language from navigator.language.
   *
   * The language code is normalized (e.g., "en-US" → "en") before being returned.
   * Returns null if navigator is not available (e.g., in Node.js environments).
   *
   * @returns Promise resolving to the normalized language code or null if navigator is not available
   *
   * @example
   * ```typescript
   * const provider = new CultureLanguageProvider();
   * const lang = await provider.getLanguageAsync();
   * if (lang) {
   *   console.log(`Browser language: ${lang}`);
   * } else {
   *   console.log('Not in browser environment');
   * }
   * ```
   */
  async getLanguageAsync(): Promise<string | null> {
    // Check if we're in a browser environment
    if (typeof navigator === 'undefined' || !navigator.language) {
      return null;
    }

    return this.normalizeLanguage(navigator.language);
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
