/**
 * Cache provider interface
 */
export interface ITranslaasCacheProvider {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, absoluteExpiration?: number, slidingExpiration?: number): void;
  remove(key: string): void;
  clear(): void;
}
