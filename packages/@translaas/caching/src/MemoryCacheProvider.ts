import type { ITranslaasCacheProvider } from './types';

/**
 * Internal cache entry structure
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number | null; // Timestamp for absolute expiration (null if not set)
  lastAccessed: number; // Timestamp of last access for sliding expiration
  slidingExpirationMs: number | null; // Duration in milliseconds for sliding expiration (null if not set)
}

/**
 * In-memory cache provider that implements ITranslaasCacheProvider.
 * Supports both absolute and sliding expiration policies.
 *
 * @example
 * ```typescript
 * const cache = new MemoryCacheProvider();
 * cache.set('key', 'value', 3600000); // Absolute expiration: 1 hour
 * cache.set('key2', 'value2', undefined, 1800000); // Sliding expiration: 30 minutes
 * const value = cache.get('key');
 * ```
 */
export class MemoryCacheProvider implements ITranslaasCacheProvider {
  private readonly cache: Map<string, CacheEntry<unknown>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Retrieves a cached value by key.
   * Returns null if the key doesn't exist or the entry has expired.
   * Updates lastAccessed timestamp for sliding expiration.
   *
   * @param key - The cache key
   * @returns The cached value or null if expired/missing
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    // Update lastAccessed for sliding expiration
    const now = Date.now();
    entry.lastAccessed = now;

    return entry.value;
  }

  /**
   * Stores a value in the cache with optional expiration policies.
   *
   * @param key - The cache key
   * @param value - The value to cache
   * @param absoluteExpiration - Optional absolute expiration time in milliseconds from now
   * @param slidingExpiration - Optional sliding expiration time in milliseconds
   */
  set<T>(key: string, value: T, absoluteExpiration?: number, slidingExpiration?: number): void {
    const now = Date.now();

    const entry: CacheEntry<T> = {
      value,
      expiresAt:
        absoluteExpiration !== undefined && absoluteExpiration > 0
          ? now + absoluteExpiration
          : absoluteExpiration === 0
            ? now // Expire immediately if 0
            : null,
      lastAccessed: now,
      slidingExpirationMs:
        slidingExpiration !== undefined && slidingExpiration > 0
          ? slidingExpiration
          : slidingExpiration === 0
            ? 0 // Expire immediately if 0
            : null,
    };

    this.cache.set(key, entry as CacheEntry<unknown>);
  }

  /**
   * Removes a specific cache entry by key.
   *
   * @param key - The cache key to remove
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Removes all cache entries.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Checks if a cache entry is expired.
   * An entry is expired if:
   * - Absolute expiration is set and current time >= expiresAt, OR
   * - Sliding expiration is set and (current time - lastAccessed) >= slidingExpirationMs
   *
   * @param entry - The cache entry to check
   * @returns True if the entry is expired, false otherwise
   */
  private isExpired<T>(entry: CacheEntry<T>): boolean {
    const now = Date.now();

    // Check absolute expiration
    if (entry.expiresAt !== null && now >= entry.expiresAt) {
      return true;
    }

    // Check sliding expiration
    if (entry.slidingExpirationMs !== null) {
      // If sliding expiration is 0, expire immediately
      if (entry.slidingExpirationMs === 0) {
        return true;
      }
      const timeSinceLastAccess = now - entry.lastAccessed;
      if (timeSinceLastAccess >= entry.slidingExpirationMs) {
        return true;
      }
    }

    return false;
  }
}
