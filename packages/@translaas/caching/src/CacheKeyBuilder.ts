/**
 * Utility class for building consistent cache keys across the SDK.
 * Ensures cache keys follow a standardized format and are URL-safe.
 *
 * Key format: `{type}:{params}:{lang}`
 * - Entry: `entry:{group}:{entry}:{lang}`
 * - Group: `group:{project}:{group}:{lang}`
 * - Project: `project:{project}:{lang}`
 * - Group Locales: `group-locales:{project}:{group}`
 * - Project Locales: `project-locales:{project}`
 *
 * @example
 * ```typescript
 * const entryKey = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'en');
 * // Returns: "entry:common:welcome:en"
 *
 * const groupKey = CacheKeyBuilder.buildGroupKey('my-project', 'common', 'en');
 * // Returns: "group:my-project:common:en"
 * ```
 */
export class CacheKeyBuilder {
  /**
   * Builds a cache key for a translation entry.
   *
   * @param group - Group name
   * @param entry - Entry name
   * @param lang - Language code
   * @returns Cache key in format: `entry:{group}:{entry}:{lang}`
   * @throws Error if any parameter is empty
   */
  static buildEntryKey(group: string, entry: string, lang: string): string {
    this.validateNonEmpty(group, 'group');
    this.validateNonEmpty(entry, 'entry');
    this.validateNonEmpty(lang, 'lang');

    return `entry:${group}:${entry}:${lang}`;
  }

  /**
   * Builds a cache key for a translation group.
   *
   * @param project - Project identifier
   * @param group - Group name
   * @param lang - Language code
   * @returns Cache key in format: `group:{project}:{group}:{lang}`
   * @throws Error if any parameter is empty
   */
  static buildGroupKey(project: string, group: string, lang: string): string {
    this.validateNonEmpty(project, 'project');
    this.validateNonEmpty(group, 'group');
    this.validateNonEmpty(lang, 'lang');

    return `group:${project}:${group}:${lang}`;
  }

  /**
   * Builds a cache key for a translation project.
   *
   * @param project - Project identifier
   * @param lang - Language code
   * @returns Cache key in format: `project:{project}:{lang}`
   * @throws Error if any parameter is empty
   */
  static buildProjectKey(project: string, lang: string): string {
    this.validateNonEmpty(project, 'project');
    this.validateNonEmpty(lang, 'lang');

    return `project:${project}:${lang}`;
  }

  /**
   * Builds a cache key for group locales.
   *
   * @param project - Project identifier
   * @param group - Group name
   * @returns Cache key in format: `group-locales:{project}:{group}`
   * @throws Error if any parameter is empty
   */
  static buildGroupLocalesKey(project: string, group: string): string {
    this.validateNonEmpty(project, 'project');
    this.validateNonEmpty(group, 'group');

    return `group-locales:${project}:${group}`;
  }

  /**
   * Builds a cache key for project locales.
   *
   * @param project - Project identifier
   * @returns Cache key in format: `project-locales:{project}`
   * @throws Error if project is empty
   */
  static buildProjectLocalesKey(project: string): string {
    this.validateNonEmpty(project, 'project');

    return `project-locales:${project}`;
  }

  /**
   * Validates that a string parameter is non-empty.
   *
   * @param value - Value to validate
   * @param paramName - Parameter name for error message
   * @throws Error if value is empty or whitespace
   */
  private static validateNonEmpty(value: string, paramName: string): void {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`${paramName} must be a non-empty string`);
    }
  }
}
