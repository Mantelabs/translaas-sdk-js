export class TranslaasClient {
    constructor(options) {
        this.options = options;
        void this.options;
    }
    async getEntryAsync(group, entry, lang, number, parameters, cancellationToken) {
        void { group, entry, lang, number, parameters, cancellationToken };
        throw new Error('Not implemented');
    }
    async getGroupAsync(project, group, lang, format, cancellationToken) {
        void { project, group, lang, format, cancellationToken };
        throw new Error('Not implemented');
    }
    async getProjectAsync(project, lang, format, cancellationToken) {
        void { project, lang, format, cancellationToken };
        throw new Error('Not implemented');
    }
    async getProjectLocalesAsync(project, cancellationToken) {
        void { project, cancellationToken };
        throw new Error('Not implemented');
    }
}
//# sourceMappingURL=TranslaasClient.js.map