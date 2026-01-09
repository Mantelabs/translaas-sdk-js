import type { IOfflineCacheProvider } from './types';
import {
  TranslaasOfflineCacheException,
  TranslationProject,
  TranslationGroup,
  TranslationEntryValue,
} from '@translaas/models';

/**
 * Cache entry metadata stored with project data
 */
interface CacheEntry {
  project: string;
  lang: string;
  data: Record<string, Record<string, TranslationEntryValue>>;
  cachedAt: number; // Timestamp when cached
  expiresAt?: number; // Optional expiration timestamp
}

/**
 * Browser-based cache provider using localStorage.
 * Persists translation data to browser's localStorage with quota handling.
 *
 * Storage key format: `translaas:cache:{project}:{lang}`
 *
 * @example
 * ```typescript
 * const provider = new BrowserCacheProvider();
 * await provider.saveProjectAsync('my-project', 'en', projectData);
 * const cached = await provider.getProjectAsync('my-project', 'en');
 * ```
 */
export class BrowserCacheProvider implements IOfflineCacheProvider {
  private readonly keyPrefix = 'translaas:cache:';

  /**
   * Gets the window object, handling both browser and Node.js environments.
   */
  private getWindow(): { localStorage: Storage } | undefined {
    if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
      const win = (globalThis as { window?: { localStorage?: Storage } }).window;
      if (win && win.localStorage) {
        return win as { localStorage: Storage };
      }
    }
    return undefined;
  }

  /**
   * Checks if localStorage is available in the current environment.
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const win = this.getWindow();
      if (!win || typeof win.localStorage === 'undefined') {
        return false;
      }
      // Test write/read to ensure localStorage is actually functional
      const testKey = '__translaas_test__';
      win.localStorage.setItem(testKey, 'test');
      win.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the storage key for a project/language combination.
   */
  private getStorageKey(project: string, lang: string): string {
    return `${this.keyPrefix}${project}:${lang}`;
  }

  /**
   * Checks if a cache entry is expired.
   */
  private isExpired(entry: CacheEntry | null): boolean {
    if (!entry) {
      return true;
    }

    if (entry.expiresAt && Date.now() >= entry.expiresAt) {
      return true;
    }

    return false;
  }

  /**
   * Retrieves cached project data from localStorage.
   *
   * @param project - Project identifier
   * @param lang - Language code
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise resolving to TranslationProject or null if not cached/expired
   * @throws TranslaasOfflineCacheException on storage errors
   */
  async getProjectAsync(
    project: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject | null> {
    if (cancellationToken?.aborted) {
      throw new TranslaasOfflineCacheException('Operation cancelled', undefined, project, lang);
    }

    if (!this.isLocalStorageAvailable()) {
      throw new TranslaasOfflineCacheException(
        'localStorage is not available in this environment',
        undefined,
        project,
        lang
      );
    }

    const win = this.getWindow();
    if (!win) {
      throw new TranslaasOfflineCacheException(
        'window is not available in this environment',
        undefined,
        project,
        lang
      );
    }

    const key = this.getStorageKey(project, lang);

    try {
      const stored = win.localStorage.getItem(key);
      if (!stored) {
        return null;
      }

      const entry = JSON.parse(stored) as CacheEntry;

      // Validate entry structure
      if (!entry.data || !entry.project || !entry.lang) {
        return null;
      }

      // Check expiration
      if (this.isExpired(entry)) {
        // Remove expired entry
        win.localStorage.removeItem(key);
        return null;
      }

      return new TranslationProject(entry.data);
    } catch {
      // If JSON parse fails, remove corrupted entry and return null
      try {
        win.localStorage.removeItem(key);
      } catch {
        // Ignore removal errors
      }

      // Return null for corrupted entries instead of throwing
      return null;
    }
  }

  /**
   * Retrieves cached group data by extracting it from the cached project.
   *
   * @param project - Project identifier
   * @param group - Group name
   * @param lang - Language code
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise resolving to TranslationGroup or null if not cached/expired
   * @throws TranslaasOfflineCacheException on storage errors
   */
  async getGroupAsync(
    project: string,
    group: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup | null> {
    const projectData = await this.getProjectAsync(project, lang, cancellationToken);
    if (!projectData) {
      return null;
    }

    return projectData.getGroup(group);
  }

  /**
   * Saves project data to localStorage with quota error handling.
   *
   * @param project - Project identifier
   * @param lang - Language code
   * @param data - TranslationProject data to cache
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @throws TranslaasOfflineCacheException on storage errors (including quota exceeded)
   */
  async saveProjectAsync(
    project: string,
    lang: string,
    data: TranslationProject,
    cancellationToken?: AbortSignal
  ): Promise<void> {
    if (cancellationToken?.aborted) {
      throw new TranslaasOfflineCacheException('Operation cancelled', undefined, project, lang);
    }

    if (!this.isLocalStorageAvailable()) {
      throw new TranslaasOfflineCacheException(
        'localStorage is not available in this environment',
        undefined,
        project,
        lang
      );
    }

    const win = this.getWindow();
    if (!win) {
      throw new TranslaasOfflineCacheException(
        'window is not available in this environment',
        undefined,
        project,
        lang
      );
    }

    const key = this.getStorageKey(project, lang);

    const entry: CacheEntry = {
      project,
      lang,
      data: data.groups,
      cachedAt: Date.now(),
    };

    try {
      const json = JSON.stringify(entry);
      win.localStorage.setItem(key, json);
    } catch (error) {
      const err = error as Error;
      const isQuotaError =
        err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        (err.message && err.message.toLowerCase().includes('quota'));

      if (isQuotaError) {
        throw new TranslaasOfflineCacheException(
          `Storage quota exceeded. Cannot cache project: ${project}, language: ${lang}`,
          undefined,
          project,
          lang,
          error as Error
        );
      }

      throw new TranslaasOfflineCacheException(
        `Failed to save cache entry: ${key}`,
        undefined,
        project,
        lang,
        error as Error
      );
    }
  }

  /**
   * Checks if a project/language combination is cached and not expired.
   *
   * @param project - Project identifier
   * @param lang - Language code
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise resolving to true if cached and valid, false otherwise
   * @throws TranslaasOfflineCacheException on storage errors
   */
  async isCachedAsync(
    project: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<boolean> {
    if (cancellationToken?.aborted) {
      throw new TranslaasOfflineCacheException('Operation cancelled', undefined, project, lang);
    }

    if (!this.isLocalStorageAvailable()) {
      return false;
    }

    const win = this.getWindow();
    if (!win) {
      return false;
    }

    const key = this.getStorageKey(project, lang);

    try {
      const stored = win.localStorage.getItem(key);
      if (!stored) {
        return false;
      }

      const entry = JSON.parse(stored) as CacheEntry;
      return !this.isExpired(entry);
    } catch {
      return false;
    }
  }

  /**
   * Removes all cached data by clearing all translaas cache keys from localStorage.
   *
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @throws TranslaasOfflineCacheException on storage errors
   */
  async clearAllAsync(cancellationToken?: AbortSignal): Promise<void> {
    if (cancellationToken?.aborted) {
      throw new TranslaasOfflineCacheException('Operation cancelled');
    }

    if (!this.isLocalStorageAvailable()) {
      throw new TranslaasOfflineCacheException('localStorage is not available in this environment');
    }

    const win = this.getWindow();
    if (!win) {
      throw new TranslaasOfflineCacheException('window is not available in this environment');
    }

    try {
      const keysToRemove: string[] = [];

      // Collect all translaas cache keys
      for (let i = 0; i < win.localStorage.length; i++) {
        const key = win.localStorage.key(i);
        if (key && key.startsWith(this.keyPrefix)) {
          keysToRemove.push(key);
        }
      }

      // Remove all collected keys
      for (const key of keysToRemove) {
        win.localStorage.removeItem(key);
      }
    } catch (error) {
      throw new TranslaasOfflineCacheException(
        'Failed to clear cache',
        undefined,
        undefined,
        undefined,
        error as Error
      );
    }
  }
}
