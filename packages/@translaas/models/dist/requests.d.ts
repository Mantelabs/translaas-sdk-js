export interface GetTranslationRequest {
    group: string;
    entry: string;
    lang: string;
    n?: number;
    [key: string]: string | number | undefined;
}
export interface GetGroupTranslationsRequest {
    project: string;
    group: string;
    lang: string;
    format?: string;
}
export interface GetProjectTranslationsRequest {
    project: string;
    lang: string;
    format?: string;
}
export interface GetProjectLocalesRequest {
    project: string;
}
//# sourceMappingURL=requests.d.ts.map