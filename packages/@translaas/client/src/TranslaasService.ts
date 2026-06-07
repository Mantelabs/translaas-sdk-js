import { TranslaasClient } from './TranslaasClient';
import type { TranslaasOptions } from '@translaas/models';
import { TranslaasConfigurationException } from '@translaas/models';
import type { ILanguageResolver } from '@translaas/extensions';
import { resolveServiceTArgs } from './resolveServiceTArgs';

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
 * // Plural count with automatic language (mirrors .NET T(group, entry, number))
 * const text = await service.t('messages', 'items', 5);
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
 * // With parameters
 * const text = await service.t('common', 'greeting', { name: 'John' });
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
   * The third argument may be a language code, a plural count, or a parameters object
   * (including `{ number: 5 }`), matching .NET `ITranslaasService.T` overloads.
   */
  async t(group: string, entry: string): Promise<string>;
  async t(group: string, entry: string, lang: string): Promise<string>;
  async t(group: string, entry: string, number: number): Promise<string>;
  async t(
    group: string,
    entry: string,
    parameters: Record<string, string | number>
  ): Promise<string>;
  async t(group: string, entry: string, lang: string, number: number): Promise<string>;
  async t(
    group: string,
    entry: string,
    lang: string,
    parameters: Record<string, string | number>
  ): Promise<string>;
  async t(
    group: string,
    entry: string,
    lang: string,
    number: number,
    parameters: Record<string, string>
  ): Promise<string>;
  async t(
    group: string,
    entry: string,
    lang?: string | number | Record<string, string | number>,
    number?: number | Record<string, string | number>,
    parameters?: Record<string, string>,
    projectOrCancellation?: string | AbortSignal,
    cancellationToken?: AbortSignal
  ): Promise<string> {
    const resolved = resolveServiceTArgs(
      lang,
      number,
      parameters,
      projectOrCancellation,
      cancellationToken
    );

    let resolvedLang: string | null = resolved.lang ?? null;

    if (!resolvedLang) {
      if (this.languageResolver) {
        resolvedLang = await this.languageResolver.resolveLanguageAsync();
      }

      if (!resolvedLang && this.defaultLanguage) {
        resolvedLang = this.defaultLanguage;
      }

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
      resolved.number,
      resolved.parameters,
      resolved.project ?? resolved.cancellationToken,
      resolved.project ? resolved.cancellationToken : undefined
    );
  }
}
