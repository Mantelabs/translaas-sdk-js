import type { ILanguageProvider } from '../types';

/**
 * Browser culture language provider that uses navigator.language
 * This provider is only available in browser environments
 */
export class CultureLanguageProvider implements ILanguageProvider {
  /**
   * Returns the browser's language from navigator.language
   * @returns Promise resolving to the language code or null if navigator is not available
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
