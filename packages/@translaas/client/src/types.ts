import type { TranslationGroup, TranslationProject, ProjectLocales } from '@translaas/models';

/**
 * Translaas client interface for interacting with the Translaas Translation Delivery API.
 *
 * This interface defines the contract for all Translaas client implementations.
 * Use {@link TranslaasClient} for the standard implementation.
 *
 * @example
 * ```typescript
 * const client: ITranslaasClient = new TranslaasClient({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.translaas.com'
 * });
 *
 * const translation = await client.getEntryAsync('common', 'welcome', 'en');
 * ```
 */
export interface ITranslaasClient {
  /**
   * Gets a single translation entry as plain text.
   *
   * @param group - Translation group name (e.g., "common", "ui", "messages")
   * @param entry - Translation entry key (e.g., "welcome", "button.save")
   * @param lang - Language code (ISO 639-1, e.g., "en", "fr", "es")
   * @param number - Optional number for pluralization (e.g., 1, 5, 1.31)
   * @param parameters - Optional custom parameters for template substitution (e.g., { name: "John", count: 5 })
   * @param cancellationToken - Optional AbortSignal to cancel the request
   * @returns Promise resolving to the translation text
   * @throws `TranslaasApiException` if the API request fails
   *
   * @example
   * ```typescript
   * // Simple translation
   * const text = await client.getEntryAsync('common', 'welcome', 'en');
   *
   * // With pluralization
   * const text = await client.getEntryAsync('messages', 'items', 'en', 5);
   *
   * // With parameters
   * const text = await client.getEntryAsync('common', 'greeting', 'en', undefined, { name: 'John' });
   * ```
   */
  getEntryAsync(
    group: string,
    entry: string,
    lang: string,
    number?: number,
    parameters?: Record<string, string>,
    cancellationToken?: AbortSignal
  ): Promise<string>;

  /**
   * Gets all translations for a specific group.
   *
   * @param project - Project identifier
   * @param group - Translation group name (e.g., "common", "ui")
   * @param lang - Language code (ISO 639-1, e.g., "en", "fr")
   * @param format - Optional response format (e.g., 'json'). Defaults to JSON.
   * @param cancellationToken - Optional AbortSignal to cancel the request
   * @returns Promise resolving to a {@link TranslationGroup} instance containing all entries in the group
   * @throws `TranslaasApiException` if the API request fails
   *
   * @example
   * ```typescript
   * const group = await client.getGroupAsync('my-project', 'common', 'en');
   * const welcomeText = group.getValue('welcome');
   * ```
   */
  getGroupAsync(
    project: string,
    group: string,
    lang: string,
    format?: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup>;

  /**
   * Gets all translations for a project.
   *
   * @param project - Project identifier
   * @param lang - Language code (ISO 639-1, e.g., "en", "fr")
   * @param format - Optional response format (e.g., 'json'). Defaults to JSON.
   * @param cancellationToken - Optional AbortSignal to cancel the request
   * @returns Promise resolving to a {@link TranslationProject} instance containing all groups and entries
   * @throws `TranslaasApiException` if the API request fails
   *
   * @example
   * ```typescript
   * const project = await client.getProjectAsync('my-project', 'en');
   * const commonGroup = project.getGroup('common');
   * const welcomeText = commonGroup?.getValue('welcome');
   * ```
   */
  getProjectAsync(
    project: string,
    lang: string,
    format?: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject>;

  /**
   * Gets available locales for a project.
   *
   * @param project - Project identifier
   * @param cancellationToken - Optional AbortSignal to cancel the request
   * @returns Promise resolving to a {@link ProjectLocales} instance containing available locale codes
   * @throws `TranslaasApiException` if the API request fails
   *
   * @example
   * ```typescript
   * const locales = await client.getProjectLocalesAsync('my-project');
   * console.log(locales.locales); // ['en', 'fr', 'es', 'de']
   * ```
   */
  getProjectLocalesAsync(project: string, cancellationToken?: AbortSignal): Promise<ProjectLocales>;
}
