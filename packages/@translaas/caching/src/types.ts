/**
 * Cache provider interface for in-memory caching.
 *
 * Implementations of this interface provide caching functionality for translation data.
 * Use {@link MemoryCacheProvider} for the standard implementation.
 *
 * @example
 * ```typescript
 * const cache: ITranslaasCacheProvider = new MemoryCacheProvider();
 * cache.set('key', 'value', 3600000); // Cache for 1 hour
 * const value = cache.get<string>('key');
 * ```
 */
export interface ITranslaasCacheProvider {
  /**
   * Retrieves a cached value by key.
   *
   * @param key - The cache key
   * @returns The cached value or null if not found or expired
   *
   * @example
   * ```typescript
   * const value = cache.get<string>('my-key');
   * if (value) {
   *   console.log(value);
   * }
   * ```
   */
  get<T>(key: string): T | null;

  /**
   * Stores a value in the cache with optional expiration policies.
   *
   * @param key - The cache key
   * @param value - The value to cache
   * @param absoluteExpiration - Optional absolute expiration time in milliseconds from now
   * @param slidingExpiration - Optional sliding expiration time in milliseconds
   *
   * @example
   * ```typescript
   * // Absolute expiration: expires after 1 hour
   * cache.set('key', 'value', 3600000);
   *
   * // Sliding expiration: expires after 30 minutes of inactivity
   * cache.set('key', 'value', undefined, 1800000);
   *
   * // Both: expires after 1 hour OR 30 minutes of inactivity, whichever comes first
   * cache.set('key', 'value', 3600000, 1800000);
   * ```
   */
  set<T>(key: string, value: T, absoluteExpiration?: number, slidingExpiration?: number): void;

  /**
   * Removes a specific cache entry by key.
   *
   * @param key - The cache key to remove
   *
   * @example
   * ```typescript
   * cache.remove('my-key');
   * ```
   */
  remove(key: string): void;

  /**
   * Removes all cache entries.
   *
   * @example
   * ```typescript
   * cache.clear();
   * ```
   */
  clear(): void;
}
