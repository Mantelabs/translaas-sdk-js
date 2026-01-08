import type { ILanguageProvider } from '../types';

/**
 * Default language provider that returns a configured default language
 */
export class DefaultLanguageProvider implements ILanguageProvider {
  constructor(private readonly defaultLanguage: string) {
    if (!defaultLanguage || defaultLanguage.trim() === '') {
      throw new Error('Default language cannot be empty');
    }
  }

  /**
   * Returns the configured default language
   * @returns Promise resolving to the default language string
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
