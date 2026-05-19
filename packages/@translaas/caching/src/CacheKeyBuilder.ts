export interface CacheSnapshotOptions {
  project?: string;
  channel?: string;
  version?: string;
  includeContext?: boolean;
}

/**
 * Utility class for building consistent cache keys across the SDK.
 * Algorithm aligned with .NET `CacheKeyBuilder`.
 */
export class CacheKeyBuilder {
  private static readonly separator = ':';

  static buildEntryKey(
    group: string,
    entry: string,
    lang: string,
    number?: number,
    parameters?: Record<string, string>,
    snapshot?: CacheSnapshotOptions
  ): string {
    this.validateNonEmpty(group, 'group');
    this.validateNonEmpty(entry, 'entry');
    this.validateNonEmpty(lang, 'lang');

    let key = `entry${this.separator}${group}${this.separator}${entry}${this.separator}${lang}`;

    if (number !== undefined && number !== null) {
      key += `${this.separator}${number.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })}`;
    }

    if (parameters && Object.keys(parameters).length > 0) {
      const sorted = Object.entries(parameters)
        .filter(([k, v]) => k && v != null)
        .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: 'accent' }));
      for (const [paramKey, value] of sorted) {
        key += `${this.separator}${paramKey.toLowerCase()}=${value}`;
      }
    }

    return this.appendSnapshotSuffix(key, snapshot, true);
  }

  static buildGroupKey(
    project: string,
    group: string,
    lang: string,
    format?: string,
    snapshot?: CacheSnapshotOptions
  ): string {
    this.validateNonEmpty(project, 'project');
    this.validateNonEmpty(group, 'group');
    this.validateNonEmpty(lang, 'lang');

    let key = `group${this.separator}${project}${this.separator}${group}${this.separator}${lang}`;
    if (format && format.trim()) {
      key += `${this.separator}${format}`;
    }
    return this.appendSnapshotSuffix(key, snapshot, false);
  }

  static buildProjectKey(
    project: string,
    lang: string,
    format?: string,
    snapshot?: CacheSnapshotOptions
  ): string {
    this.validateNonEmpty(project, 'project');
    this.validateNonEmpty(lang, 'lang');

    let key = `project${this.separator}${project}${this.separator}${lang}`;
    if (format && format.trim()) {
      key += `${this.separator}${format}`;
    }
    return this.appendSnapshotSuffix(key, snapshot, false);
  }

  /** .NET-aligned locales key (`locales:{project}`). */
  static buildLocalesKey(
    project: string,
    snapshot?: Pick<CacheSnapshotOptions, 'channel' | 'version'>
  ): string {
    this.validateNonEmpty(project, 'project');
    const key = `locales${this.separator}${project}`;
    return this.appendSnapshotSuffix(key, snapshot, false);
  }

  /** @deprecated Use {@link buildLocalesKey} — kept for backward compatibility. */
  static buildProjectLocalesKey(
    project: string,
    snapshot?: Pick<CacheSnapshotOptions, 'channel' | 'version'>
  ): string {
    return this.buildLocalesKey(project, snapshot);
  }

  static buildOfflineCacheKey(project: string, snapshot?: CacheSnapshotOptions): string {
    this.validateNonEmpty(project, 'project');
    const key = `offline${this.separator}${project}`;
    return this.appendSnapshotSuffix(key, snapshot, false);
  }

  static buildGroupLocalesKey(project: string, group: string): string {
    this.validateNonEmpty(project, 'project');
    this.validateNonEmpty(group, 'group');
    return `group-locales${this.separator}${project}${this.separator}${group}`;
  }

  private static appendSnapshotSuffix(
    key: string,
    snapshot: CacheSnapshotOptions | Pick<CacheSnapshotOptions, 'channel' | 'version'> | undefined,
    includeProjectOnEntry: boolean
  ): string {
    if (!snapshot) {
      return key;
    }
    let result = key;
    if (includeProjectOnEntry && 'project' in snapshot && snapshot.project) {
      result += `${this.separator}proj=${snapshot.project}`;
    }
    if (snapshot.channel) {
      result += `${this.separator}ch=${snapshot.channel}`;
    }
    if (snapshot.version) {
      result += `${this.separator}v=${snapshot.version}`;
    }
    if ('includeContext' in snapshot && snapshot.includeContext !== undefined) {
      result += `${this.separator}ic=${snapshot.includeContext ? '1' : '0'}`;
    }
    return result;
  }

  private static validateNonEmpty(value: string, paramName: string): void {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`${paramName} must be a non-empty string`);
    }
  }
}
