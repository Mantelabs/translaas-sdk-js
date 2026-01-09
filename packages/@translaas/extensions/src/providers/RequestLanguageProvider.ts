import type { ILanguageProvider } from '../types';

/**
 * Request language provider for Express.js and Next.js.
 *
 * Extracts language information from HTTP request objects by checking multiple sources
 * in priority order:
 * 1. Route parameters (e.g., `/api/:lang/translate`)
 * 2. Query string (e.g., `?lang=en`)
 * 3. Cookies (e.g., `lang=en`)
 * 4. Accept-Language header (e.g., `Accept-Language: en-US,en;q=0.9`)
 *
 * Compatible with:
 * - Express.js request objects
 * - Next.js API route request objects (App Router and Pages Router)
 * - Any object with params, query, headers, and cookies properties
 *
 * @example
 * ```typescript
 * // Express.js example
 * app.get('/api/translate', async (req, res) => {
 *   const provider = new RequestLanguageProvider(req);
 *   const lang = await provider.getLanguageAsync();
 *   // Language extracted from request
 * });
 *
 * // With custom parameter names
 * const provider = new RequestLanguageProvider(req, {
 *   route: 'locale',    // Check req.params.locale
 *   query: 'language',  // Check req.query.language
 *   cookie: 'lang',     // Check req.cookies.lang
 *   header: 'x-lang'    // Check req.headers['x-lang']
 * });
 * ```
 *
 * @see {@link ILanguageProvider} for the interface definition
 */
export class RequestLanguageProvider implements ILanguageProvider {
  /**
   * Request object type (minimal interface for compatibility with Express and Next.js)
   */
  private readonly request: {
    params?: Record<string, string>;
    query?: Record<string, string | string[] | undefined>;
    headers?: Record<string, string | string[] | undefined>;
    cookies?: Record<string, string>;
  };

  /**
   * Optional parameter names to check in different sources
   */
  private readonly paramNames: {
    route?: string;
    query?: string;
    header?: string;
    cookie?: string;
  };

  /**
   * Creates a new RequestLanguageProvider instance.
   *
   * @param request - Request object with params, query, headers, and cookies properties
   * @param paramNames - Optional custom parameter names for different sources
   *                    - route: Parameter name in route params (default: 'lang')
   *                    - query: Parameter name in query string (default: 'lang')
   *                    - cookie: Cookie name (default: 'lang')
   *                    - header: Header name (default: 'accept-language')
   *
   * @example
   * ```typescript
   * // Default parameter names
   * const provider = new RequestLanguageProvider(req);
   *
   * // Custom parameter names
   * const provider = new RequestLanguageProvider(req, {
   *   route: 'locale',
   *   query: 'language',
   *   cookie: 'user-lang',
   *   header: 'x-language'
   * });
   * ```
   */
  constructor(
    request: {
      params?: Record<string, string>;
      query?: Record<string, string | string[] | undefined>;
      headers?: Record<string, string | string[] | undefined>;
      cookies?: Record<string, string>;
    },
    paramNames?: {
      route?: string;
      query?: string;
      header?: string;
      cookie?: string;
    }
  ) {
    this.request = request;
    this.paramNames = {
      route: paramNames?.route ?? 'lang',
      query: paramNames?.query ?? 'lang',
      header: paramNames?.header ?? 'accept-language',
      cookie: paramNames?.cookie ?? 'lang',
    };
  }

  /**
   * Resolves language from request sources in priority order.
   *
   * Checks sources in this order:
   * 1. Route parameters (e.g., `/api/:lang/translate`)
   * 2. Query string (e.g., `?lang=en`)
   * 3. Cookies (e.g., `lang=en`)
   * 4. Accept-Language header (e.g., `Accept-Language: en-US,en;q=0.9`)
   *
   * Returns the first non-null value found, or null if none are found.
   * Language codes are normalized (e.g., "en-US" → "en") before being returned.
   *
   * @returns Promise resolving to the normalized language code or null if not found
   *
   * @example
   * ```typescript
   * const provider = new RequestLanguageProvider(req);
   * const lang = await provider.getLanguageAsync();
   * // Returns language from request, or null if not found
   * ```
   */
  async getLanguageAsync(): Promise<string | null> {
    // 1. Check route parameters
    if (this.request.params && this.paramNames.route) {
      const lang = this.request.params[this.paramNames.route];
      if (lang) {
        return this.normalizeLanguage(lang);
      }
    }

    // 2. Check query string
    if (this.request.query && this.paramNames.query) {
      const lang = this.request.query[this.paramNames.query];
      if (lang) {
        const langStr = Array.isArray(lang) ? lang[0] : lang;
        if (langStr) {
          return this.normalizeLanguage(langStr);
        }
      }
    }

    // 3. Check cookies
    if (this.request.cookies && this.paramNames.cookie) {
      const lang = this.request.cookies[this.paramNames.cookie];
      if (lang) {
        return this.normalizeLanguage(lang);
      }
    }

    // 4. Check Accept-Language header
    if (this.request.headers && this.paramNames.header) {
      const acceptLanguage = this.request.headers[this.paramNames.header];
      if (acceptLanguage) {
        const langStr = Array.isArray(acceptLanguage) ? acceptLanguage[0] : acceptLanguage;
        if (langStr) {
          return this.parseAcceptLanguage(langStr);
        }
      }
    }

    return null;
  }

  /**
   * Parses Accept-Language header and returns the first language
   * @param acceptLanguage Accept-Language header value (e.g., "en-US,en;q=0.9,fr;q=0.8")
   * @returns Normalized language code or null
   */
  private parseAcceptLanguage(acceptLanguage: string): string | null {
    // Parse Accept-Language header: "en-US,en;q=0.9,fr;q=0.8"
    // Extract the first language code
    const languages = acceptLanguage.split(',').map(lang => {
      // Remove quality values (e.g., ";q=0.9")
      const parts = lang.trim().split(';');
      return parts[0].trim();
    });

    if (languages.length > 0 && languages[0]) {
      return this.normalizeLanguage(languages[0]);
    }

    return null;
  }

  /**
   * Normalizes a language code (e.g., "en-US" -> "en")
   * @param lang Language code to normalize
   * @returns Normalized language code
   */
  private normalizeLanguage(lang: string): string {
    // Extract the primary language code (ISO 639-1)
    // "en-US" -> "en", "fr-CA" -> "fr", etc.
    const parts = lang.split('-');
    return parts[0].toLowerCase();
  }
}
