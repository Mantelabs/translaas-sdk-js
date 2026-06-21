import type { ITranslaasClient } from '@translaas/client';
import type { IOfflineCacheProvider } from './types';
import {
  OfflineFallbackMode,
  OfflineCacheOptions,
  PluralCategory,
  TranslaasApiException,
  TranslaasOfflineCacheException,
  TranslaasOfflineCacheMissException,
  TranslationGroup,
  TranslationProject,
  ProjectLocales,
  SdkTranslationQueryParams,
  ReportMissingKeysRequestBody,
  ValidateApiKeyResponse,
} from '@translaas/models';
import { determinePluralCategory, substituteParameters } from './offlineHelpers';

function isNetworkOrApiError(error: unknown): boolean {
  if (error instanceof TranslaasApiException) {
    return true;
  }
  if (error instanceof TypeError) {
    return true;
  }
  if (error instanceof Error && error.name !== 'AbortError') {
    return true;
  }
  return false;
}

function offlineCacheMiss(
  project: string,
  language: string,
  group?: string,
  entry?: string
): TranslaasOfflineCacheMissException {
  if (entry && group) {
    return new TranslaasOfflineCacheMissException(
      `Translation entry '${entry}' in group '${group}' for project '${project}' and language '${language}' was not found in the offline cache.`,
      undefined,
      project,
      language
    );
  }
  if (group) {
    return new TranslaasOfflineCacheMissException(
      `Translation group '${group}' for project '${project}' and language '${language}' was not found in the offline cache.`,
      undefined,
      project,
      language
    );
  }
  return new TranslaasOfflineCacheMissException(
    `Project '${project}' for language '${language}' was not found in the offline cache.`,
    undefined,
    project,
    language
  );
}

/**
 * Decorator client that adds offline cache orchestration (CacheFirst / ApiFirst / CacheOnly).
 *
 * Offline plural resolution uses .NET-aligned one/other rules; substitution uses `{name}` only.
 */
export class CachingTranslaasClient implements ITranslaasClient {
  constructor(
    private readonly innerClient: ITranslaasClient,
    private readonly cacheProvider: IOfflineCacheProvider,
    private readonly options: OfflineCacheOptions,
    private readonly projectId: string
  ) {
    if (!innerClient) {
      throw new Error('innerClient is required');
    }
    if (!cacheProvider) {
      throw new Error('cacheProvider is required');
    }
    if (!options) {
      throw new Error('options is required');
    }
    if (!projectId || !projectId.trim()) {
      throw new Error('projectId is required');
    }
  }

  async getEntryAsync(
    group: string,
    entry: string,
    lang: string,
    number?: number,
    parameters?: Record<string, string>,
    projectOrCancellation?: string | AbortSignal,
    cancellationToken?: AbortSignal
  ): Promise<string> {
    const { cancel } = this.splitProjectAndCancel(projectOrCancellation, cancellationToken);
    const mode = this.options.fallbackMode ?? OfflineFallbackMode.ApiFirst;

    if (mode === OfflineFallbackMode.CacheFirst) {
      return this.getEntryCacheFirst(group, entry, lang, number, parameters, cancel);
    }
    if (mode === OfflineFallbackMode.ApiFirst) {
      return this.getEntryApiFirst(group, entry, lang, number, parameters, cancel);
    }
    if (mode === OfflineFallbackMode.CacheOnly) {
      return this.getEntryCacheOnly(group, entry, lang, number, parameters, cancel);
    }

    return this.innerClient.getEntryAsync(
      group,
      entry,
      lang,
      number,
      parameters,
      this.projectId,
      cancel
    );
  }

