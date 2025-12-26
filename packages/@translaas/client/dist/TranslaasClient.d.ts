import type { ITranslaasClient } from './types';
import type { TranslaasOptions } from '@translaas/models';
export declare class TranslaasClient implements ITranslaasClient {
    private options;
    constructor(options: TranslaasOptions);
    getEntryAsync(group: string, entry: string, lang: string, number?: number, parameters?: Record<string, string>, cancellationToken?: AbortSignal): Promise<string>;
    getGroupAsync(project: string, group: string, lang: string, format?: string, cancellationToken?: AbortSignal): Promise<any>;
    getProjectAsync(project: string, lang: string, format?: string, cancellationToken?: AbortSignal): Promise<any>;
    getProjectLocalesAsync(project: string, cancellationToken?: AbortSignal): Promise<any>;
}
//# sourceMappingURL=TranslaasClient.d.ts.map