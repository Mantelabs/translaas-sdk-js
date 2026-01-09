import { PluralResolver } from './PluralResolver';

/**
 * Language codes constants (ISO 639-1)
 */
export const LanguageCodes = {
  // Major languages
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
  Arabic: 'ar',
  Hindi: 'hi',
  Turkish: 'tr',
  Polish: 'pl',
  Dutch: 'nl',
  Greek: 'el',
  Czech: 'cs',
  Swedish: 'sv',
  Norwegian: 'no',
  Danish: 'da',
  Finnish: 'fi',
  Romanian: 'ro',
  Hungarian: 'hu',
  Bulgarian: 'bg',
  Croatian: 'hr',
  Slovak: 'sk',
  Slovenian: 'sl',
  Lithuanian: 'lt',
  Latvian: 'lv',
  Estonian: 'et',
  Ukrainian: 'uk',
  Serbian: 'sr',
  Macedonian: 'mk',
  Albanian: 'sq',
  Icelandic: 'is',
  Irish: 'ga',
  Welsh: 'cy',
  Maltese: 'mt',
  Hebrew: 'he',
  Persian: 'fa',
  Urdu: 'ur',
  Bengali: 'bn',
  Tamil: 'ta',
  Telugu: 'te',
  Marathi: 'mr',
  Gujarati: 'gu',
  Kannada: 'kn',
  Malayalam: 'ml',
  Punjabi: 'pa',
  Thai: 'th',
  Vietnamese: 'vi',
  Indonesian: 'id',
  Malay: 'ms',
  Filipino: 'tl',
  Swahili: 'sw',
  Afrikaans: 'af',
  Zulu: 'zu',
  Xhosa: 'xh',
  Amharic: 'am',
  Hausa: 'ha',
  Yoruba: 'yo',
  Igbo: 'ig',
  Somali: 'so',
  Malagasy: 'mg',
  Khmer: 'km',
  Lao: 'lo',
  Myanmar: 'my',
  Georgian: 'ka',
  Armenian: 'hy',
  Azerbaijani: 'az',
  Kazakh: 'kk',
  Kyrgyz: 'ky',
  Uzbek: 'uz',
  Tajik: 'tg',
  Turkmen: 'tk',
  Mongolian: 'mn',
  Nepali: 'ne',
  Sinhala: 'si',
} as const;

export type LanguageCode = (typeof LanguageCodes)[keyof typeof LanguageCodes];

/**
 * Cache modes for translation entries.
 *
 * Determines the granularity of caching:
 * - {@link CacheMode.None}: No caching (default)
 * - {@link CacheMode.Entry}: Cache individual translation entries
 * - {@link CacheMode.Group}: Cache entire translation groups
 * - {@link CacheMode.Project}: Cache entire translation projects (most efficient)
 *
 * @example
 * ```typescript
 * const options: TranslaasOptions = {
 *   apiKey: 'key',
 *   baseUrl: 'https://api.translaas.com',
 *   cacheMode: CacheMode.Group // Cache entire groups
 * };
 * ```
 */
export enum CacheMode {
  /** No caching - all requests go to the API */
  None = 0,
  /** Cache individual translation entries */
  Entry = 1,
  /** Cache entire translation groups */
  Group = 2,
  /** Cache entire translation projects (most efficient) */
  Project = 3,
}

/**
 * Offline fallback modes for cache behavior.
 *
 * Determines how the SDK handles API availability and cache usage:
 * - {@link OfflineFallbackMode.CacheFirst}: Check cache first, then API (fastest, may serve stale data)
 * - {@link OfflineFallbackMode.ApiFirst}: Check API first, fallback to cache on failure (default, ensures freshness)
 * - {@link OfflineFallbackMode.CacheOnly}: Only use cache, never call API (offline mode)
 * - {@link OfflineFallbackMode.ApiOnlyWithBackup}: Use API, but save responses to cache (backup for future offline use)
 *
 * @example
 * ```typescript
 * const offlineCache: OfflineCacheOptions = {
 *   enabled: true,
 *   fallbackMode: OfflineFallbackMode.ApiFirst // Try API first, use cache if API fails
 * };
 * ```
 */
