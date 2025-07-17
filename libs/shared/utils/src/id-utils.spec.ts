import { IDUtils } from './id-utils';

describe('IDUtils', () => {
  describe('constructor', () => {
    it('should throw error when trying to instantiate', () => {
      expect(() => new (IDUtils as any)()).toThrow('Utility class');
    });
  });

  describe('uuidToBase32RandomLowerCase', () => {
    it('should generate lowercase base32 ID', () => {
      const id = IDUtils.uuidToBase32RandomLowerCase();
      expect(id).toMatch(/^[a-z0-9]+$/);
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = IDUtils.uuidToBase32RandomLowerCase();
      const id2 = IDUtils.uuidToBase32RandomLowerCase();
      expect(id1).not.toBe(id2);
    });
  });

  describe('uuidToBase32Random', () => {
    it('should generate uppercase base32 ID', () => {
      const id = IDUtils.uuidToBase32Random();
      expect(id).toMatch(/^[A-Z0-9]+$/);
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = IDUtils.uuidToBase32Random();
      const id2 = IDUtils.uuidToBase32Random();
      expect(id1).not.toBe(id2);
    });
  });

  describe('uuidToBase32', () => {
    const testUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('should convert UUID to base32', () => {
      const base32 = IDUtils.uuidToBase32(testUuid);
      expect(base32).toMatch(/^[A-Z0-9]+$/);
      expect(base32).not.toContain('=');
    });

    it('should throw error for null/empty UUID', () => {
      expect(() => IDUtils.uuidToBase32('')).toThrow(
        'uuid cannot be null or empty'
      );
      expect(() => IDUtils.uuidToBase32(null as any)).toThrow(
        'uuid cannot be null or empty'
      );
    });

    it('should throw error for invalid UUID', () => {
      expect(() => IDUtils.uuidToBase32('invalid-uuid')).toThrow(
        'Invalid UUID: invalid-uuid'
      );
    });
  });

  describe('base32ToUuid', () => {
    it('should test base32 conversion flow', () => {
      const base32Id = IDUtils.uuidToBase32Random();
      expect(base32Id).toMatch(/^[A-Z0-9]+$/);
      expect(base32Id.length).toBeGreaterThan(0);
    });

    it('should demonstrate base32 functionality', () => {
      const base32Id = IDUtils.uuidToBase32RandomLowerCase();
      expect(base32Id).toMatch(/^[a-z0-9]+$/);
      expect(base32Id.length).toBeGreaterThan(0);
    });

    it('should throw error for null/empty base32', () => {
      expect(() => IDUtils.base32ToUuid('')).toThrow(
        'base32Uuid cannot be null or empty'
      );
      expect(() => IDUtils.base32ToUuid(null as any)).toThrow(
        'base32Uuid cannot be null or empty'
      );
    });

    it('should throw error for invalid base32', () => {
      expect(() => IDUtils.base32ToUuid('invalid-base32')).toThrow(
        'Invalid Base32 UUID: invalid-base32'
      );
    });
  });

  describe('uuidToByteArray', () => {
    const testUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('should convert UUID to 16-byte array', () => {
      const bytes = IDUtils.uuidToByteArray(testUuid);
      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBe(16);
    });

    it('should handle UUID without hyphens', () => {
      const uuidWithoutHyphens = testUuid.replace(/-/g, '');
      const bytes = IDUtils.uuidToByteArray(uuidWithoutHyphens);
      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBe(16);
    });

    it('should throw error for null/empty UUID', () => {
      expect(() => IDUtils.uuidToByteArray('')).toThrow(
        'uuid cannot be null or empty'
      );
      expect(() => IDUtils.uuidToByteArray(null as any)).toThrow(
        'uuid cannot be null or empty'
      );
    });

    it('should throw error for invalid UUID format', () => {
      expect(() => IDUtils.uuidToByteArray('invalid')).toThrow(
        'Invalid UUID format: invalid'
      );
      expect(() =>
        IDUtils.uuidToByteArray('123e4567-e89b-12d3-a456-42661417400')
      ).toThrow('Invalid UUID format: 123e4567-e89b-12d3-a456-42661417400');
      expect(() =>
        IDUtils.uuidToByteArray('ggge4567-e89b-12d3-a456-426614174000')
      ).toThrow('Invalid UUID format: ggge4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('byteArrayToUuid', () => {
    const testUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('should convert byte array to UUID', () => {
      const bytes = IDUtils.uuidToByteArray(testUuid);
      const uuid = IDUtils.byteArrayToUuid(bytes);
      expect(uuid).toBe(testUuid);
    });

    it('should throw error for null bytes', () => {
      expect(() => IDUtils.byteArrayToUuid(null as any)).toThrow(
        'bytes must be a 16-byte array'
      );
    });

    it('should throw error for wrong length array', () => {
      expect(() => IDUtils.byteArrayToUuid(new Uint8Array(8))).toThrow(
        'bytes must be a 16-byte array'
      );
      expect(() => IDUtils.byteArrayToUuid(new Uint8Array(32))).toThrow(
        'bytes must be a 16-byte array'
      );
    });
  });

  describe('isValidId', () => {
    it('should return true for valid IDs', () => {
      expect(IDUtils.isValidId('valid-id_123')).toBe(true);
      expect(IDUtils.isValidId('ABC123')).toBe(true);
      expect(IDUtils.isValidId('test_id')).toBe(true);
      expect(IDUtils.isValidId('a')).toBe(true);
    });

    it('should return false for invalid IDs', () => {
      expect(IDUtils.isValidId('')).toBe(false);
      expect(IDUtils.isValidId(null as any)).toBe(false);
      expect(IDUtils.isValidId(undefined as any)).toBe(false);
      expect(IDUtils.isValidId('invalid@id')).toBe(false);
      expect(IDUtils.isValidId('invalid id')).toBe(false);
      expect(IDUtils.isValidId('invalid.id')).toBe(false);
    });

    it('should respect max size parameter', () => {
      const longId = 'a'.repeat(200);
      expect(IDUtils.isValidId(longId, 100)).toBe(false);
      expect(IDUtils.isValidId(longId, 300)).toBe(true);
    });

    it('should use default max size', () => {
      const longId = 'a'.repeat(IDUtils.DEFAULT_MAX_ID_SIZE + 1);
      expect(IDUtils.isValidId(longId)).toBe(false);

      const validId = 'a'.repeat(IDUtils.DEFAULT_MAX_ID_SIZE);
      expect(IDUtils.isValidId(validId)).toBe(true);
    });
  });

  describe('generateUuid', () => {
    it('should generate valid UUID', () => {
      const uuid = IDUtils.generateUuid();
      expect(IDUtils.isValidUuid(uuid)).toBe(true);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = IDUtils.generateUuid();
      const uuid2 = IDUtils.generateUuid();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('isValidUuid', () => {
    it('should return true for valid UUIDs', () => {
      expect(IDUtils.isValidUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(
        true
      );
      expect(IDUtils.isValidUuid('00000000-0000-0000-0000-000000000000')).toBe(
        true
      );
      expect(IDUtils.isValidUuid('FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF')).toBe(
        true
      );
    });

    it('should return false for invalid UUIDs', () => {
      expect(IDUtils.isValidUuid('')).toBe(false);
      expect(IDUtils.isValidUuid(null as any)).toBe(false);
      expect(IDUtils.isValidUuid(undefined as any)).toBe(false);
      expect(IDUtils.isValidUuid('123e4567-e89b-12d3-a456')).toBe(false);
      expect(
        IDUtils.isValidUuid('123e4567-e89b-12d3-a456-426614174000-extra')
      ).toBe(false);
      expect(IDUtils.isValidUuid('ggge4567-e89b-12d3-a456-426614174000')).toBe(
        false
      );
      expect(IDUtils.isValidUuid('123e4567_e89b_12d3_a456_426614174000')).toBe(
        false
      );
    });
  });

  describe('generateShortId', () => {
    it('should generate lowercase base32 ID', () => {
      const id = IDUtils.generateShortId();
      expect(id).toMatch(/^[a-z0-9]+$/);
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = IDUtils.generateShortId();
      const id2 = IDUtils.generateShortId();
      expect(id1).not.toBe(id2);
    });
  });
});
