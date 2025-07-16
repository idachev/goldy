export class StringUtils {
  public static readonly MAX_VALUE_CHARS_IN_TO_STRING = 128;

  private constructor() {
    throw new Error('Utility class');
  }

  /**
   * Hide string by showing only first and last characters with length info
   * Example: "sensitive123" with showChars=2 becomes "se...11...23"
   */
  public static hideString(value: string, showChars: number = 1): string {
    if (showChars <= 0) {
      showChars = 1;
    }

    if (!value || value.length <= 2 * showChars) {
      return value;
    }

    return (
      value.substring(0, showChars) +
      '...' +
      value.length +
      '...' +
      value.substring(value.length - showChars)
    );
  }

  /**
   * Truncate value if it exceeds maximum length
   */
  public static truncateValue(value: string): string {
    return value && value.length > this.MAX_VALUE_CHARS_IN_TO_STRING
      ? value.substring(0, this.MAX_VALUE_CHARS_IN_TO_STRING) + '...'
      : value;
  }

  /**
   * Convert string to UUID, returns null if invalid
   */
  public static toUuid(value: string): string | null {
    if (!value?.trim()) {
      return null;
    }

    try {
      // Basic UUID validation
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(value) ? value : null;
    } catch {
      return null;
    }
  }

  /**
   * Convert array of UUID strings to UUIDs, filtering out invalid ones
   */
  public static toUuids(uuidStrings: string[]): string[] {
    if (!uuidStrings?.length) {
      return [];
    }

    return uuidStrings
      .map((str) => this.toUuid(str))
      .filter((uuid) => uuid !== null) as string[];
  }

  /**
   * Create full name from first and last name
   */
  public static toFullName(firstName?: string, lastName?: string): string {
    const first = this.trimToEmpty(firstName);
    const last = this.trimToEmpty(lastName);

    if (!last) {
      return first;
    }

    if (!first) {
      return last;
    }

    return `${first} ${last}`;
  }

  /**
   * Format email with full name
   */
  public static toEmail(
    email: string,
    firstName?: string,
    lastName?: string
  ): string {
    const fullName = this.toFullName(firstName, lastName);
    return fullName ? `${fullName} <${email}>` : email;
  }

  /**
   * Remove non-printable characters from text
   */
  public static removeNonPrintableCharacters(text: string): string {
    if (!text) {
      return text;
    }

    // Remove non-printable characters and replacement character
    return text
      .replace(/[^\p{L}\p{M}\p{N}\p{P}\p{Z}\s]/gu, '')
      .replace(/�/g, '');
  }

  /**
   * Filter out blank strings from collection
   */
  public static filterNotBlank(strings: string[]): string[] {
    if (!strings) {
      return [];
    }

    return [
      ...new Set(
        strings.map((s) => this.trimToEmpty(s)).filter((s) => s.length > 0)
      ),
    ];
  }

  /**
   * Convert text to simple path name (safe for file systems)
   */
  public static toSimplePathName(text: string): string {
    if (!text) {
      return text;
    }

    return this.removeNonPrintableCharacters(text.trim())
      .replace(/[^A-Za-z0-9-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  /**
   * Concatenate non-empty strings with space separator
   */
  public static concatNotEmpty(...strings: string[]): string {
    return strings
      .map((s) => this.trimToEmpty(s))
      .filter((s) => s.length > 0)
      .join(' ');
  }

  /**
   * Trim string to empty (never returns null/undefined)
   */
  public static trimToEmpty(value?: string | null): string {
    return (value ?? '').trim();
  }

  /**
   * Trim string to null (returns null if empty after trim)
   */
  public static trimToNull(value?: string | null): string | null {
    const trimmed = this.trimToEmpty(value);
    return trimmed.length > 0 ? trimmed : null;
  }

  /**
   * Check if string is empty (null, undefined, or empty after trim)
   */
  public static isEmpty(value?: string | null): boolean {
    return this.trimToEmpty(value).length === 0;
  }

  /**
   * Check if string is not empty
   */
  public static isNotEmpty(value?: string | null): boolean {
    return !this.isEmpty(value);
  }
}