export enum OfflineFallbackMode {
  /** Check cache first, then API (fastest, may serve stale data) */
  CacheFirst = 0,
  /** Check API first, fallback to cache on failure (default, ensures freshness) */
  ApiFirst = 1,
  /** Only use cache, never call API (offline mode) */
  CacheOnly = 2,
  /** Use API, but save responses to cache (backup for future offline use) */
  ApiOnlyWithBackup = 3,
}

/**
 * Plural categories based on CLDR (Unicode Common Locale Data Repository) rules.
 *
 * Used for pluralization of translation entries. The appropriate category is determined
 * by the {@link PluralResolver} based on the number and language code.
 *
 * Categories:
 * - {@link PluralCategory.Zero}: Zero quantity (e.g., Arabic: 0)
 * - {@link PluralCategory.One}: Singular (e.g., English: 1)
 * - {@link PluralCategory.Two}: Dual (e.g., Arabic: 2)
 * - {@link PluralCategory.Few}: Few items (e.g., Russian: 2-4)
 * - {@link PluralCategory.Many}: Many items (e.g., Russian: 5+)
 * - {@link PluralCategory.Other}: Default/other (fallback for all languages)
 *
 * @example
 * ```typescript
 * const group = new TranslationGroup({
 *   items: {
 *     [PluralCategory.One]: 'one item',
 *     [PluralCategory.Other]: '{count} items'
 *   }
 * });
 *
 * const text = group.getPluralFormForNumber('items', 1, 'en'); // 'one item'
 * const text2 = group.getPluralFormForNumber('items', 5, 'en'); // '5 items'
 * ```
 *
 * @see {@link PluralResolver} for determining the correct category
 */
export enum PluralCategory {
  /** Zero quantity (e.g., Arabic: 0) */
  Zero = 'zero',
  /** Singular (e.g., English: 1) */
  One = 'one',
  /** Dual (e.g., Arabic: 2) */
  Two = 'two',
  /** Few items (e.g., Russian: 2-4) */
  Few = 'few',
  /** Many items (e.g., Russian: 5+) */
  Many = 'many',
  /** Default/other (fallback for all languages) */
  Other = 'other',
}

/**
 * Translaas SDK configuration options.
 *
 * This interface defines all configuration options for the Translaas SDK.
 *
 * @example
 * ```typescript
 * const options: TranslaasOptions = {
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.translaas.com',
 *   cacheMode: CacheMode.Group,
 *   timeout: 30000,
 *   defaultLanguage: 'en',
 *   languageResolver: new LanguageResolver([...])
 * };
 * ```
 */
export interface TranslaasOptions {
  /**
   * API key for authenticating with the Translaas API.
   * Required. Must be a non-empty string.
   */
  apiKey: string;

  /**
   * Base URL of the Translaas API.
   * Required. Must be a non-empty string (e.g., 'https://api.translaas.com').
   * Trailing slashes are automatically removed.
   */
  baseUrl: string;

  /**
   * Cache mode for translation entries.
   *
   * - {@link CacheMode.None}: No caching
   * - {@link CacheMode.Entry}: Cache individual entries
   * - {@link CacheMode.Group}: Cache entire groups
   * - {@link CacheMode.Project}: Cache entire projects
   *
   * Default: {@link CacheMode.None}
   */
  cacheMode?: CacheMode;

  /**
   * Request timeout in milliseconds.
   * If not specified, requests will not timeout automatically.
   *
   * @default undefined (no timeout)
   */
  timeout?: number;

  /**
   * Absolute expiration time for cache entries in milliseconds.
   * Cache entries will expire after this duration from when they were cached.
   *
   * @default undefined (no expiration)
   */
  cacheAbsoluteExpiration?: number;