  async getGroupAsync(
    project: string,
    group: string,
    lang: string,
    format?: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup> {
    const mode = this.options.fallbackMode ?? OfflineFallbackMode.ApiFirst;

    if (mode === OfflineFallbackMode.CacheFirst) {
      return this.getGroupCacheFirst(project, group, lang, format, sdkQuery, cancellationToken);
    }
    if (mode === OfflineFallbackMode.ApiFirst) {
      return this.getGroupApiFirst(project, group, lang, format, sdkQuery, cancellationToken);
    }
    if (mode === OfflineFallbackMode.CacheOnly) {
      return this.getGroupCacheOnly(project, group, lang, cancellationToken);
    }

    return this.innerClient.getGroupAsync(
      project,
      group,
      lang,
      format,
      sdkQuery,
      cancellationToken
    );
  }

  async getProjectAsync(
    project: string,
    lang: string,
    format?: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject> {
    const mode = this.options.fallbackMode ?? OfflineFallbackMode.ApiFirst;

    if (mode === OfflineFallbackMode.CacheFirst) {
      return this.getProjectCacheFirst(project, lang, format, sdkQuery, cancellationToken);
    }
    if (mode === OfflineFallbackMode.ApiFirst) {
      return this.getProjectApiFirst(project, lang, format, sdkQuery, cancellationToken);
    }
    if (mode === OfflineFallbackMode.CacheOnly) {
      return this.getProjectCacheOnly(project, lang, cancellationToken);
    }

    return this.innerClient.getProjectAsync(project, lang, format, sdkQuery, cancellationToken);
  }

  async getProjectLocalesAsync(
    project: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<ProjectLocales> {
    const mode = this.options.fallbackMode ?? OfflineFallbackMode.ApiFirst;

    if (mode === OfflineFallbackMode.CacheFirst) {
      return this.getProjectLocalesCacheFirst(project, sdkQuery, cancellationToken);
    }
    if (mode === OfflineFallbackMode.ApiFirst) {
      return this.getProjectLocalesApiFirst(project, sdkQuery, cancellationToken);
    }
    if (mode === OfflineFallbackMode.CacheOnly) {
      return this.getProjectLocalesCacheOnly(project, cancellationToken);
    }

    return this.innerClient.getProjectLocalesAsync(project, sdkQuery, cancellationToken);
  }

  reportMissingKeysAsync(
    body: ReportMissingKeysRequestBody,
    cancellationToken?: AbortSignal
  ): Promise<void> {
    return this.innerClient.reportMissingKeysAsync(body, cancellationToken);
  }

  getOfflineCacheZipAsync(
    project: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<ArrayBuffer> {
    return this.innerClient.getOfflineCacheZipAsync(project, sdkQuery, cancellationToken);
  }

  validateApiKeyAsync(cancellationToken?: AbortSignal): Promise<ValidateApiKeyResponse> {
    return this.innerClient.validateApiKeyAsync(cancellationToken);
  }

  private splitProjectAndCancel(
    projectOrCancellation?: string | AbortSignal,
    cancellationToken?: AbortSignal
  ): { cancel?: AbortSignal } {
    if (projectOrCancellation === undefined) {
      return { cancel: cancellationToken };
    }
    if (typeof AbortSignal !== 'undefined' && projectOrCancellation instanceof AbortSignal) {
      return { cancel: projectOrCancellation };
    }
    return { cancel: cancellationToken };
  }

  private resolveEntryFromGroup(
    group: TranslationGroup | null,
    entry: string,
    number?: number,
    parameters?: Record<string, string>
  ): string | null {
    if (!group) {
      return null;
    }

    let template: string | null = null;

    if (group.hasPluralForms(entry)) {
      const category = determinePluralCategory(number);
      template = group.getPluralForm(entry, category);
      if (template == null && category !== PluralCategory.Other) {
        template = group.getPluralForm(entry, PluralCategory.Other);
      }
    } else {
      template = group.getValue(entry);
    }

    if (template == null) {
      return null;
    }

    return substituteParameters(template, parameters, number);
  }

  private async getEntryCacheFirst(
    group: string,
    entry: string,
    lang: string,
    number?: number,
    parameters?: Record<string, string>,
    cancellationToken?: AbortSignal
  ): Promise<string> {
    const cachedGroup = await this.cacheProvider.getGroupAsync(
      this.projectId,
      group,
      lang,
      cancellationToken
    );
    const resolved = this.resolveEntryFromGroup(cachedGroup, entry, number, parameters);
    if (resolved != null) {
      return resolved;
    }

    try {
      const result = await this.innerClient.getEntryAsync(
        group,
        entry,
        lang,
        number,
        parameters,
        this.projectId,
        cancellationToken
      );
      void this.updateGroupCache(this.projectId, group, lang, cancellationToken);
      return result;
    } catch (error) {
      if (isNetworkOrApiError(error)) {
        throw offlineCacheMiss(this.projectId, lang, group, entry);
      }
      throw error;
    }
  }

  private async getEntryApiFirst(
    group: string,
    entry: string,
    lang: string,
    number?: number,
    parameters?: Record<string, string>,
    cancellationToken?: AbortSignal
  ): Promise<string> {
    try {
      const result = await this.innerClient.getEntryAsync(
        group,
        entry,
        lang,
        number,
        parameters,
        this.projectId,
        cancellationToken
      );
      void this.updateGroupCache(this.projectId, group, lang, cancellationToken);
      return result;
    } catch (error) {
      if (!isNetworkOrApiError(error)) {
        throw error;
      }

      const cachedGroup = await this.cacheProvider.getGroupAsync(
        this.projectId,
        group,
        lang,
        cancellationToken
      );
      const resolved = this.resolveEntryFromGroup(cachedGroup, entry, number, parameters);
      if (resolved != null) {
        return resolved;
      }
      throw offlineCacheMiss(this.projectId, lang, group, entry);
    }
  }

  private async getEntryCacheOnly(
    group: string,
    entry: string,
    lang: string,
    number?: number,
    parameters?: Record<string, string>,
    cancellationToken?: AbortSignal
  ): Promise<string> {
    const cachedGroup = await this.cacheProvider.getGroupAsync(
      this.projectId,
      group,
      lang,
      cancellationToken
    );
    const resolved = this.resolveEntryFromGroup(cachedGroup, entry, number, parameters);
    if (resolved != null) {
      return resolved;
    }
    throw offlineCacheMiss(this.projectId, lang, group, entry);
  }

  private async getGroupCacheFirst(
    project: string,
    group: string,
    lang: string,
    format?: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup> {
    const cached = await this.cacheProvider.getGroupAsync(project, group, lang, cancellationToken);
    if (cached) {
      return cached;
    }

    try {
      const result = await this.innerClient.getGroupAsync(
        project,
        group,
        lang,
        format,
        sdkQuery,
        cancellationToken
      );
      void this.updateGroupCache(project, group, lang, cancellationToken);
      return result;
    } catch (error) {
      if (isNetworkOrApiError(error)) {
        throw offlineCacheMiss(project, lang, group);
      }
      throw error;
    }
  }

  private async getGroupApiFirst(
    project: string,
    group: string,
    lang: string,
    format?: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup> {
    try {
      const result = await this.innerClient.getGroupAsync(
        project,
        group,
        lang,
        format,
        sdkQuery,
        cancellationToken
      );
      void this.updateGroupCache(project, group, lang, cancellationToken);
      return result;
    } catch (error) {
      if (!isNetworkOrApiError(error)) {
        throw error;
      }
      const cached = await this.cacheProvider.getGroupAsync(
        project,
        group,
        lang,
        cancellationToken
      );
      if (cached) {
        return cached;
      }
      throw offlineCacheMiss(project, lang, group);
    }
  }

  private async getGroupCacheOnly(
    project: string,
    group: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup> {
    const cached = await this.cacheProvider.getGroupAsync(project, group, lang, cancellationToken);
    if (cached) {
      return cached;
    }
    throw offlineCacheMiss(project, lang, group);
  }

  private async getProjectCacheFirst(
    project: string,
    lang: string,
    format?: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject> {
    const cached = await this.cacheProvider.getProjectAsync(project, lang, cancellationToken);
    if (cached) {
      return cached;
    }

    try {
      const result = await this.innerClient.getProjectAsync(
        project,
        lang,
        format,
        sdkQuery,
        cancellationToken
      );
      await this.cacheProvider.saveProjectAsync(project, lang, result, cancellationToken);
      return result;
    } catch (error) {
      if (isNetworkOrApiError(error)) {
        throw offlineCacheMiss(project, lang);
      }
      throw error;
    }
  }

  private async getProjectApiFirst(
    project: string,
    lang: string,
    format?: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject> {
    try {
      const result = await this.innerClient.getProjectAsync(
        project,
        lang,
        format,
        sdkQuery,
        cancellationToken
      );
      await this.cacheProvider.saveProjectAsync(project, lang, result, cancellationToken);
      return result;
    } catch (error) {
      if (!isNetworkOrApiError(error)) {
        throw error;
      }
      const cached = await this.cacheProvider.getProjectAsync(project, lang, cancellationToken);
      if (cached) {
        return cached;
      }
      throw offlineCacheMiss(project, lang);
    }
  }

  private async getProjectCacheOnly(
    project: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject> {
    const cached = await this.cacheProvider.getProjectAsync(project, lang, cancellationToken);
    if (cached) {
      return cached;
    }
    throw offlineCacheMiss(project, lang);
  }

  private async getProjectLocalesCacheOnly(
    project: string,
    cancellationToken?: AbortSignal
  ): Promise<ProjectLocales> {
    const cached = await this.cacheProvider.getProjectLocalesAsync(project, cancellationToken);
    if (cached?.locales?.length) {
      return cached;
    }
    throw new TranslaasOfflineCacheException(
      `Project locales for '${project}' were not found in the offline cache.`,
      undefined,
      project
    );
  }

  private async getProjectLocalesCacheFirst(
    project: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<ProjectLocales> {
    const cached = await this.cacheProvider.getProjectLocalesAsync(project, cancellationToken);
    if (cached?.locales?.length) {
      return cached;
    }

    try {
      return await this.innerClient.getProjectLocalesAsync(project, sdkQuery, cancellationToken);
    } catch (error) {
      if (isNetworkOrApiError(error)) {
        throw offlineCacheMiss(project, '*');
      }
      throw error;
    }
  }

  private async getProjectLocalesApiFirst(
    project: string,
    sdkQuery?: SdkTranslationQueryParams,
    cancellationToken?: AbortSignal
  ): Promise<ProjectLocales> {
    try {
      return await this.innerClient.getProjectLocalesAsync(project, sdkQuery, cancellationToken);
    } catch (error) {
      if (!isNetworkOrApiError(error)) {
        throw error;
      }

      const cached = await this.cacheProvider.getProjectLocalesAsync(project, cancellationToken);
      if (cached?.locales?.length) {
        return cached;
      }
      throw offlineCacheMiss(project, '*');
    }
  }

  private async updateGroupCache(
    project: string,
    group: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<void> {
    try {
      const groupData = await this.innerClient.getGroupAsync(
        project,
        group,
        lang,
        undefined,
        undefined,
        cancellationToken
      );
      const existing = await this.cacheProvider.getProjectAsync(project, lang, cancellationToken);
      const projectToSave = existing ?? new TranslationProject();
      projectToSave.groups[group] = { ...groupData.entries };
      await this.cacheProvider.saveProjectAsync(project, lang, projectToSave, cancellationToken);
    } catch {
      // Best-effort cache refresh; ignore failures.
    }
  }
}
