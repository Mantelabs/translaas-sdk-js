import type { TranslationGroup, TranslationProject, ProjectLocales } from '@translaas/models';

/**
 * Translaas client interface
 */
export interface ITranslaasClient {
  getEntryAsync(
    group: string,
    entry: string,
    lang: string,
    number?: number,
    parameters?: Record<string, string>,
    cancellationToken?: AbortSignal
  ): Promise<string>;

  getGroupAsync(
    project: string,
    group: string,
    lang: string,
    format?: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup>;

  getProjectAsync(
    project: string,
    lang: string,
    format?: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject>;

  getProjectLocalesAsync(project: string, cancellationToken?: AbortSignal): Promise<ProjectLocales>;
}
