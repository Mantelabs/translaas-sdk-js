export interface ILanguageProvider {
    getLanguageAsync(): Promise<string | null>;
}
export interface ILanguageResolver {
    resolveLanguageAsync(): Promise<string | null>;
}
//# sourceMappingURL=types.d.ts.map