  /**
   * Sliding expiration time for cache entries in milliseconds.
   * Cache entries will expire after this duration of inactivity.
   *
   * @default undefined (no sliding expiration)
   */
  cacheSlidingExpiration?: number;

  /**
   * Offline cache configuration options.
   * Enables file-based caching for offline mode.
   *
   * @see {@link OfflineCacheOptions}
   */
  offlineCache?: OfflineCacheOptions;

  /**
   * Default language code (ISO 639-1) to use when language cannot be resolved.
   * Used as a fallback when no language resolver is configured or resolution fails.
   *
   * @example 'en', 'fr', 'es'
   */
  defaultLanguage?: string;

  /**
   * Language resolver for automatic language detection.
   *
   * Use implementations from `@translaas/extensions`:
   * - `LanguageResolver` - Chains multiple providers
   * - `RequestLanguageProvider` - Extracts language from HTTP requests
   * - `CultureLanguageProvider` - Uses browser's navigator.language
   * - `DefaultLanguageProvider` - Returns a fixed default language
   *
   * @see `ILanguageResolver` from `@translaas/extensions`
   */
  languageResolver?: any;
}

/**
 * Offline cache configuration options.
 *
 * Enables file-based caching for offline mode, allowing translations to be available
 * even when the API is unreachable.
 *
 * @example
 * ```typescript
 * const offlineCache: OfflineCacheOptions = {
 *   enabled: true,
 *   cacheDirectory: './.translaas-cache',
 *   fallbackMode: OfflineFallbackMode.CacheFirst,
 *   autoSync: true,
 *   autoSyncInterval: 3600000, // 1 hour
 *   projects: ['my-project'],
 *   languages: ['en', 'fr'],
 *   hybridCache: {
 *     enabled: true,
 *     memoryCacheExpiration: 300000, // 5 minutes
 *     maxMemoryCacheEntries: 1000
 *   }
 * };
 * ```
 */
export interface OfflineCacheOptions {
  /**
   * Whether offline caching is enabled.
   * When enabled, translations are persisted to disk for offline access.
   */
  enabled: boolean;

  /**
   * Directory path for storing cache files.
   * Only used in Node.js environments. In browsers, localStorage is used automatically.
   *
   * @default './.translaas-cache'
   */
  cacheDirectory?: string;

  /**
   * Fallback mode when API is unavailable.
   *
   * - {@link OfflineFallbackMode.CacheFirst}: Check cache first, then API
   * - {@link OfflineFallbackMode.ApiFirst}: Check API first, fallback to cache on failure
   * - {@link OfflineFallbackMode.CacheOnly}: Only use cache, never call API
   * - {@link OfflineFallbackMode.ApiOnlyWithBackup}: Use API, but save responses to cache
   *
   * @default OfflineFallbackMode.ApiFirst
   */
  fallbackMode?: OfflineFallbackMode;

  /**
   * Whether to automatically sync cache with API.
   * When enabled, cache is periodically refreshed from the API.
   *
   * @default false
   */
  autoSync?: boolean;

  /**
   * Interval for automatic cache sync in milliseconds.
   * Only used when {@link autoSync} is true.
   *
   * @default 3600000 (1 hour)
   */
  autoSyncInterval?: number;

  /**
   * List of project IDs to cache.
   * If not specified, all projects are cached.
   */
  projects?: string[];

  /**
   * List of language codes to cache.
   * If not specified, all languages are cached.
   */
  languages?: string[];

  /**
   * Default project ID to use when project is not specified in requests.
   */
  defaultProjectId?: string;

  /**
   * Hybrid cache configuration (L1 memory + L2 file cache).
   *
   * @see {@link HybridCacheOptions}
   */
  hybridCache?: HybridCacheOptions;
}

