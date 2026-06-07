import type { ITranslaasClient } from './types';
import type {
  TranslaasOptions,
  SdkTranslationQueryParams,
  ReportMissingKeysRequestBody,
  ValidateApiKeyResponse,
} from '@translaas/models';
import {
  TranslaasApiException,
  TranslaasConfigurationException,
  TranslationGroup,
  TranslationProject,
  ProjectLocales,
  parseGroupTranslationsResponse,
  parseProjectTranslationsResponse,
  appendSdkTranslationQueryParams,
  resolveTranslaasOptionsWithDefaultProject,
  mergeNumberIntoParameters,
} from '@translaas/models';

function normalizeTranslationsPathPrefix(prefix: string): string {
  const trimmed = prefix.trim().replace(/\/+$/, '');
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/**
 * Translaas HTTP client implementation.
 *
 * Provides methods to interact with the Translaas Translation Delivery API.
 * Supports fetching individual translation entries, groups, projects, and available locales.
 *
 * This is the core client class for making API requests. For a more convenient API
 * with automatic language resolution, use {@link TranslaasService}.
 *
 * @see {@link ITranslaasClient} for the interface definition
 * @see {@link TranslaasService} for a higher-level API with language resolution
 */
export class TranslaasClient implements ITranslaasClient {
  private readonly baseUrl: string;
  private readonly translationsBase: string;

  /**
   * Creates a client after resolving `defaultProjectId` from the validate endpoint when it is not configured.
   */
  static async createAsync(options: TranslaasOptions): Promise<TranslaasClient> {
    const temp = new TranslaasClient(options);
    const resolved = await resolveTranslaasOptionsWithDefaultProject(options, () =>
      temp.validateApiKeyAsync()
    );
    return new TranslaasClient(resolved);
  }

  /**
   * Creates a new TranslaasClient instance.
   *
   * @param options - Configuration options for the client
   * @throws `TranslaasConfigurationException` if API key or base URL is missing or empty
   */
  constructor(private options: TranslaasOptions) {
    if (!options.apiKey || options.apiKey.trim() === '') {
      throw new TranslaasConfigurationException('API key is required');
    }
    if (!options.baseUrl || options.baseUrl.trim() === '') {
      throw new TranslaasConfigurationException('Base URL is required');
    }

    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.translationsBase = normalizeTranslationsPathPrefix(
      options.sdkTranslationsPathPrefix ?? '/sdk/v1/translations'
    );
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

  private mergeSdkQuery(extras?: SdkTranslationQueryParams): SdkTranslationQueryParams | undefined {
    const d = this.options.defaultSdkQuery;
    if (!d && !extras) {
      return undefined;
    }
    return { ...d, ...extras };
  }

  /**
   * Merges default + per-call SDK query params into URLSearchParams.
   * @param omitIncludeContext — the text endpoint does not use `includeContext`.
   */
  private appendMergedSdkQuery(
    target: URLSearchParams,
    extras?: SdkTranslationQueryParams,
    omitIncludeContext?: boolean
  ): void {
    const merged = this.mergeSdkQuery(extras);
    if (!merged) {
      return;
    }
    if (omitIncludeContext) {
      const { includeContext: _i, ...rest } = merged;
      appendSdkTranslationQueryParams(target, rest);
      return;
    }
    appendSdkTranslationQueryParams(target, merged);
  }

  private splitProjectAndCancel(
    projectOrCancellation?: string | AbortSignal,
    cancellationToken?: AbortSignal
  ): { explicitProject?: string; cancel?: AbortSignal } {
    if (projectOrCancellation === undefined) {
      return { explicitProject: undefined, cancel: cancellationToken };
    }
    if (typeof AbortSignal !== 'undefined' && projectOrCancellation instanceof AbortSignal) {
      return { explicitProject: undefined, cancel: projectOrCancellation };
    }
    return {
      explicitProject: projectOrCancellation as string,
      cancel: cancellationToken,
    };
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

    if (cancellationToken) {
      cancellationToken.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        controller.abort();
      });
    } else {
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
        try {
          const json = JSON.parse(responseBody);
          if (json.message || json.error) {
            errorMessage = json.message || json.error || errorMessage;
          }
        } catch {
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

  private async makeRawRequest(url: string, cancellationToken?: AbortSignal): Promise<Response> {
    const signal = this.createAbortSignal(cancellationToken);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.options.apiKey,
          Accept: 'application/zip, application/octet-stream;q=0.9, */*;q=0.8',
        },
        signal,
      });
      if (!response.ok) {
        await this.handleApiError(response);
      }
      return response;
    } catch (error) {
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

  private async postJson(
    endpoint: string,
    body: unknown,
    cancellationToken?: AbortSignal,
    successStatuses: number[] = [202]
  ): Promise<void> {
    const url = `${this.baseUrl}${endpoint}`;
    const signal = this.createAbortSignal(cancellationToken);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.options.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal,
      });
      if (!successStatuses.includes(response.status)) {
        await this.handleApiError(response);
      }
    } catch (error) {
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
   */
  async getEntryAsync(
    group: string,
    entry: string,
    lang: string,
    number?: number,
    parameters?: Record<string, string>,
    projectOrCancellation?: string | AbortSignal,
    cancellationToken?: AbortSignal
  ): Promise<string> {
    const { explicitProject, cancel } = this.splitProjectAndCancel(
      projectOrCancellation,
      cancellationToken
    );
    const project = explicitProject ?? this.options.defaultProjectId;
    const mergedParameters = mergeNumberIntoParameters(number, parameters);

    const queryParams = this.buildQueryParams({
      group,
      entry,
      lang,
      n: number,
      ...(project ? { project } : {}),
      ...mergedParameters,
    });
    this.appendMergedSdkQuery(queryParams, undefined, true);

    const response = await this.makeRequest(
      `${this.translationsBase}/text`,
      queryParams,
      'text/plain',
      cancel
    );

    return await response.text();
  }

  /**
   * Gets all translations for a specific group
   */
  async getGroupAsync(
    project: string,
    group: string,
    lang: string,
    format?: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup> {
    const queryParams = this.buildQueryParams({
      project,
      group,
      lang,
      format,
    });
    this.appendMergedSdkQuery(queryParams, sdkQuery, false);

    const response = await this.makeRequest(
      `${this.translationsBase}/group`,
      queryParams,
      'application/json',
      cancellationToken
    );

    const raw = await response.json();
    return parseGroupTranslationsResponse(raw);
  }

  /**
   * Gets all translations for a project
   */
  async getProjectAsync(
    project: string,
    lang: string,
    format?: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject> {
    const queryParams = this.buildQueryParams({
      project,
      lang,
      format,
    });
    this.appendMergedSdkQuery(queryParams, sdkQuery, false);

    const response = await this.makeRequest(
      `${this.translationsBase}/project`,
      queryParams,
      'application/json',
      cancellationToken
    );

    const raw = await response.json();
    return parseProjectTranslationsResponse(raw, format);
  }

  /**
   * Gets available locales for a project
   */
  async getProjectLocalesAsync(
    project: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<ProjectLocales> {
    const queryParams = this.buildQueryParams({
      project,
    });
    this.appendMergedSdkQuery(queryParams, sdkQuery, false);

    const response = await this.makeRequest(
      `${this.translationsBase}/locales`,
      queryParams,
      'application/json',
      cancellationToken
    );

    const raw = await response.json();
    if (Array.isArray(raw)) {
      return new ProjectLocales(raw as string[]);
    }
    const data = raw as {
      locales?: string[] | null;
      project?: string | null;
      lastModifiedUtc?: string | null;
    };
    const locales = data.locales || [];
    return new ProjectLocales(locales, {
      project: data.project ?? undefined,
      lastModifiedUtc: data.lastModifiedUtc ?? undefined,
    });
  }

  /**
   * Reports missing translation keys (requires a project-scoped API key on the server).
   */
  async reportMissingKeysAsync(
    body: ReportMissingKeysRequestBody,
    cancellationToken?: AbortSignal
  ): Promise<void> {
    await this.postJson(`${this.translationsBase}/report-missing`, body, cancellationToken, [202]);
  }

  /**
   * Downloads the offline translation bundle as a ZIP (`application/zip`).
   */
  async getOfflineCacheZipAsync(
    project: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<ArrayBuffer> {
    const queryParams = this.buildQueryParams({ project });
    this.appendMergedSdkQuery(queryParams, sdkQuery, false);
    const url = `${this.baseUrl}${this.translationsBase}/offline-cache?${queryParams.toString()}`;
    const response = await this.makeRawRequest(url, cancellationToken);
    return await response.arrayBuffer();
  }

  /**
   * Validates the configured API key (`GET /api/v1/api-keys/validate`).
   */
  async validateApiKeyAsync(cancellationToken?: AbortSignal): Promise<ValidateApiKeyResponse> {
    const url = `${this.baseUrl}/api/v1/api-keys/validate`;
    const signal = this.createAbortSignal(cancellationToken);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.options.apiKey,
          Accept: 'application/json',
        },
        signal,
      });
      if (!response.ok) {
        await this.handleApiError(response);
      }
      return (await response.json()) as ValidateApiKeyResponse;
    } catch (error) {
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
}
