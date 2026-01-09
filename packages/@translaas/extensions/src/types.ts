/**
 * Language provider interface for extracting language codes from various sources.
 *
 * Implementations of this interface provide language detection from different sources
 * such as HTTP requests, browser settings, or configuration.
 *
 * Use implementations:
 * - {@link RequestLanguageProvider} - Extracts language from HTTP requests
 * - {@link CultureLanguageProvider} - Uses browser's navigator.language
 * - {@link DefaultLanguageProvider} - Returns a fixed default language
 *
 * @example
 * ```typescript
 * const provider: ILanguageProvider = new RequestLanguageProvider(req);
 * const lang = await provider.getLanguageAsync();
 * ```
 */
export interface ILanguageProvider {
  /**
   * Gets the language code from the provider's source.
   *
   * @returns Promise resolving to language code (ISO 639-1) or null if not available
   *
   * @example
   * ```typescript
   * const lang = await provider.getLanguageAsync();
   * if (lang) {
   *   console.log(`Detected language: ${lang}`);
   * }
   * ```
   */
  getLanguageAsync(): Promise<string | null>;
}

/**
 * Language resolver interface for chaining multiple language providers.
 *
 * Language resolvers chain multiple providers in priority order and return
 * the first non-null result.
 *
 * Use {@link LanguageResolver} for the standard implementation.
 *
 * @example
 * ```typescript
 * const resolver: ILanguageResolver = new LanguageResolver([
 *   new RequestLanguageProvider(req),
 *   new CultureLanguageProvider(),
 *   new DefaultLanguageProvider('en')
 * ]);
 *
 * const lang = await resolver.resolveLanguageAsync();
 * ```
 */
export interface ILanguageResolver {
  /**
   * Resolves language by chaining providers in priority order.
   * Returns the first non-null result from the providers.
   *
   * @returns Promise resolving to language code (ISO 639-1) or null if all providers fail
   *
   * @example
   * ```typescript
   * const lang = await resolver.resolveLanguageAsync();
   * // Returns first available language from providers, or null if none found
   * ```
   */
  resolveLanguageAsync(): Promise<string | null>;
}
