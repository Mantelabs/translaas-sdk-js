/**
 * Language provider interface
 */
export interface ILanguageProvider {
  getLanguageAsync(): Promise<string | null>;
}

/**
 * Language resolver interface
 */
export interface ILanguageResolver {
  resolveLanguageAsync(): Promise<string | null>;
}
