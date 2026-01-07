export class TranslaasException extends Error {
    constructor(message, innerError) {
        super(message);
        this.name = 'TranslaasException';
        this.innerError = innerError;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TranslaasException);
        }
    }
}
export class TranslaasApiException extends TranslaasException {
    constructor(message, statusCode, innerError) {
        super(message, innerError);
        this.name = 'TranslaasApiException';
        this.statusCode = statusCode;
    }
}
export class TranslaasConfigurationException extends TranslaasException {
    constructor(message, innerError) {
        super(message, innerError);
        this.name = 'TranslaasConfigurationException';
    }
}
export class TranslaasOfflineCacheException extends TranslaasException {
    constructor(message, cacheDirectory, project, language, innerError) {
        super(message, innerError);
        this.name = 'TranslaasOfflineCacheException';
        this.cacheDirectory = cacheDirectory;
        this.project = project;
        this.language = language;
    }
}
export class TranslaasOfflineCacheMissException extends TranslaasOfflineCacheException {
    constructor(message, cacheDirectory, project, language, innerError) {
        super(message, cacheDirectory, project, language, innerError);
        this.name = 'TranslaasOfflineCacheMissException';
    }
}
//# sourceMappingURL=errors.js.map