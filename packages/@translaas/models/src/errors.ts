/**
 * Base exception for all Translaas errors
 */
export class TranslaasException extends Error {
  /**
   * Inner exception that caused this error
   */
  public readonly innerError?: Error;

  constructor(message: string, innerError?: Error) {
    super(message);
    this.name = 'TranslaasException';
    this.innerError = innerError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TranslaasException);
    }
  }
}

/**
 * Exception thrown when the API returns an error
 */
export class TranslaasApiException extends TranslaasException {
  /**
   * HTTP status code from the API response
   */
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number, innerError?: Error) {
    super(message, innerError);
    this.name = 'TranslaasApiException';
    this.statusCode = statusCode;
  }
}

/**
 * Exception thrown when configuration is invalid
 */
export class TranslaasConfigurationException extends TranslaasException {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
    this.name = 'TranslaasConfigurationException';
  }
}

/**
 * Exception thrown when offline cache operations fail
 */
export class TranslaasOfflineCacheException extends TranslaasException {
  /**
   * Cache directory path where the error occurred
   */
  public readonly cacheDirectory?: string;

  /**
   * Project identifier related to the error
   */
  public readonly project?: string;

  /**
   * Language code related to the error
   */
  public readonly language?: string;

  constructor(
    message: string,
    cacheDirectory?: string,
    project?: string,
    language?: string,
    innerError?: Error
  ) {
    super(message, innerError);
    this.name = 'TranslaasOfflineCacheException';
    this.cacheDirectory = cacheDirectory;
    this.project = project;
    this.language = language;
  }
}

/**
 * Exception thrown when translation is not found in offline cache
 */
export class TranslaasOfflineCacheMissException extends TranslaasOfflineCacheException {
  constructor(
    message: string,
    cacheDirectory?: string,
    project?: string,
    language?: string,
    innerError?: Error
  ) {
    super(message, cacheDirectory, project, language, innerError);
    this.name = 'TranslaasOfflineCacheMissException';
  }
}
