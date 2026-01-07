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
export class TranslationGroup {
    constructor(entries = {}) {
        this.entries = entries;
    }
    getValue(key) {
        const entry = this.entries[key];
        if (typeof entry === 'string') {
            return entry;
        }
        return null;
    }
    getPluralForms(key) {
        const entry = this.entries[key];
        if (typeof entry === 'object' && entry !== null && typeof entry !== 'string') {
            return entry;
        }
        return null;
    }
    hasPluralForms(key) {
        const entry = this.entries[key];
        return typeof entry === 'object' && entry !== null && typeof entry !== 'string';
    }
    getPluralForm(key, category) {
        const forms = this.getPluralForms(key);
        if (!forms) {
            return null;
        }
        return forms[category] ?? null;
    }
}
export class TranslationProject {
    constructor(groups = {}) {
        this.groups = groups;
    }
    getGroup(groupName) {
        const groupEntries = this.groups[groupName];
        if (!groupEntries) {
            return null;
        }
        return new TranslationGroup(groupEntries);
    }
}
export class ProjectLocales {
    constructor(locales = []) {
        this.locales = locales;
    }
}
//# sourceMappingURL=types.js.map