import type { IOfflineCacheProvider } from './types';
import { MemoryCacheProvider } from '@translaas/caching';
import {
  TranslaasOfflineCacheException,
  TranslationProject,
  TranslationGroup,
  HybridCacheOptions,
} from '@translaas/models';

/**
 * LRU cache entry for tracking access order
 */
interface LRUEntry {
  key: string;
  lastAccessed: number;
}

/**
 * Hybrid cache provider that combines in-memory (L1) and file-based (L2) caching.
 * Provides fast access to frequently used translations while maintaining persistent storage.
 *
 * Cache flow:
 * 1. Check L1 (memory) cache - fastest
 * 2. If L1 miss, check L2 (file) cache
 * 3. If L2 hit, promote to L1
 * 4. If both miss, call API (handled by caller)
 *
 * @example
 * ```typescript
 * const l2Cache = new FileCacheProvider('/path/to/cache');
 * const hybridCache = new HybridCacheProvider(l2Cache, {
 *   memoryCacheExpiration: 300000, // 5 minutes
 *   maxMemoryCacheEntries: 1000,
 *   warmupOnStartup: true
 * });
 * ```
 */
export class HybridCacheProvider implements IOfflineCacheProvider {
  private readonly l1Cache: MemoryCacheProvider;
  private readonly l2Cache: IOfflineCacheProvider;
  private readonly options: HybridCacheOptions;
  private readonly lruEntries: Map<string, LRUEntry>;
  private readonly maxEntries: number;

  /**
   * Creates a new HybridCacheProvider instance.
   *
   * @param l2Cache - The L2 (file-based) cache provider
   * @param options - Hybrid cache configuration options
   */
  constructor(l2Cache: IOfflineCacheProvider, options: HybridCacheOptions = { enabled: true }) {
    if (!options.enabled) {
      throw new TranslaasOfflineCacheException('Hybrid cache must be enabled');
    }

    this.l2Cache = l2Cache;
    this.options = options;
    this.l1Cache = new MemoryCacheProvider();
    this.lruEntries = new Map();
    this.maxEntries = options.maxMemoryCacheEntries ?? 1000;
  }

  /**
   * Gets the cache key for a project/language combination.
   */
  private getCacheKey(project: string, lang: string): string {
    return `${project}:${lang}`;
  }

  /**
   * Updates LRU tracking for a cache key.
   */
  private updateLRU(key: string): void {
    const now = Date.now();
    this.lruEntries.set(key, { key, lastAccessed: now });
  }

  /**
   * Evicts least recently used entries when cache size limit is reached.
   */
  private evictLRU(): void {
    if (this.lruEntries.size < this.maxEntries) {
      return;
    }

    // Sort entries by last accessed time (oldest first)
    const sortedEntries = Array.from(this.lruEntries.values()).sort(
      (a, b) => a.lastAccessed - b.lastAccessed
    );

    // Remove oldest entries until we're under the limit
    const entriesToRemove = sortedEntries.slice(0, sortedEntries.length - this.maxEntries + 1);
    for (const entry of entriesToRemove) {
      this.l1Cache.remove(entry.key);
      this.lruEntries.delete(entry.key);
    }
  }

  /**
   * Promotes an L2 cache entry to L1.
   */
  private promoteToL1(project: string, lang: string, data: TranslationProject): void {
    const key = this.getCacheKey(project, lang);
    const expiration = this.options.memoryCacheExpiration;

    // Check if we need to evict entries before adding
    if (this.lruEntries.size >= this.maxEntries) {
      this.evictLRU();
    }

    // Add to L1 cache with configured expiration
    this.l1Cache.set(key, data, expiration);
    this.updateLRU(key);
  }

