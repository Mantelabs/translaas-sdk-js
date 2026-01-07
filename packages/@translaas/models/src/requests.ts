/**
 * Request model for getting a single translation entry
 */
export interface GetTranslationRequest {
  /**
   * Translation group name (e.g., "common", "ui", "messages")
   */
  group: string;

  /**
   * Translation entry key (e.g., "welcome", "button.save")
   */
  entry: string;

  /**
   * Language code (ISO 639-1, e.g., "en", "fr", "es")
   */
  lang: string;

  /**
   * Number for pluralization (optional)
   * Supports integer and decimal values (e.g., 1, 5, 1.31)
   */
  n?: number;

  /**
   * Named parameters for placeholder replacement (optional)
   * Additional properties beyond group, entry, lang, and n are treated as parameters
   */
  [key: string]: string | number | undefined;
}

/**
 * Request model for getting all translations for a group
 */
export interface GetGroupTranslationsRequest {
  /**
   * Project identifier
   */
  project: string;

  /**
   * Translation group name
   */
  group: string;

  /**
   * Language code
   */
  lang: string;

  /**
   * Optional format parameter (API-specific)
   */
  format?: string;
}

/**
 * Request model for getting all translations for a project
 */
export interface GetProjectTranslationsRequest {
  /**
   * Project identifier
   */
  project: string;

  /**
   * Language code
   */
  lang: string;

  /**
   * Optional format parameter (API-specific)
   */
  format?: string;
}

/**
 * Request model for getting available locales for a project
 */
export interface GetProjectLocalesRequest {
  /**
   * Project identifier
   */
  project: string;
}
