import type { ITranslaasClient } from './types';
import type { TranslaasOptions, TranslationEntryValue } from '@translaas/models';
import {
  TranslaasApiException,
  TranslaasConfigurationException,
  TranslationGroup,
  TranslationProject,
  ProjectLocales,
} from '@translaas/models';

/**
 * Translaas HTTP client implementation.
 *
 * Provides methods to interact with the Translaas Translation Delivery API.
 * Supports fetching individual translation entries, groups, projects, and available locales.
 *
 * This is the core client class for making API requests. For a more convenient API
 * with automatic language resolution, use {@link TranslaasService}.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const client = new TranslaasClient({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.translaas.com'
 * });
 *
 * const translation = await client.getEntryAsync('common', 'welcome', 'en');
 *
 * // With pluralization
 * const items = await client.getEntryAsync('messages', 'items', 'en', 5);
 *
 * // With parameters
 * const greeting = await client.getEntryAsync('common', 'greeting', 'en', undefined, {
 *   name: 'John'
 * });
 *
 * // Get entire group
 * const group = await client.getGroupAsync('my-project', 'common', 'en');
 *
 * // Get entire project
 * const project = await client.getProjectAsync('my-project', 'en');
 *
 * // Get available locales
 * const locales = await client.getProjectLocalesAsync('my-project');
 * ```
 *
 * @see {@link ITranslaasClient} for the interface definition
 * @see {@link TranslaasService} for a higher-level API with language resolution
 */
export class TranslaasClient implements ITranslaasClient {
  private readonly baseUrl: string;

  /**
   * Creates a new TranslaasClient instance.
   *
   * @param options - Configuration options for the client
   * @throws `TranslaasConfigurationException` if API key or base URL is missing or empty
   *
   * @example
   * ```typescript
   * const client = new TranslaasClient({
   *   apiKey: 'your-api-key',
   *   baseUrl: 'https://api.translaas.com',
   *   timeout: 30000 // 30 seconds
   * });
   * ```
   */
  constructor(private options: TranslaasOptions) {
    if (!options.apiKey || options.apiKey.trim() === '') {
      throw new TranslaasConfigurationException('API key is required');
    }
    if (!options.baseUrl || options.baseUrl.trim() === '') {
      throw new TranslaasConfigurationException('Base URL is required');
    }

    // Normalize baseUrl: remove trailing slashes
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
  }

