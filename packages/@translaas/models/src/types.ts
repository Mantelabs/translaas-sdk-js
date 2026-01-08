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
  // Language resolver for automatic language detection
  // Type: ILanguageResolver from @translaas/extensions
  languageResolver?: any;
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
 * Translation entry value - can be a string or plural forms object
 */
export type TranslationEntryValue = string | Record<PluralCategory, string>;

/**
 * Translation group containing multiple translation entries
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
}

/**
 * Translation project containing multiple translation groups
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
 * Project locales containing available locale codes
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
