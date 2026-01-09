import { TranslaasClient } from './TranslaasClient';
import type { TranslaasOptions } from '@translaas/models';
import { TranslaasConfigurationException } from '@translaas/models';
import type { ILanguageResolver } from '@translaas/extensions';

/**
 * Translaas service providing convenient translation methods.
 *
 * Wraps {@link TranslaasClient} with automatic language resolution support.
 * This is the recommended way to use the SDK as it handles language detection
 * automatically through configured language resolvers.
 *
 * @example
 * ```typescript
 * // Basic usage with default language
 * const service = new TranslaasService({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.translaas.com',
 *   defaultLanguage: 'en'
 * });
 *
 * // Language will be resolved automatically (uses defaultLanguage)
 * const text = await service.t('common', 'welcome');
 *
 * // With language resolver (Express.js example)
 * import { LanguageResolver, RequestLanguageProvider } from '@translaas/extensions';
 *
 * const service = new TranslaasService({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.translaas.com',
 *   languageResolver: new LanguageResolver([
 *     new RequestLanguageProvider(req),
 *     new DefaultLanguageProvider('en')
 *   ])
 * });
 *
 * // Language is automatically resolved from request
 * const text = await service.t('common', 'welcome');
 *
 * // Override language explicitly
 * const text = await service.t('common', 'welcome', 'fr');
 *
 * // With pluralization
 * const text = await service.t('messages', 'items', undefined, 5);
 *
 * // With parameters
 * const text = await service.t('common', 'greeting', undefined, undefined, {
 *   name: 'John'
 * });
 * ```
 *
 * @see {@link TranslaasClient} for lower-level API access
 */
export class TranslaasService {
  private readonly client: TranslaasClient;
  private readonly languageResolver?: ILanguageResolver;
  private readonly defaultLanguage?: string;

  /**
   * Creates a new TranslaasService instance.
   *
   * @param options - Configuration options for the service
   * @throws `TranslaasConfigurationException` if API key or base URL is missing
   *
   * @example
   * ```typescript
   * const service = new TranslaasService({
   *   apiKey: 'your-api-key',
   *   baseUrl: 'https://api.translaas.com',
   *   defaultLanguage: 'en',
   *   languageResolver: new LanguageResolver([...])
   * });
   * ```
   */
  constructor(options: TranslaasOptions) {
    this.client = new TranslaasClient(options);
    this.languageResolver = options.languageResolver;
    this.defaultLanguage = options.defaultLanguage;
  }

  /**
   * Gets a translation entry with automatic language resolution.
   *
   * Language resolution order:
   * 1. Explicit `lang` parameter (if provided)
   * 2. Language resolver (if configured)
   * 3. Default language (if configured)
   * 4. Throws error if none available
   *
   * @param group - Translation group name (e.g., "common", "ui", "messages")
   * @param entry - Translation entry key (e.g., "welcome", "button.save")
   * @param lang - Optional language code (ISO 639-1). If omitted, language resolver will be used.
   * @param number - Optional number for pluralization (e.g., 1, 5, 1.31)
   * @param parameters - Optional custom parameters for template substitution (e.g., { name: "John", count: 5 })
   * @param cancellationToken - Optional AbortSignal to cancel the request
   * @returns Promise resolving to the translation text
   * @throws `TranslaasConfigurationException` if language cannot be resolved and no default language is set
   * @throws `TranslaasApiException` if the API request fails
   *
   * @example
   * ```typescript
   * // Simple translation (uses language resolver or default)
   * const text = await service.t('common', 'welcome');
   *
   * // Explicit language
   * const text = await service.t('common', 'welcome', 'fr');
   *
   * // With pluralization
   * const text = await service.t('messages', 'items', undefined, 5);
   *
   * // With parameters
   * const text = await service.t('common', 'greeting', undefined, undefined, {
   *   name: 'John'
   * });
   *
   * // All options
   * const text = await service.t('messages', 'items', 'en', 5, {
   *   count: '5'
   * });
   * ```
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
