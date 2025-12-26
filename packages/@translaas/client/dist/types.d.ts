export interface ITranslaasClient {
    getEntryAsync(group: string, entry: string, lang: string, number?: number, parameters?: Record<string, string>, cancellationToken?: AbortSignal): Promise<string>;
    getGroupAsync(project: string, group: string, lang: string, format?: string, cancellationToken?: AbortSignal): Promise<any>;
    getProjectAsync(project: string, lang: string, format?: string, cancellationToken?: AbortSignal): Promise<any>;
    getProjectLocalesAsync(project: string, cancellationToken?: AbortSignal): Promise<any>;
}
//# sourceMappingURL=types.d.ts.map