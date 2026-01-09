import type { ILanguageResolver, ILanguageProvider } from '../types';

/**
 * Language resolver that chains multiple language providers in priority order.
 *
 * Returns the first non-null result from the providers. This allows you to create
 * a fallback chain where each provider is tried in order until one succeeds.
 *
 * @example
 * ```typescript
 * // Chain multiple providers with fallback
 * const resolver = new LanguageResolver([
 *   new RequestLanguageProvider(req),      // Try request first
 *   new CultureLanguageProvider(),          // Then browser language
 *   new DefaultLanguageProvider('en')       // Finally fallback to English
 * ]);
 *
 * const lang = await resolver.resolveLanguageAsync();
 * // Returns first available language, or null if all fail
 * ```
 *
 * @see {@link ILanguageResolver} for the interface definition
 */
export class LanguageResolver implements ILanguageResolver {
  private readonly providers: ILanguageProvider[];

  /**
   * Creates a new LanguageResolver instance.
   *
   * @param providers - Array of language providers to chain (in priority order)
   * @throws Error if providers array is empty or null
   *
   * @example
   * ```typescript
   * const resolver = new LanguageResolver([
   *   new RequestLanguageProvider(req),
   *   new DefaultLanguageProvider('en')
   * ]);
   * ```
   */
  constructor(providers: ILanguageProvider[]) {
    if (!providers || providers.length === 0) {
      throw new Error('At least one language provider is required');
    }
    this.providers = providers;
  }

  /**
   * Resolves language by chaining providers in priority order.
   *
   * Returns the first non-null result from the providers. If a provider throws
   * an error, it is logged and the next provider is tried. Returns null only
   * if all providers return null or throw errors.
   *
   * @returns Promise resolving to the language code (ISO 639-1) or null if all providers fail
   *
   * @example
   * ```typescript
   * const lang = await resolver.resolveLanguageAsync();
   * if (lang) {
   *   console.log(`Resolved language: ${lang}`);
   * } else {
   *   console.log('No language could be resolved');
   * }
   * ```
   */
  async resolveLanguageAsync(): Promise<string | null> {
    for (const provider of this.providers) {
      try {
        const language = await provider.getLanguageAsync();
        if (language !== null && language.trim() !== '') {
          return language;
        }
      } catch (error) {
        // Log error but continue to next provider
        // In production, you might want to use a logger here
        console.warn(`Language provider failed:`, error);
      }
    }

    return null;
  }

  /**
   * Adds a provider to the resolver chain
   * @param provider Language provider to add
   */
  addProvider(provider: ILanguageProvider): void {
    this.providers.push(provider);
  }

  /**
   * Gets all providers in the resolver chain
   * @returns Array of language providers
   */
  getProviders(): readonly ILanguageProvider[] {
    return [...this.providers];
  }
}
