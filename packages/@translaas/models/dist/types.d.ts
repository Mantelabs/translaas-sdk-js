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
export interface TranslationGroup {
    entries: Record<string, any>;
}
export interface TranslationProject {
    groups: Record<string, any>;
}
export interface ProjectLocales {
    locales: string[];
}
//# sourceMappingURL=types.d.ts.map