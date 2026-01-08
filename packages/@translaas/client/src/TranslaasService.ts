import { TranslaasClient } from './TranslaasClient';
import type { TranslaasOptions } from '@translaas/models';
import { TranslaasConfigurationException } from '@translaas/models';
import type { ILanguageResolver } from '@translaas/extensions';

/**
 * Translaas service providing convenient translation methods
 * Wraps TranslaasClient with automatic language resolution support
 */
export class TranslaasService {
  private readonly client: TranslaasClient;
  private readonly languageResolver?: ILanguageResolver;
  private readonly defaultLanguage?: string;

  constructor(options: TranslaasOptions) {
    this.client = new TranslaasClient(options);
    this.languageResolver = options.languageResolver;
    this.defaultLanguage = options.defaultLanguage;
  }

  /**
   * Gets a translation entry with automatic language resolution
   * @param group - Translation group name
   * @param entry - Translation entry key
   * @param lang - Optional language code (ISO 639-1). If omitted, language resolver will be used.
   * @param number - Optional number for pluralization
   * @param parameters - Optional custom parameters for template substitution
   * @param cancellationToken - Optional AbortSignal to cancel the request
   * @returns Promise resolving to the translation text
   * @throws TranslaasConfigurationException if language cannot be resolved and no default language is set
   */
  async t(
    group: string,
    entry: string,
    lang?: string,
    number?: number,
    parameters?: Record<string, string>,
    cancellationToken?: AbortSignal
  ): Promise<string> {
    let resolvedLang: string | null = null;

    // If language is provided, use it directly
    if (lang) {
      resolvedLang = lang;
    } else {
      // Try to resolve language using resolver
      if (this.languageResolver) {
        resolvedLang = await this.languageResolver.resolveLanguageAsync();
      }

      // Fallback to default language if resolver didn't return a language
      if (!resolvedLang && this.defaultLanguage) {
        resolvedLang = this.defaultLanguage;
      }

      // If still no language, throw error
      if (!resolvedLang) {
        throw new TranslaasConfigurationException(
          'Language is required. Either provide a language parameter, configure a language resolver, or set a default language.'
        );
      }
    }

    return this.client.getEntryAsync(
      group,
      entry,
      resolvedLang,
      number,
      parameters,
      cancellationToken
    );
  }
}