  /**
   * Retrieves cached project data, checking L1 first, then L2.
   *
   * @param project - Project identifier
   * @param lang - Language code
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise resolving to TranslationProject or null if not cached
   * @throws TranslaasOfflineCacheException on cache errors
   */
  async getProjectAsync(
    project: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject | null> {
    if (cancellationToken?.aborted) {
      throw new TranslaasOfflineCacheException('Operation cancelled', undefined, project, lang);
    }

    const key = this.getCacheKey(project, lang);

    // Check L1 cache first (fastest)
    const l1Result = this.l1Cache.get<TranslationProject>(key);
    if (l1Result) {
      this.updateLRU(key);
      return l1Result;
    }

    // L1 miss - check L2 cache
    const l2Result = await this.l2Cache.getProjectAsync(project, lang, cancellationToken);
    if (l2Result) {
      // Promote L2 entry to L1
      this.promoteToL1(project, lang, l2Result);
      return l2Result;
    }

    // Both caches missed - return null (caller should fetch from API)
    return null;
  }

  /**
   * Retrieves cached group data, checking L1 first, then L2.
   *
   * @param project - Project identifier
   * @param group - Group name
   * @param lang - Language code
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise resolving to TranslationGroup or null if not cached
   * @throws TranslaasOfflineCacheException on cache errors
   */
  async getGroupAsync(
    project: string,
    group: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup | null> {
    // Get the full project from cache
    const projectData = await this.getProjectAsync(project, lang, cancellationToken);
    if (!projectData) {
      return null;
    }

    return projectData.getGroup(group);
  }

  /**
   * Saves project data to both L1 and L2 caches.
   *
   * @param project - Project identifier
   * @param lang - Language code
   * @param data - TranslationProject data to cache
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @throws TranslaasOfflineCacheException on cache errors
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

    const key = this.getCacheKey(project, lang);
    const expiration = this.options.memoryCacheExpiration;

    // Save to L2 cache (persistent)
    await this.l2Cache.saveProjectAsync(project, lang, data, cancellationToken);

    // Save to L1 cache (fast access)
    if (this.lruEntries.size >= this.maxEntries) {
      this.evictLRU();
    }
    this.l1Cache.set(key, data, expiration);
    this.updateLRU(key);
  }

  /**
   * Checks if a project/language combination is cached in either L1 or L2.
   *
   * @param project - Project identifier
   * @param lang - Language code
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise resolving to true if cached in L1 or L2, false otherwise
   * @throws TranslaasOfflineCacheException on cache errors
   */
  async isCachedAsync(
    project: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<boolean> {
    if (cancellationToken?.aborted) {
      throw new TranslaasOfflineCacheException('Operation cancelled', undefined, project, lang);
    }

    const key = this.getCacheKey(project, lang);

    // Check L1 cache first
    const l1Result = this.l1Cache.get<TranslationProject>(key);
    if (l1Result) {
      return true;
    }

    // Check L2 cache
    return await this.l2Cache.isCachedAsync(project, lang, cancellationToken);
  }

  /**
   * Removes all cached data from both L1 and L2 caches.
   *
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @throws TranslaasOfflineCacheException on cache errors
   */
  async clearAllAsync(cancellationToken?: AbortSignal): Promise<void> {
    if (cancellationToken?.aborted) {
      throw new TranslaasOfflineCacheException('Operation cancelled');
    }

    // Clear L1 cache
    this.l1Cache.clear();
    this.lruEntries.clear();

    // Clear L2 cache
    await this.l2Cache.clearAllAsync(cancellationToken);
  }

  /**
   * Warms up the L1 cache by loading specified projects/languages from L2 cache.
   * This is typically called on startup to improve initial performance.
   *
   * @param projects - Array of project identifiers to warmup
   * @param languages - Array of language codes to warmup
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise that resolves when warmup is complete
   * @throws TranslaasOfflineCacheException on cache errors
   */
  async warmupAsync(
    projects: string[],
    languages: string[],
    cancellationToken?: AbortSignal
  ): Promise<void> {
    if (cancellationToken?.aborted) {
      throw new TranslaasOfflineCacheException('Operation cancelled');
    }

    // Load each project/language combination from L2 into L1
    const warmupPromises: Promise<void>[] = [];

    for (const project of projects) {
      for (const lang of languages) {
        const warmupPromise = this.l2Cache
          .getProjectAsync(project, lang, cancellationToken)
          .then(projectData => {
            if (projectData) {
              this.promoteToL1(project, lang, projectData);
            }
          })
          .catch(error => {
            // Log but don't fail warmup for individual entries

            console.warn(`Failed to warmup cache for project ${project}, language ${lang}:`, error);
          });

        warmupPromises.push(warmupPromise);
      }
    }

    await Promise.all(warmupPromises);
  }
}