/**
 * Hybrid cache configuration options.
 *
 * Combines in-memory (L1) and file-based (L2) caching for optimal performance.
 * L1 cache provides fast access to frequently used translations, while L2 cache
 * provides persistent storage.
 *
 * @example
 * ```typescript
 * const hybridCache: HybridCacheOptions = {
 *   enabled: true,
 *   memoryCacheExpiration: 300000, // 5 minutes
 *   maxMemoryCacheEntries: 1000,
 *   warmupOnStartup: true
 * };
 * ```
 */
export interface HybridCacheOptions {
  /**
   * Whether hybrid caching is enabled.
   * When enabled, both L1 (memory) and L2 (file) caches are used.
   */
  enabled: boolean;

  /**
   * Expiration time for L1 (memory) cache entries in milliseconds.
   *
   * @default 300000 (5 minutes)
   */
  memoryCacheExpiration?: number;

  /**
   * Maximum number of entries in the L1 (memory) cache.
   * When exceeded, least recently used entries are evicted.
   *
   * @default 1000
   */
  maxMemoryCacheEntries?: number;

  /**
   * Whether to warm up the L1 cache on startup by loading from L2 cache.
   * Improves initial performance but increases startup time.
   *
   * @default false
   */
  warmupOnStartup?: boolean;
}

/**
 * Translation entry value type.
 *
 * Can be either:
 * - A simple string for non-pluralized entries
 * - A plural forms object mapping {@link PluralCategory} to strings for pluralized entries
 *
 * @example
 * ```typescript
 * // Simple string entry
 * const simpleEntry: TranslationEntryValue = 'Hello, World!';
 *
 * // Plural forms entry
 * const pluralEntry: TranslationEntryValue = {
 *   [PluralCategory.One]: 'one item',
 *   [PluralCategory.Other]: '{count} items'
 * };
 * ```
 */
export type TranslationEntryValue = string | Record<PluralCategory, string>;

/**
 * Translation group containing multiple translation entries.
 *
 * A translation group represents a collection of related translation entries,
 * typically organized by feature or module (e.g., "common", "ui", "messages").
 *
 * Groups can contain both simple string entries and pluralized entries.
 *
 * @example
 * ```typescript
 * // Create from API response
 * const group = await client.getGroupAsync('my-project', 'common', 'en');
 *
 * // Get simple entry
 * const welcome = group.getValue('welcome');
 *
 * // Get pluralized entry
 * const items = group.getPluralFormForNumber('items', 5, 'en');
 *
 * // Check if entry has plural forms
 * if (group.hasPluralForms('items')) {
 *   const forms = group.getPluralForms('items');
 * }
 * ```
 */
export class TranslationGroup {
  /**
   * Dictionary of translation entries
   * Keys are entry names, values are either strings or plural forms objects
   */
  public entries: Record<string, TranslationEntryValue>;

  constructor(entries: Record<string, TranslationEntryValue> = {}) {
    this.entries = entries;
  }

  /**
   * Gets a translation value as a string
   * Returns null if the entry has plural forms (use getPluralForms instead)
   * @param key Entry key
   * @returns Translation string or null if entry has plural forms
   */
  getValue(key: string): string | null {
    const entry = this.entries[key];
    if (typeof entry === 'string') {
      return entry;
    }
    // If it's an object, it has plural forms
    return null;
  }

  /**
   * Gets plural forms dictionary for an entry
   * @param key Entry key
   * @returns Dictionary of plural forms by category, or null if entry doesn't have plural forms
   */
  getPluralForms(key: string): Record<PluralCategory, string> | null {
    const entry = this.entries[key];
    if (typeof entry === 'object' && entry !== null && typeof entry !== 'string') {
      return entry as Record<PluralCategory, string>;
    }
    return null;
  }

  /**
   * Checks if an entry has plural forms
   * @param key Entry key
   * @returns True if entry has plural forms, false otherwise
   */
  hasPluralForms(key: string): boolean {
    const entry = this.entries[key];
    return typeof entry === 'object' && entry !== null && typeof entry !== 'string';
  }

