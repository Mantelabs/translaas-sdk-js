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
};
export var CacheMode;
(function (CacheMode) {
    CacheMode[CacheMode["None"] = 0] = "None";
    CacheMode[CacheMode["Entry"] = 1] = "Entry";
    CacheMode[CacheMode["Group"] = 2] = "Group";
    CacheMode[CacheMode["Project"] = 3] = "Project";
})(CacheMode || (CacheMode = {}));
export var OfflineFallbackMode;
(function (OfflineFallbackMode) {
    OfflineFallbackMode[OfflineFallbackMode["CacheFirst"] = 0] = "CacheFirst";
    OfflineFallbackMode[OfflineFallbackMode["ApiFirst"] = 1] = "ApiFirst";
    OfflineFallbackMode[OfflineFallbackMode["CacheOnly"] = 2] = "CacheOnly";
    OfflineFallbackMode[OfflineFallbackMode["ApiOnlyWithBackup"] = 3] = "ApiOnlyWithBackup";
})(OfflineFallbackMode || (OfflineFallbackMode = {}));
export var PluralCategory;
(function (PluralCategory) {
    PluralCategory["Zero"] = "zero";
    PluralCategory["One"] = "one";
    PluralCategory["Two"] = "two";
    PluralCategory["Few"] = "few";
    PluralCategory["Many"] = "many";
    PluralCategory["Other"] = "other";
})(PluralCategory || (PluralCategory = {}));
//# sourceMappingURL=types.js.map