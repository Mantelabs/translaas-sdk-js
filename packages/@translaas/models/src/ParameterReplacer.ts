/**
 * ParameterReplacer utility class that replaces placeholders in translation strings
 * with actual parameter values. Supports multiple placeholder formats for compatibility
 * with different translation systems.
 *
 * Supported formats (in order of preference):
 * - `{{name}}` - Preferred format (double curly braces)
 * - `{name}` - Fallback format (single curly braces)
 * - `%name%` - Legacy format (percent signs)
 *
 * @example
 * ```typescript
 * ParameterReplacer.replace('Hello {{name}}!', { name: 'World' }); // 'Hello World!'
 * ParameterReplacer.replace('Hello {name}!', { name: 'World' }); // 'Hello World!'
 * ParameterReplacer.replace('Hello %name%!', { name: 'World' }); // 'Hello World!'
 * ParameterReplacer.replace('Count: {{count}} items', { count: 5 }); // 'Count: 5 items'
 * ```
 */
export class ParameterReplacer {
  /**
   * Escapes special regex characters in a string to make it safe for use in regex patterns
   * @param str String to escape
   * @returns Escaped string safe for regex
   */
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Converts a parameter value to a string for replacement.
   * Numbers are converted to strings, null/undefined are converted to empty strings.
   * @param value Parameter value (string, number, null, or undefined)
   * @returns String representation of the value
   */
  private static convertValueToString(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'number') {
      return String(value);
    }
    return value;
  }

  /**
   * Replaces placeholders in a translation string with actual parameter values.
   * Supports multiple placeholder formats: {{name}}, {name}, and %name%.
   *
   * Replacement order (important to avoid conflicts):
   * 1. {{name}} format (double curly braces) - preferred
   * 2. {name} format (single curly braces) - fallback
   * 3. %name% format (percent signs) - legacy
   *
   * @param text Translation string containing placeholders
   * @param parameters Object containing parameter values keyed by parameter name.
   *                   Values can be strings or numbers (numbers are automatically converted to strings).
   *                   Null/undefined values are converted to empty strings.
   * @returns String with placeholders replaced by parameter values
   *
   * @example
   * ```typescript
   * // Basic replacement
   * ParameterReplacer.replace('Hello {{name}}!', { name: 'World' });
   * // Returns: 'Hello World!'
   *
   * // Numeric values (quantity/count parameters)
   * ParameterReplacer.replace('Count: {{count}} items', { count: 5 });
   * // Returns: 'Count: 5 items'
   *
   * // Multiple occurrences
   * ParameterReplacer.replace('{{greeting}}, {{name}}!', { greeting: 'Hi', name: 'Alice' });
   * // Returns: 'Hi, Alice!'
   *
   * // Multiple formats (order matters)
   * ParameterReplacer.replace('{{a}} {b} %c%', { a: 1, b: '2', c: 3 });
   * // Returns: '1 2 3'
   *
   * // Empty parameters returns original text
   * ParameterReplacer.replace('Hello {{name}}!', {});
   * // Returns: 'Hello {{name}}!'
   *
   * // Special characters in placeholders are escaped
   * ParameterReplacer.replace('Price: {{price}}', { price: '$10.99' });
   * // Returns: 'Price: $10.99'
   * ```
   */
  static replace(
    text: string,
    parameters: Record<string, string | number | null | undefined> = {}
  ): string {
    // Early return if no parameters provided
    if (!parameters || Object.keys(parameters).length === 0) {
      return text;
    }

    let result = text;

    // Replace {{name}} format first (preferred, double curly braces)
    // This must be done first to avoid conflicts with {name} format
    for (const [key, value] of Object.entries(parameters)) {
      const escapedKey = this.escapeRegex(key);
      const stringValue = this.convertValueToString(value);
      const pattern = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g');
      result = result.replace(pattern, stringValue);
    }

    // Replace {name} format second (fallback, single curly braces)
    // Only replace if not already part of {{name}} format
    for (const [key, value] of Object.entries(parameters)) {
      const escapedKey = this.escapeRegex(key);
      const stringValue = this.convertValueToString(value);
      // Match {name} but not {{name}} - use negative lookbehind and lookahead
      const pattern = new RegExp(`(?<!\\{)\\{${escapedKey}\\}(?!\\})`, 'g');
      result = result.replace(pattern, stringValue);
    }

    // Replace %name% format third (legacy, percent signs)
    for (const [key, value] of Object.entries(parameters)) {
      const escapedKey = this.escapeRegex(key);
      const stringValue = this.convertValueToString(value);
      const pattern = new RegExp(`%${escapedKey}%`, 'g');
      result = result.replace(pattern, stringValue);
    }

    return result;
  }
}
