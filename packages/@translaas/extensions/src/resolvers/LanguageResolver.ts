import type { ILanguageResolver, ILanguageProvider } from '../types';

/**
 * Language resolver that chains multiple language providers in priority order
 * Returns the first non-null result from the providers
 */
export class LanguageResolver implements ILanguageResolver {
  private readonly providers: ILanguageProvider[];

  constructor(providers: ILanguageProvider[]) {
    if (!providers || providers.length === 0) {
      throw new Error('At least one language provider is required');
    }
    this.providers = providers;
  }

  /**
   * Resolves language by chaining providers in priority order
   * Returns the first non-null result, or null if all providers return null
   * @returns Promise resolving to the language code or null if resolution fails
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
