/**
 * Offline cache provider interface for persistent caching.
 *
 * Implementations of this interface provide file-based or browser storage-based caching
 * for translation data, enabling offline access to translations.
 *
 * Use {@link FileCacheProvider} for Node.js environments or {@link BrowserCacheProvider}
 * for browser environments.
 *
 * @example
 * ```typescript
 * const cache: IOfflineCacheProvider = new FileCacheProvider('./cache');
 * await cache.saveProjectAsync('my-project', 'en', projectData);
 * const cached = await cache.getProjectAsync('my-project', 'en');
 * ```
 */
export interface IOfflineCacheProvider {
  /**
   * Retrieves cached project data.
   *
   * @param project - Project identifier
   * @param lang - Language code (ISO 639-1)
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise resolving to `TranslationProject` or null if not cached/expired
   * @throws `TranslaasOfflineCacheException` on cache errors
   *
   * @example
   * ```typescript
   * const project = await cache.getProjectAsync('my-project', 'en');
   * if (project) {
   *   const group = project.getGroup('common');
   * }
   * ```
   */
  getProjectAsync(
    project: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<any | null>;

  /**
   * Retrieves cached group data.
   *
   * @param project - Project identifier
   * @param group - Group name
   * @param lang - Language code (ISO 639-1)
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise resolving to `TranslationGroup` or null if not cached/expired
   * @throws `TranslaasOfflineCacheException` on cache errors
   *
   * @example
   * ```typescript
   * const group = await cache.getGroupAsync('my-project', 'common', 'en');
   * if (group) {
   *   const text = group.getValue('welcome');
   * }
   * ```
   */
  getGroupAsync(
    project: string,
    group: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<any | null>;

  /**
   * Saves project data to cache.
   *
   * @param project - Project identifier
   * @param lang - Language code (ISO 639-1)
   * @param data - `TranslationProject` data to cache
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise that resolves when the data is saved
   * @throws `TranslaasOfflineCacheException` on cache errors
   *
   * @example
   * ```typescript
   * const project = await client.getProjectAsync('my-project', 'en');
   * await cache.saveProjectAsync('my-project', 'en', project);
   * ```
   */
  saveProjectAsync(
    project: string,
    lang: string,
    data: any,
    cancellationToken?: AbortSignal
  ): Promise<void>;

  /**
   * Checks if a project/language combination is cached and not expired.
   *
   * @param project - Project identifier
   * @param lang - Language code (ISO 639-1)
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise resolving to true if cached and valid, false otherwise
   * @throws `TranslaasOfflineCacheException` on cache errors
   *
   * @example
   * ```typescript
   * const isCached = await cache.isCachedAsync('my-project', 'en');
   * if (!isCached) {
   *   // Fetch from API and cache
   * }
   * ```
   */
  isCachedAsync(project: string, lang: string, cancellationToken?: AbortSignal): Promise<boolean>;

  /**
   * Removes all cached data.
   *
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise that resolves when all data is cleared
   * @throws `TranslaasOfflineCacheException` on cache errors
   *
   * @example
   * ```typescript
   * await cache.clearAllAsync();
   * ```
   */
  clearAllAsync(cancellationToken?: AbortSignal): Promise<void>;
}
