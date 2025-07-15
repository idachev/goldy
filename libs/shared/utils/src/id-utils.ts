import { v4 as uuidv4 } from 'uuid';
import * as base32 from 'hi-base32';

export class IDUtils {
  public static readonly DEFAULT_MAX_ID_SIZE = 128;
  public static readonly REGEXP_MATCH_VALID_ID = /^[a-zA-Z0-9_-]+$/;

  private constructor() {
    throw new Error('Utility class');
  }

  /**
   * Generate a random UUID and convert to Base32 (lowercase)
   */
  public static uuidToBase32RandomLowerCase(): string {
    return this.uuidToBase32Random().toLowerCase();
  }

  /**
   * Generate a random UUID and convert to Base32 (uppercase)
   */
  public static uuidToBase32Random(): string {
    return this.uuidToBase32(uuidv4());
  }

  /**
   * Convert Base32 string back to UUID
   */
  public static base32ToUuid(base32Uuid: string): string {
    if (!base32Uuid) {
      throw new Error('base32Uuid cannot be null or empty');
    }

    try {
      const bytes = base32.decode(base32Uuid.toUpperCase());
      return this.byteArrayToUuid(new Uint8Array(bytes));
    } catch (error) {
      throw new Error(`Invalid Base32 UUID: ${base32Uuid}`);
    }
  }

  /**
   * Convert UUID to Base32 string
   */
  public static uuidToBase32(uuid: string): string {
    if (!uuid) {
      throw new Error('uuid cannot be null or empty');
    }

    try {
      const bytes = this.uuidToByteArray(uuid);
      return base32.encode(bytes).replace(/=/g, '').toUpperCase();
    } catch (error) {
      throw new Error(`Invalid UUID: ${uuid}`);
    }
  }

  /**
   * Convert UUID string to byte array
   */
  public static uuidToByteArray(uuid: string): Uint8Array {
    if (!uuid) {
      throw new Error('uuid cannot be null or empty');
    }

    // Remove hyphens and validate UUID format
    const cleanUuid = uuid.replace(/-/g, '');
    if (cleanUuid.length !== 32 || !/^[0-9a-fA-F]+$/.test(cleanUuid)) {
      throw new Error(`Invalid UUID format: ${uuid}`);
    }

    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      bytes[i] = parseInt(cleanUuid.substr(i * 2, 2), 16);
    }

    return bytes;
  }

  /**
   * Convert byte array to UUID string
   */
  public static byteArrayToUuid(bytes: Uint8Array): string {
    if (!bytes || bytes.length !== 16) {
      throw new Error('bytes must be a 16-byte array');
    }

    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return [
      hex.substr(0, 8),
      hex.substr(8, 4),
      hex.substr(12, 4),
      hex.substr(16, 4),
      hex.substr(20, 12),
    ].join('-');
  }

  /**
   * Validate if a string is a valid ID
   */
  public static isValidId(id: string, expectedMaxSize: number = this.DEFAULT_MAX_ID_SIZE): boolean {
    return id != null && 
           id.length > 0 && 
           id.length <= expectedMaxSize && 
           this.REGEXP_MATCH_VALID_ID.test(id);
  }

  /**
   * Generate a random UUID
   */
  public static generateUuid(): string {
    return uuidv4();
  }

  /**
   * Validate if a string is a valid UUID format
   */
  public static isValidUuid(uuid: string): boolean {
    if (!uuid) return false;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Generate a short ID (Base32 encoded UUID without padding)
   */
  public static generateShortId(): string {
    return this.uuidToBase32RandomLowerCase();
  }

}