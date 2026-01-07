export declare class TranslaasException extends Error {
    readonly innerError?: Error;
    constructor(message: string, innerError?: Error);
}
export declare class TranslaasApiException extends TranslaasException {
    readonly statusCode?: number;
    constructor(message: string, statusCode?: number, innerError?: Error);
}
export declare class TranslaasConfigurationException extends TranslaasException {
    constructor(message: string, innerError?: Error);
}
export declare class TranslaasOfflineCacheException extends TranslaasException {
    readonly cacheDirectory?: string;
    readonly project?: string;
    readonly language?: string;
    constructor(message: string, cacheDirectory?: string, project?: string, language?: string, innerError?: Error);
}
export declare class TranslaasOfflineCacheMissException extends TranslaasOfflineCacheException {
    constructor(message: string, cacheDirectory?: string, project?: string, language?: string, innerError?: Error);
}
//# sourceMappingURL=errors.d.ts.map