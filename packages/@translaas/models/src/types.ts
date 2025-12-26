/**
 * Language codes constants
 */
export const LanguageCodes = {
  English: 'en',
  French: 'fr',
  Spanish: 'es',
  German: 'de',
  Italian: 'it',
  Portuguese: 'pt',
  Russian: 'ru',
  Japanese: 'ja',
  Chinese: 'zh',
  Korean: 'ko',
} as const;

export type LanguageCode = (typeof LanguageCodes)[keyof typeof LanguageCodes];

/**
 * Cache modes
 */
export enum CacheMode {
  None = 0,
  Entry = 1,
  Group = 2,
  Project = 3,
}

/**
 * Offline fallback modes
 */
export enum OfflineFallbackMode {
  CacheFirst = 0,
  ApiFirst = 1,
  CacheOnly = 2,
  ApiOnlyWithBackup = 3,
}

/**
 * Plural categories (CLDR)
 */
export enum PluralCategory {
  Zero = 'zero',
  One = 'one',
  Two = 'two',
  Few = 'few',
  Many = 'many',
  Other = 'other',
}

/**
 * Translaas options configuration
 */
export interface TranslaasOptions {
  apiKey: string;
  baseUrl: string;
  cacheMode?: CacheMode;
  timeout?: number; // milliseconds
  cacheAbsoluteExpiration?: number; // milliseconds
  cacheSlidingExpiration?: number; // milliseconds
  offlineCache?: OfflineCacheOptions;
  defaultLanguage?: string;
}

/**
 * Offline cache options
 */
export interface OfflineCacheOptions {
  enabled: boolean;
  cacheDirectory?: string;
  fallbackMode?: OfflineFallbackMode;
  autoSync?: boolean;
  autoSyncInterval?: number; // milliseconds
  projects?: string[];
  languages?: string[];
  defaultProjectId?: string;
  hybridCache?: HybridCacheOptions;
}

/**
 * Hybrid cache options
 */
export interface HybridCacheOptions {
  enabled: boolean;
  memoryCacheExpiration?: number; // milliseconds
  maxMemoryCacheEntries?: number;
  warmupOnStartup?: boolean;
}

/**
 * Translation group
 */
export interface TranslationGroup {
  entries: Record<string, any>;
}

/**
 * Translation project
 */
export interface TranslationProject {
  groups: Record<string, any>;
}

/**
 * Project locales
 */
export interface ProjectLocales {
  locales: string[];
}
