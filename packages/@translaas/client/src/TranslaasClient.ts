import type { ITranslaasClient } from './types';
import type {
  TranslaasOptions,
  TranslaasRequestContext,
  OfflineCacheDownloadResult,
  ReportMissingKeysRequestBody,
  ValidateApiKeyResponse,
} from '@translaas/models';
import {
  CacheMode,
  TranslaasApiException,
  TranslaasConfigurationException,
  TranslaasError,
  TranslationGroup,
  TranslationProject,
  ProjectLocales,
  parseGroupTranslationsResponse,
  parseProjectTranslationsResponse,
  appendSdkTranslationQueryParams,
  prepareRequestContext,
  assignResponseContext,
} from '@translaas/models';
import {
  CacheKeyBuilder,
  MemoryCacheProvider,
  type ITranslaasCacheProvider,
  type CacheSnapshotOptions,
} from '@translaas/caching';

function normalizeTranslationsPathPrefix(prefix: string): string {
  const trimmed = prefix.trim().replace(/\/+$/, '');
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function parseContentDispositionFileName(header: string | null): string | undefined {
  if (!header) {
    return undefined;
  }
  const starMatch = header.match(/filename\*=(?:UTF-8''|utf-8'')([^;\s]+)/i);
  if (starMatch?.[1]) {
    return decodeURIComponent(starMatch[1].replace(/^["']|["']$/g, ''));
  }
  const plainMatch = header.match(/filename=([^;\s]+)/i);
  if (plainMatch?.[1]) {
    return plainMatch[1].replace(/^["']|["']$/g, '');
  }
  return undefined;
}

function isAbortSignal(value: unknown): value is AbortSignal {
  return typeof AbortSignal !== 'undefined' && value instanceof AbortSignal;
}

function isRequestContext(value: unknown): value is TranslaasRequestContext {
  return typeof value === 'object' && value !== null && !isAbortSignal(value);
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
  private readonly cacheProvider?: ITranslaasCacheProvider;

  /**
   * Creates a new TranslaasClient instance.
   *
   * @param options - Configuration options for the client
   * @param cacheProvider - Optional cache provider (defaults to {@link MemoryCacheProvider} when `cacheMode` is not `None`)
   * @throws `TranslaasConfigurationException` if API key or base URL is missing or empty
   */
  constructor(
    private options: TranslaasOptions,
    cacheProvider?: ITranslaasCacheProvider
  ) {
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

    const cacheMode = options.cacheMode ?? CacheMode.None;
    if (cacheMode !== CacheMode.None) {
      this.cacheProvider = cacheProvider ?? new MemoryCacheProvider();
    }
  }

  private get cacheMode(): CacheMode {
    return this.options.cacheMode ?? CacheMode.None;
  }

  private buildQueryParams(params: Record<string, string | number | undefined>): URLSearchParams {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParams.set(key, value.toString());
      }
    }
    return queryParams;
  }

  private mergeRequestContext(
    extras?: TranslaasRequestContext
  ): TranslaasRequestContext | undefined {
    const defaults = this.options.defaultSdkQuery;
    if (!defaults && !extras) {
      return undefined;
    }
    return { ...defaults, ...extras };
  }

  /**
   * Merges default + per-call SDK query params into URLSearchParams.
   * @param omitIncludeContext — the text endpoint does not use `includeContext`.
   */
  private appendMergedSdkQuery(
    target: URLSearchParams,
    extras?: TranslaasRequestContext,
    omitIncludeContext?: boolean
  ): void {
    const merged = this.mergeRequestContext(extras);
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

  private splitEntryCallArgs(
    projectOrContextOrCancellation?: string | TranslaasRequestContext | AbortSignal,
    cancellationToken?: AbortSignal
  ): {
    explicitProject?: string;
    requestContext?: TranslaasRequestContext;
    cancel?: AbortSignal;
  } {
    if (projectOrContextOrCancellation === undefined) {
      return { cancel: cancellationToken };
    }
    if (isAbortSignal(projectOrContextOrCancellation)) {
      return { cancel: projectOrContextOrCancellation };
    }
    if (isRequestContext(projectOrContextOrCancellation)) {
      return {
        explicitProject: projectOrContextOrCancellation.project,
        requestContext: projectOrContextOrCancellation,
        cancel: cancellationToken,
      };
    }
    return {
      explicitProject: projectOrContextOrCancellation,
      cancel: cancellationToken,
    };
  }

  private mergeNumberIntoParameters(
    number?: number,
    parameters?: Record<string, string>
  ): Record<string, string> | undefined {
    if (number === undefined && (!parameters || Object.keys(parameters).length === 0)) {
      return undefined;
    }

    const merged: Record<string, string> = { ...parameters };
    const hasN = Object.keys(merged).some(k => k.toLowerCase() === 'n');
    if (number !== undefined && !hasN) {
      merged.N = number.toLocaleString('en-US', {
        useGrouping: false,
        maximumFractionDigits: 20,
      });
    }

    return Object.keys(merged).length > 0 ? merged : undefined;
  }

  private snapshotFromContext(
    project?: string,
    context?: TranslaasRequestContext
  ): CacheSnapshotOptions | undefined {
    const merged = this.mergeRequestContext(context);
    const snapshotProject = project ?? merged?.project;
    const channel = merged?.channel;
    const version = merged?.v;
    const includeContext = merged?.includeContext;

    if (!snapshotProject && !channel && !version && includeContext === undefined) {
      return undefined;
    }

    return {
      project: snapshotProject,
      channel,
      version,
      includeContext,
    };
  }

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

  private async handleApiError(response: Response): Promise<never> {
    let responseBody: string | undefined;
    let errorDetails: TranslaasError | undefined;

    try {
      responseBody = await response.text();
      if (responseBody) {
        try {
          errorDetails = JSON.parse(responseBody) as TranslaasError;
        } catch {
          errorDetails = undefined;
        }
      }
    } catch {
      responseBody = undefined;
    }

    let errorMessage =
      errorDetails?.message ??
      errorDetails?.detail ??
      errorDetails?.title ??
      errorDetails?.error ??
      `API request failed with status code ${response.status}.`;

    const code = errorDetails?.code;
    if (code) {
      errorMessage = `[${code}] ${errorMessage}`;
    } else if (!errorDetails && responseBody && responseBody.length <= 200) {
      errorMessage = responseBody;
    } else if (!errorDetails && responseBody && responseBody.length > 200) {
      errorMessage = `${errorMessage} (response too long)`;
    }

    throw new TranslaasApiException(errorMessage, response.status, undefined, responseBody, code);
  }

  private buildRequestHeaders(
    acceptHeader: string,
    requestContext?: TranslaasRequestContext
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'X-Api-Key': this.options.apiKey,
      Accept: acceptHeader,
    };
    if (requestContext?.ifNoneMatch) {
      headers['If-None-Match'] = requestContext.ifNoneMatch;
    }
    return headers;
  }

  private async fetchGet(
    endpoint: string,
    queryParams: URLSearchParams,
    acceptHeader: string,
    requestContext?: TranslaasRequestContext,
    cancellationToken?: AbortSignal
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}?${queryParams.toString()}`;
    const signal = this.createAbortSignal(cancellationToken);

    try {
      return await fetch(url, {
        method: 'GET',
        headers: this.buildRequestHeaders(acceptHeader, requestContext),
        signal,
      });
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

  private async fetchRawGet(
    url: string,
    requestContext?: TranslaasRequestContext,
    cancellationToken?: AbortSignal
  ): Promise<Response> {
    const signal = this.createAbortSignal(cancellationToken);

    try {
      return await fetch(url, {
        method: 'GET',
        headers: this.buildRequestHeaders(
          'application/zip, application/octet-stream;q=0.9, */*;q=0.8',
          requestContext
        ),
        signal,
      });
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

  private cacheSet<T>(key: string, value: T): void {
    this.cacheProvider?.set(
      key,
      value,
      this.options.cacheAbsoluteExpiration,
      this.options.cacheSlidingExpiration
    );
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
    projectOrContextOrCancellation?: string | TranslaasRequestContext | AbortSignal,
    cancellationToken?: AbortSignal
  ): Promise<string> {
    const { explicitProject, requestContext, cancel } = this.splitEntryCallArgs(
      projectOrContextOrCancellation,
      cancellationToken
    );

    prepareRequestContext(requestContext);

    const mergedParameters = this.mergeNumberIntoParameters(number, parameters);
    const project = explicitProject ?? requestContext?.project ?? this.options.defaultProjectId;
    const snapshot = this.snapshotFromContext(project, requestContext);

    if (this.cacheProvider && this.cacheMode === CacheMode.Entry) {
      const cacheKey = CacheKeyBuilder.buildEntryKey(
        group,
        entry,
        lang,
        number,
        mergedParameters,
        snapshot
      );
      const cached = this.cacheProvider.get<string>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const queryParams = this.buildQueryParams({
      group,
      entry,
      lang,
      ...(project ? { project } : {}),
      ...mergedParameters,
    });
    this.appendMergedSdkQuery(queryParams, requestContext, true);

    const response = await this.fetchGet(
      `${this.translationsBase}/text`,
      queryParams,
      'text/plain',
      requestContext,
      cancel
    );

    if (response.status === 204) {
      assignResponseContext(response, requestContext);
      return entry;
    }

    if (response.status === 304) {
      assignResponseContext(response, requestContext, true);
      return '';
    }

    if (!response.ok) {
      await this.handleApiError(response);
    }

    assignResponseContext(response, requestContext);
    const result = await response.text();

    if (this.cacheProvider && this.cacheMode === CacheMode.Entry) {
      const cacheKey = CacheKeyBuilder.buildEntryKey(
        group,
        entry,
        lang,
        number,
        mergedParameters,
        snapshot
      );
      this.cacheSet(cacheKey, result);
    }

    return result;
  }

  /**
   * Gets all translations for a specific group
   */
  async getGroupAsync(
    project: string,
    group: string,
    lang: string,
    format?: string,
    sdkQuery?: TranslaasRequestContext,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup> {
    prepareRequestContext(sdkQuery);
    const snapshot = this.snapshotFromContext(project, sdkQuery);

    if (
      this.cacheProvider &&
      (this.cacheMode === CacheMode.Group || this.cacheMode === CacheMode.Project)
    ) {
      const cacheKey = CacheKeyBuilder.buildGroupKey(project, group, lang, format, snapshot);
      const cached = this.cacheProvider.get<TranslationGroup>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const queryParams = this.buildQueryParams({
      project,
      group,
      lang,
      format,
    });
    this.appendMergedSdkQuery(queryParams, sdkQuery, false);

    const response = await this.fetchGet(
      `${this.translationsBase}/group`,
      queryParams,
      'application/json',
      sdkQuery,
      cancellationToken
    );

    if (response.status === 204 || response.status === 304) {
      assignResponseContext(response, sdkQuery, response.status === 304);
      return new TranslationGroup();
    }

    if (!response.ok) {
      await this.handleApiError(response);
    }

    assignResponseContext(response, sdkQuery);
    const raw = await response.json();
    const result = parseGroupTranslationsResponse(raw);

    if (
      this.cacheProvider &&
      (this.cacheMode === CacheMode.Group || this.cacheMode === CacheMode.Project)
    ) {
      const cacheKey = CacheKeyBuilder.buildGroupKey(project, group, lang, format, snapshot);
      this.cacheSet(cacheKey, result);
    }

    return result;
  }

  /**
   * Gets all translations for a project
   */
  async getProjectAsync(
    project: string,
    lang: string,
    format?: string,
    sdkQuery?: TranslaasRequestContext,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject> {
    prepareRequestContext(sdkQuery);
    const snapshot = this.snapshotFromContext(project, sdkQuery);

    if (this.cacheProvider && this.cacheMode === CacheMode.Project) {
      const cacheKey = CacheKeyBuilder.buildProjectKey(project, lang, format, snapshot);
      const cached = this.cacheProvider.get<TranslationProject>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const queryParams = this.buildQueryParams({
      project,
      lang,
      format,
    });
    this.appendMergedSdkQuery(queryParams, sdkQuery, false);

    const response = await this.fetchGet(
      `${this.translationsBase}/project`,
      queryParams,
      'application/json',
      sdkQuery,
      cancellationToken
    );

    if (response.status === 204 || response.status === 304) {
      assignResponseContext(response, sdkQuery, response.status === 304);
      return new TranslationProject();
    }

    if (!response.ok) {
      await this.handleApiError(response);
    }

    assignResponseContext(response, sdkQuery);
    const raw = await response.json();
    const result = parseProjectTranslationsResponse(raw, format);

    if (this.cacheProvider && this.cacheMode === CacheMode.Project) {
      const cacheKey = CacheKeyBuilder.buildProjectKey(project, lang, format, snapshot);
      this.cacheSet(cacheKey, result);
    }

    return result;
  }

  /**
   * Gets available locales for a project
   */
  async getProjectLocalesAsync(
    project: string,
    sdkQuery?: TranslaasRequestContext,
    cancellationToken?: AbortSignal
  ): Promise<ProjectLocales> {
    prepareRequestContext(sdkQuery);
    const snapshot = this.snapshotFromContext(project, sdkQuery);

    if (this.cacheProvider && this.cacheMode !== CacheMode.None) {
      const cacheKey = CacheKeyBuilder.buildLocalesKey(project, snapshot);
      const cached = this.cacheProvider.get<ProjectLocales>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const queryParams = this.buildQueryParams({ project });
    this.appendMergedSdkQuery(queryParams, sdkQuery, false);

    const response = await this.fetchGet(
      `${this.translationsBase}/locales`,
      queryParams,
      'application/json',
      sdkQuery,
      cancellationToken
    );

    if (response.status === 204) {
      assignResponseContext(response, sdkQuery);
      return new ProjectLocales([]);
    }

    if (response.status === 304) {
      assignResponseContext(response, sdkQuery, true);
      return new ProjectLocales([], { project });
    }

    if (!response.ok) {
      await this.handleApiError(response);
    }

    assignResponseContext(response, sdkQuery);
    const raw = await response.json();
    let result: ProjectLocales;
    if (Array.isArray(raw)) {
      result = new ProjectLocales(raw as string[]);
    } else {
      const data = raw as {
        locales?: string[] | null;
        project?: string | null;
        lastModifiedUtc?: string | null;
      };
      const locales = data.locales || [];
      result = new ProjectLocales(locales, {
        project: data.project ?? undefined,
        lastModifiedUtc: data.lastModifiedUtc ?? undefined,
      });
    }

    if (this.cacheProvider && this.cacheMode !== CacheMode.None) {
      const cacheKey = CacheKeyBuilder.buildLocalesKey(project, snapshot);
      this.cacheSet(cacheKey, result);
    }

    return result;
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
   * Downloads the offline translation bundle as a ZIP with response metadata.
   */
  async getOfflineCacheAsync(
    project: string,
    sdkQuery?: TranslaasRequestContext,
    cancellationToken?: AbortSignal
  ): Promise<OfflineCacheDownloadResult> {
    prepareRequestContext(sdkQuery);

    const queryParams = this.buildQueryParams({ project });
    this.appendMergedSdkQuery(queryParams, sdkQuery, false);
    const url = `${this.baseUrl}${this.translationsBase}/offline-cache?${queryParams.toString()}`;

    const response = await this.fetchRawGet(url, sdkQuery, cancellationToken);

    if (response.status === 304) {
      assignResponseContext(response, sdkQuery, true);
      return {
        notModified: true,
        content: null,
        responseEtag: response.headers?.get('etag') ?? sdkQuery?.responseEtag,
        suggestedFileName: undefined,
      };
    }

    if (!response.ok) {
      await this.handleApiError(response);
    }

    assignResponseContext(response, sdkQuery);
    const content = await response.arrayBuffer();
    const suggestedFileName = parseContentDispositionFileName(
      response.headers?.get('content-disposition') ?? null
    );

    return {
      notModified: false,
      content,
      responseEtag: response.headers?.get('etag') ?? sdkQuery?.responseEtag,
      suggestedFileName,
    };
  }

  /**
   * Downloads the offline translation bundle as a ZIP (`application/zip`).
   */
  async getOfflineCacheZipAsync(
    project: string,
    sdkQuery?: TranslaasRequestContext,
    cancellationToken?: AbortSignal
  ): Promise<ArrayBuffer> {
    const result = await this.getOfflineCacheAsync(project, sdkQuery, cancellationToken);
    return result.content ?? new ArrayBuffer(0);
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
