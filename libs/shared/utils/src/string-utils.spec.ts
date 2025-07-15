import { StringUtils } from './string-utils';
import { v4 as uuidv4 } from 'uuid';

describe('StringUtils', () => {
  describe('hideString', () => {
    it('should handle null and empty strings', () => {
      expect(StringUtils.hideString('')).toBe('');
      expect(StringUtils.hideString(null as any)).toBeNull();
      expect(StringUtils.hideString(undefined as any)).toBeUndefined();
    });

    it('should not hide short strings', () => {
      expect(StringUtils.hideString('a')).toBe('a');
      expect(StringUtils.hideString('ab')).toBe('ab');
    });

    it('should hide strings longer than 2 * showChars', () => {
      expect(StringUtils.hideString('abc')).toBe('a...3...c');
      expect(StringUtils.hideString('abcdefg', 2)).toBe('ab...7...fg');
    });

    it('should handle negative or zero showChars', () => {
      expect(StringUtils.hideString('abcdefg', 0)).toBe('a...7...g');
      expect(StringUtils.hideString('abcdefg', -1)).toBe('a...7...g');
    });
  });

  describe('truncateValue', () => {
    it('should truncate long values', () => {
      const longValue = 'LongLongValue1 LongLongValue2 LongLongValue3 ' +
                       'LongLongValue4 LongLongValue5 LongLongValue6 ' +
                       'LongLongValue7 LongLongValue8 LongLongValue9';
      
      const expected = 'LongLongValue1 LongLongValue2 LongLongValue3 LongLongValue4 ' +
                      'LongLongValue5 LongLongValue6 LongLongValue7 LongLongValue8 LongLong...';
      
      expect(StringUtils.truncateValue(longValue)).toBe(expected);
    });

    it('should not truncate short values', () => {
      const shortValue = 'short';
      expect(StringUtils.truncateValue(shortValue)).toBe(shortValue);
    });

    it('should handle null values', () => {
      expect(StringUtils.truncateValue(null as any)).toBeNull();
    });
  });

  describe('toUuid', () => {
    it('should convert valid UUID string to UUID', () => {
      const uuid = uuidv4();
      expect(StringUtils.toUuid(uuid)).toBe(uuid);
    });

    it('should return null for invalid UUID', () => {
      expect(StringUtils.toUuid('invalid-uuid')).toBeNull();
      expect(StringUtils.toUuid('')).toBeNull();
      expect(StringUtils.toUuid(null as any)).toBeNull();
    });
  });

  describe('toUuids', () => {
    it('should convert array of UUID strings to UUIDs', () => {
      const uuid1 = uuidv4();
      const uuid2 = uuidv4();
      const uuid3 = uuidv4();

      const result = StringUtils.toUuids([uuid2, uuid3, 'invalid']);
      expect(result).toEqual([uuid2, uuid3]);
    });

    it('should handle empty array', () => {
      expect(StringUtils.toUuids([])).toEqual([]);
      expect(StringUtils.toUuids(null as any)).toEqual([]);
    });
  });

  describe('toFullName', () => {
    it('should handle null and empty strings', () => {
      expect(StringUtils.toFullName(null, null)).toBe('');
      expect(StringUtils.toFullName(null, '')).toBe('');
      expect(StringUtils.toFullName('', '')).toBe('');
      expect(StringUtils.toFullName('', null)).toBe('');
      expect(StringUtils.toFullName('\r\n\t', null)).toBe('');
      expect(StringUtils.toFullName('\r\n\t', ' \t\n ')).toBe('');
    });

    it('should handle single names', () => {
      expect(StringUtils.toFullName('first', null)).toBe('first');
      expect(StringUtils.toFullName('first', '')).toBe('first');
      expect(StringUtils.toFullName(null, 'last')).toBe('last');
      expect(StringUtils.toFullName('', 'last')).toBe('last');
    });

    it('should combine first and last names', () => {
      expect(StringUtils.toFullName('first', 'last')).toBe('first last');
      expect(StringUtils.toFullName(' first ', ' \t last\n\r')).toBe('first last');
    });
  });

  describe('toEmail', () => {
    it('should handle email without names', () => {
      expect(StringUtils.toEmail('test@email.com')).toBe('test@email.com');
      expect(StringUtils.toEmail('test@email.com', ' \t', '\r\n\t')).toBe('test@email.com');
    });

    it('should format email with names', () => {
      expect(StringUtils.toEmail('test@email.com', 'ivan\r\t', null)).toBe('ivan <test@email.com>');
      expect(StringUtils.toEmail('test@email.com', 'ivan\r\t', 'last')).toBe('ivan last <test@email.com>');
    });
  });

  describe('removeNonPrintableCharacters', () => {
    it('should remove non-printable characters', () => {
      expect(StringUtils.removeNonPrintableCharacters('雙賣uD835\uDE49০Ρļ\uDC7A\uDC7A\uD83D\uDD25'))
        .toBe('雙賣uD835০Ρļ');
    });

    it('should handle null and empty strings', () => {
      expect(StringUtils.removeNonPrintableCharacters(null as any)).toBeNull();
      expect(StringUtils.removeNonPrintableCharacters('')).toBe('');
    });
  });

  describe('filterNotBlank', () => {
    it('should handle null and empty arrays', () => {
      expect(StringUtils.filterNotBlank(null as any)).toEqual([]);
      expect(StringUtils.filterNotBlank([])).toEqual([]);
    });

    it('should filter out blank strings', () => {
      const input = ['', 'b', '  ', '\r\t\n  ', '\r\t\n  atest'];
      const result = StringUtils.filterNotBlank(input);
      expect(new Set(result)).toEqual(new Set(['atest', 'b']));
    });

    it('should trim and deduplicate strings', () => {
      const input = ['', 'b', '  ', '\r\t\n  ', '\ratest\t\r\n  \t\n'];
      const result = StringUtils.filterNotBlank(input);
      expect(new Set(result)).toEqual(new Set(['atest', 'b']));
    });
  });

  describe('toSimplePathName', () => {
    it('should convert to simple path name', () => {
      expect(StringUtils.toSimplePathName('\r\nTest \\// tesy 1\t\r\n')).toBe('Test_tesy_1');
      expect(StringUtils.toSimplePathName('\r\nTest \\// tesy 1\t\r\n__test+()090')).toBe('Test_tesy_1_test_090');
      expect(StringUtils.toSimplePathName('///Test///')).toBe('Test');
    });

    it('should handle null and empty strings', () => {
      expect(StringUtils.toSimplePathName(null as any)).toBeNull();
      expect(StringUtils.toSimplePathName('')).toBe('');
    });
  });

  describe('concatNotEmpty', () => {
    it('should handle null and empty strings', () => {
      expect(StringUtils.concatNotEmpty()).toBe('');
      expect(StringUtils.concatNotEmpty(null as any, null as any)).toBe('');
      expect(StringUtils.concatNotEmpty(null as any, '\r\n\t')).toBe('');
      expect(StringUtils.concatNotEmpty('  ', null as any)).toBe('');
    });

    it('should concatenate non-empty strings', () => {
      expect(StringUtils.concatNotEmpty('  \r\t', '\r\t t', '')).toBe('t');
      expect(StringUtils.concatNotEmpty('a\r\n\t', null as any, 'leon')).toBe('a leon');
      expect(StringUtils.concatNotEmpty('\r\t\na  ', ' b ')).toBe('a b');
    });
  });

  describe('trimToEmpty', () => {
    it('should trim to empty string', () => {
      expect(StringUtils.trimToEmpty(null)).toBe('');
      expect(StringUtils.trimToEmpty(undefined)).toBe('');
      expect(StringUtils.trimToEmpty('')).toBe('');
      expect(StringUtils.trimToEmpty('  test  ')).toBe('test');
    });
  });

  describe('trimToNull', () => {
    it('should trim to null for empty strings', () => {
      expect(StringUtils.trimToNull(null)).toBeNull();
      expect(StringUtils.trimToNull(undefined)).toBeNull();
      expect(StringUtils.trimToNull('')).toBeNull();
      expect(StringUtils.trimToNull('   ')).toBeNull();
      expect(StringUtils.trimToNull('  test  ')).toBe('test');
    });
  });

  describe('isEmpty', () => {
    it('should check if string is empty', () => {
      expect(StringUtils.isEmpty(null)).toBe(true);
      expect(StringUtils.isEmpty(undefined)).toBe(true);
      expect(StringUtils.isEmpty('')).toBe(true);
      expect(StringUtils.isEmpty('   ')).toBe(true);
      expect(StringUtils.isEmpty('test')).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    it('should check if string is not empty', () => {
      expect(StringUtils.isNotEmpty(null)).toBe(false);
      expect(StringUtils.isNotEmpty(undefined)).toBe(false);
      expect(StringUtils.isNotEmpty('')).toBe(false);
      expect(StringUtils.isNotEmpty('   ')).toBe(false);
      expect(StringUtils.isNotEmpty('test')).toBe(true);
    });
  });
});