  /**
   * Gets a specific plural form for an entry
   * @param key Entry key
   * @param category Plural category
   * @returns Plural form string or null if not found
   */
  getPluralForm(key: string, category: PluralCategory): string | null {
    const forms = this.getPluralForms(key);
    if (!forms) {
      return null;
    }
    return forms[category] ?? null;
  }

  /**
   * Gets the appropriate plural form for an entry based on a number and language code.
   * This method automatically resolves the plural category using PluralResolver and retrieves
   * the corresponding translation. Falls back to "other" category if the resolved category
   * is not available.
   *
   * @param key Entry key
   * @param number The number to determine plural category for
   * @param lang Language code (e.g., "en", "fr", "ru", "ar") or locale code (e.g., "en-US", "fr-CA")
   * @returns Plural form string, or null if entry doesn't have plural forms
   *
   * @example
   * ```typescript
   * const group = new TranslationGroup({
   *   item: {
   *     [PluralCategory.One]: 'one item',
   *     [PluralCategory.Other]: '{count} items',
   *   },
   * });
   *
   * group.getPluralFormForNumber('item', 1, 'en'); // 'one item'
   * group.getPluralFormForNumber('item', 5, 'en'); // '{count} items'
   * group.getPluralFormForNumber('item', 2, 'ru'); // Uses resolved category (few/many/other)
   * ```
   */
  getPluralFormForNumber(key: string, number: number, lang: string): string | null {
    const forms = this.getPluralForms(key);
    if (!forms) {
      return null;
    }

    const category = PluralResolver.resolveCategory(number, lang);

    // Try to get the form for the resolved category
    const form = forms[category];
    if (form) {
      return form;
    }

    // Fallback to "other" if the resolved category is not available
    // This is a common pattern in i18n where not all categories are always provided
    return forms[PluralCategory.Other] ?? null;
  }
}

/**
 * Translation project containing multiple translation groups.
 *
 * A translation project represents all translations for a specific project,
 * organized into groups. This is the top-level container for translations.
 *
 * @example
 * ```typescript
 * // Get entire project from API
 * const project = await client.getProjectAsync('my-project', 'en');
 *
 * // Get a specific group
 * const commonGroup = project.getGroup('common');
 * if (commonGroup) {
 *   const welcome = commonGroup.getValue('welcome');
 * }
 *
 * // Access all groups
 * console.log(Object.keys(project.groups)); // ['common', 'ui', 'messages']
 * ```
 */
export class TranslationProject {
  /**
   * Dictionary of translation groups
   * Keys are group names, values are group entry dictionaries
   */
  public groups: Record<string, Record<string, TranslationEntryValue>>;

  constructor(groups: Record<string, Record<string, TranslationEntryValue>> = {}) {
    this.groups = groups;
  }

  /**
   * Gets a translation group by name
   * @param groupName Group name
   * @returns TranslationGroup instance or null if group not found
   */
  getGroup(groupName: string): TranslationGroup | null {
    const groupEntries = this.groups[groupName];
    if (!groupEntries) {
      return null;
    }
    return new TranslationGroup(groupEntries);
  }
}

/**
 * Project locales containing available locale codes.
 *
 * Represents the list of language codes available for a specific project.
 *
 * @example
 * ```typescript
 * // Get available locales
 * const locales = await client.getProjectLocalesAsync('my-project');
 *
 * // Check if a language is available
 * if (locales.locales.includes('fr')) {
 *   // French is available
 * }
 *
 * // List all available languages
 * locales.locales.forEach(lang => {
 *   console.log(`Available: ${lang}`);
 * });
 * ```
 */
export class ProjectLocales {
  /**
   * List of available locale codes
   */
  public locales: string[];

  constructor(locales: string[] = []) {
    this.locales = locales;
  }
}
