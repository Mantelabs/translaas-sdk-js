import type {
  TranslationGroup,
  TranslationProject,
  ProjectLocales,
  TranslaasRequestContext,
  OfflineCacheDownloadResult,
  ReportMissingKeysRequestBody,
  ValidateApiKeyResponse,
} from '@translaas/models';

/**
 * Translaas client interface for interacting with the Translaas Translation Delivery API.
 *
 * This interface defines the contract for all Translaas client implementations.
 * Use {@link TranslaasClient} for the standard implementation.
 */
export interface ITranslaasClient {
  /**
   * Gets a single translation entry as plain text.
   *
   * If the 6th argument is an {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}, it is treated as the cancellation token
   * (omit `project` in that position). If it is a {@link TranslaasRequestContext}, conditional GET and snapshot query params are applied.
   * Otherwise the 6th argument is an explicit `project` query value; `defaultProjectId` on the options passed to {@link TranslaasClient} is used when omitted.
   */
  getEntryAsync(
    group: string,
    entry: string,
    lang: string,
    number?: number,
    parameters?: Record<string, string>,
    projectOrContextOrCancellation?: string | TranslaasRequestContext | AbortSignal,
    cancellationToken?: AbortSignal
  ): Promise<string>;

  getGroupAsync(
    project: string,
    group: string,
    lang: string,
    format?: string,
    sdkQuery?: TranslaasRequestContext,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup>;

  getProjectAsync(
    project: string,
    lang: string,
    format?: string,
    sdkQuery?: TranslaasRequestContext,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject>;

  getProjectLocalesAsync(
    project: string,
    sdkQuery?: TranslaasRequestContext,
    cancellationToken?: AbortSignal
  ): Promise<ProjectLocales>;

  reportMissingKeysAsync(
    body: ReportMissingKeysRequestBody,
    cancellationToken?: AbortSignal
  ): Promise<void>;

  getOfflineCacheAsync(
    project: string,
    sdkQuery?: TranslaasRequestContext,
    cancellationToken?: AbortSignal
  ): Promise<OfflineCacheDownloadResult>;

  getOfflineCacheZipAsync(
    project: string,
    sdkQuery?: TranslaasRequestContext,
    cancellationToken?: AbortSignal
  ): Promise<ArrayBuffer>;

  validateApiKeyAsync(cancellationToken?: AbortSignal): Promise<ValidateApiKeyResponse>;
}