  /**
   * Builds query parameters from an object
   */
  private buildQueryParams(params: Record<string, string | number | undefined>): URLSearchParams {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParams.set(key, value.toString());
      }
    }
    return queryParams;
  }

  /**
   * Creates an AbortSignal with timeout if timeout is configured
   */
  private createAbortSignal(cancellationToken?: AbortSignal): AbortSignal | undefined {
    if (!this.options.timeout) {
      return cancellationToken;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

    // If a cancellation token is provided, abort when it's aborted
    if (cancellationToken) {
      cancellationToken.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        controller.abort();
      });
    } else {
      // Clean up timeout when signal is aborted
      controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));
    }

    return controller.signal;
  }

  /**
   * Handles API errors and throws appropriate exceptions
   */
  private async handleApiError(response: Response): Promise<never> {
    let errorMessage = `API request failed: ${response.statusText}`;
    let responseBody: string | undefined;

    try {
      responseBody = await response.text();
      if (responseBody) {
        // Try to parse as JSON for better error messages
        try {
          const json = JSON.parse(responseBody);
          if (json.message || json.error) {
            errorMessage = json.message || json.error || errorMessage;
          }
        } catch {
          // If not JSON, use the text as-is
          errorMessage =
            responseBody.length > 200 ? `${errorMessage} (response too long)` : responseBody;
        }
      }
    } catch {
      // Ignore errors when reading response body
    }

    throw new TranslaasApiException(errorMessage, response.status);
  }

  /**
   * Makes an HTTP request with proper error handling
   */
  private async makeRequest(
    endpoint: string,
    queryParams: URLSearchParams,
    acceptHeader: string,
    cancellationToken?: AbortSignal
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}?${queryParams.toString()}`;
    const signal = this.createAbortSignal(cancellationToken);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.options.apiKey,
          Accept: acceptHeader,
        },
        signal,
      });

      if (!response.ok) {
        await this.handleApiError(response);
      }

      return response;
    } catch (error) {
      // Handle network errors and abort errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new TranslaasApiException('Request was cancelled or timed out', undefined, error);
        }
        if (error instanceof TranslaasApiException) {
          throw error;
        }
        throw new TranslaasApiException(`Network error: ${error.message}`, undefined, error);
      }
      throw new TranslaasApiException('Unknown error occurred', undefined, error as Error);
    }
  }

  /**
   * Gets a single translation entry as plain text
   *
   * @param group - Translation group name
   * @param entry - Translation entry key
   * @param lang - Language code (ISO 639-1)
   * @param number - Optional number for pluralization
   * @param parameters - Optional custom parameters for template substitution
   * @param cancellationToken - Optional AbortSignal to cancel the request
   * @returns Promise resolving to the translation text
   * @throws TranslaasApiException if the API request fails
   */
  async getEntryAsync(
    group: string,
    entry: string,
    lang: string,
    number?: number,
    parameters?: Record<string, string>,
    cancellationToken?: AbortSignal
  ): Promise<string> {
    const queryParams = this.buildQueryParams({
      group,
      entry,
      lang,
      n: number,
      ...parameters,
    });

    const response = await this.makeRequest(
      '/api/translations/text',
      queryParams,
      'text/plain',
      cancellationToken
    );

    return await response.text();
  }

  /**
   * Gets all translations for a specific group
   *
   * @param project - Project identifier
   * @param group - Translation group name
   * @param lang - Language code (ISO 639-1)
   * @param format - Optional response format (e.g., 'json')
   * @param cancellationToken - Optional AbortSignal to cancel the request
   * @returns Promise resolving to a TranslationGroup instance
   * @throws TranslaasApiException if the API request fails
   */
  async getGroupAsync(
    project: string,
    group: string,
    lang: string,
    format?: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup> {
    const queryParams = this.buildQueryParams({
      project,
      group,
      lang,
      format,
    });

    const response = await this.makeRequest(
      '/api/translations/group',
      queryParams,
      'application/json',
      cancellationToken
    );

    const data = (await response.json()) as Record<string, TranslationEntryValue>;
    return new TranslationGroup(data);
  }

  /**
   * Gets all translations for a project
   *
   * @param project - Project identifier
   * @param lang - Language code (ISO 639-1)
   * @param format - Optional response format (e.g., 'json')
   * @param cancellationToken - Optional AbortSignal to cancel the request
   * @returns Promise resolving to a TranslationProject instance
   * @throws TranslaasApiException if the API request fails
   */
  async getProjectAsync(
    project: string,
    lang: string,
    format?: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject> {
    const queryParams = this.buildQueryParams({
      project,
      lang,
      format,
    });

    const response = await this.makeRequest(
      '/api/translations/project',
      queryParams,
      'application/json',
      cancellationToken
    );

    const data = (await response.json()) as Record<string, Record<string, TranslationEntryValue>>;
    return new TranslationProject(data);
  }

  /**
   * Gets available locales for a project
   *
   * @param project - Project identifier
   * @param cancellationToken - Optional AbortSignal to cancel the request
   * @returns Promise resolving to a ProjectLocales instance containing available locale codes
   * @throws TranslaasApiException if the API request fails
   */
  async getProjectLocalesAsync(
    project: string,
    cancellationToken?: AbortSignal
  ): Promise<ProjectLocales> {
    const queryParams = this.buildQueryParams({
      project,
    });

    const response = await this.makeRequest(
      '/api/translations/locales',
      queryParams,
      'application/json',
      cancellationToken
    );

    const data = (await response.json()) as { locales?: string[] } | string[];
    // Handle both { locales: [...] } and [...] formats
    const locales = Array.isArray(data) ? data : data.locales || [];
    return new ProjectLocales(locales);
  }
}
