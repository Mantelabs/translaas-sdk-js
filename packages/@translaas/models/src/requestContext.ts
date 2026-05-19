/**
 * Per-request SDK context (query params, conditional GET, response metadata).
 * Mirrors .NET `TranslaasRequestContext`; the client mutates response fields after each call.
 */
export interface TranslaasRequestContext {
  /** Release channel query (`stable`, `beta`, `canary`). */
  channel?: string;
  /** Pinned snapshot ULID query (`v`). */
  v?: string;
  /** Context metadata for group/project/offline payloads. */
  includeContext?: boolean;
  /** Project id/slug for `GET …/text` when the API key is not project-scoped. */
  project?: string;
  /** Weak ETag for conditional GET (`If-None-Match` header). */
  ifNoneMatch?: string;
  /** ETag from the last response (`ETag` header), set by the client. */
  responseEtag?: string;
  /** True when the last response was `304 Not Modified`. */
  notModified?: boolean;
}

/** Query-only subset used in {@link TranslaasOptions.defaultSdkQuery}. */
export type SdkTranslationQueryParams = Pick<
  TranslaasRequestContext,
  'channel' | 'v' | 'includeContext'
>;

/**
 * Result of `GET …/offline-cache` (ZIP download with metadata).
 */
export interface OfflineCacheDownloadResult {
  content: ArrayBuffer | null;
  suggestedFileName?: string;
  responseEtag?: string;
  notModified: boolean;
}

/**
 * Resets response fields before a request (matches .NET `PrepareRequestContext`).
 */
export function prepareRequestContext(context?: TranslaasRequestContext): void {
  if (!context) {
    return;
  }
  context.notModified = false;
  context.responseEtag = undefined;
}

/**
 * Copies response cache headers into the context object.
 */
export function assignResponseContext(
  response: { headers: { get(name: string): string | null } },
  context?: TranslaasRequestContext,
  notModified?: boolean
): void {
  if (!context) {
    return;
  }
  const etag = response.headers?.get('etag') ?? null;
  if (etag) {
    context.responseEtag = etag;
  }
  if (notModified === true) {
    context.notModified = true;
  }
}
