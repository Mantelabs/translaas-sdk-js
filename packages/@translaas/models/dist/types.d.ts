export declare const LanguageCodes: {
    readonly English: "en";
    readonly French: "fr";
    readonly Spanish: "es";
    readonly German: "de";
    readonly Italian: "it";
    readonly Portuguese: "pt";
    readonly Russian: "ru";
    readonly Japanese: "ja";
    readonly Chinese: "zh";
    readonly Korean: "ko";
    readonly Arabic: "ar";
    readonly Hindi: "hi";
    readonly Turkish: "tr";
    readonly Polish: "pl";
    readonly Dutch: "nl";
    readonly Greek: "el";
    readonly Czech: "cs";
    readonly Swedish: "sv";
    readonly Norwegian: "no";
    readonly Danish: "da";
    readonly Finnish: "fi";
    readonly Romanian: "ro";
    readonly Hungarian: "hu";
    readonly Bulgarian: "bg";
    readonly Croatian: "hr";
    readonly Slovak: "sk";
    readonly Slovenian: "sl";
    readonly Lithuanian: "lt";
    readonly Latvian: "lv";
    readonly Estonian: "et";
    readonly Ukrainian: "uk";
    readonly Serbian: "sr";
    readonly Macedonian: "mk";
    readonly Albanian: "sq";
    readonly Icelandic: "is";
    readonly Irish: "ga";
    readonly Welsh: "cy";
    readonly Maltese: "mt";
    readonly Hebrew: "he";
    readonly Persian: "fa";
    readonly Urdu: "ur";
    readonly Bengali: "bn";
    readonly Tamil: "ta";
    readonly Telugu: "te";
    readonly Marathi: "mr";
    readonly Gujarati: "gu";
    readonly Kannada: "kn";
    readonly Malayalam: "ml";
    readonly Punjabi: "pa";
    readonly Thai: "th";
    readonly Vietnamese: "vi";
    readonly Indonesian: "id";
    readonly Malay: "ms";
    readonly Filipino: "tl";
    readonly Swahili: "sw";
    readonly Afrikaans: "af";
    readonly Zulu: "zu";
    readonly Xhosa: "xh";
    readonly Amharic: "am";
    readonly Hausa: "ha";
    readonly Yoruba: "yo";
    readonly Igbo: "ig";
    readonly Somali: "so";
    readonly Malagasy: "mg";
    readonly Khmer: "km";
    readonly Lao: "lo";
    readonly Myanmar: "my";
    readonly Georgian: "ka";
    readonly Armenian: "hy";
    readonly Azerbaijani: "az";
    readonly Kazakh: "kk";
    readonly Kyrgyz: "ky";
    readonly Uzbek: "uz";
    readonly Tajik: "tg";
    readonly Turkmen: "tk";
    readonly Mongolian: "mn";
    readonly Nepali: "ne";
    readonly Sinhala: "si";
};
export type LanguageCode = (typeof LanguageCodes)[keyof typeof LanguageCodes];
export declare enum CacheMode {
    None = 0,
    Entry = 1,
    Group = 2,
    Project = 3
}
export declare enum OfflineFallbackMode {
    CacheFirst = 0,
    ApiFirst = 1,
    CacheOnly = 2,
    ApiOnlyWithBackup = 3
}
export declare enum PluralCategory {
    Zero = "zero",
    One = "one",
    Two = "two",
    Few = "few",
    Many = "many",
    Other = "other"
}
export interface TranslaasOptions {
    apiKey: string;
    baseUrl: string;
    cacheMode?: CacheMode;
    timeout?: number;
    cacheAbsoluteExpiration?: number;
    cacheSlidingExpiration?: number;
    offlineCache?: OfflineCacheOptions;
    defaultLanguage?: string;
}
export interface OfflineCacheOptions {
    enabled: boolean;
    cacheDirectory?: string;
    fallbackMode?: OfflineFallbackMode;
    autoSync?: boolean;
    autoSyncInterval?: number;
    projects?: string[];
    languages?: string[];
    defaultProjectId?: string;
    hybridCache?: HybridCacheOptions;
}
export interface HybridCacheOptions {
    enabled: boolean;
    memoryCacheExpiration?: number;
    maxMemoryCacheEntries?: number;
    warmupOnStartup?: boolean;
}
export type TranslationEntryValue = string | Record<PluralCategory, string>;
export declare class TranslationGroup {
    entries: Record<string, TranslationEntryValue>;
    constructor(entries?: Record<string, TranslationEntryValue>);
    getValue(key: string): string | null;
    getPluralForms(key: string): Record<PluralCategory, string> | null;
    hasPluralForms(key: string): boolean;
    getPluralForm(key: string, category: PluralCategory): string | null;
}
export declare class TranslationProject {
    groups: Record<string, Record<string, TranslationEntryValue>>;
    constructor(groups?: Record<string, Record<string, TranslationEntryValue>>);
    getGroup(groupName: string): TranslationGroup | null;
}
export declare class ProjectLocales {
    locales: string[];
    constructor(locales?: string[]);
}
//# sourceMappingURL=types.d.ts.map