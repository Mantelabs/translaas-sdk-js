export interface IOfflineCacheProvider {
    getProjectAsync(project: string, lang: string, cancellationToken?: AbortSignal): Promise<any | null>;
    getGroupAsync(project: string, group: string, lang: string, cancellationToken?: AbortSignal): Promise<any | null>;
    saveProjectAsync(project: string, lang: string, data: any, cancellationToken?: AbortSignal): Promise<void>;
    isCachedAsync(project: string, lang: string, cancellationToken?: AbortSignal): Promise<boolean>;
    clearAllAsync(cancellationToken?: AbortSignal): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map