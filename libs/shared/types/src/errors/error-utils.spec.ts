import { describe, test, expect, beforeEach } from '@jest/globals';
import { ErrorUtils } from './error-utils';
import { BusinessRuleError } from './business-rule-error';
import { GeneralErrorCode, GeneralErrorCodeImpl } from './general-error-code.enum';
import { ErrorDto, ErrorDtoBuilder } from '../dto/error.dto';
import { StringUtils } from '@goldy/shared/utils';

describe('ErrorUtils', () => {
  describe('findError', () => {
    test('should find errors in exception chain', () => {
      const l2T = new Error('io');
      const l1T = new Error('illegal state');
      l1T.cause = l2T;

      const l0T = new BusinessRuleError(
        GeneralErrorCodeImpl.from(GeneralErrorCode.BAD_REQUEST_GENERAL),
        'msg: %s',
        ['2']
      );
      l0T.cause = l1T;

      expect(ErrorUtils.findError(l0T, BusinessRuleError)).toBe(l0T);
      expect(ErrorUtils.findError(l0T, Error)).toBe(l0T); // BusinessRuleError extends Error
      expect(ErrorUtils.findError(l0T, TypeError)).toBeNull();

      const connectError = new Error('Connection refused');
      expect(ErrorUtils.findError(connectError, Error)).toBe(connectError);
    });
  });

  describe('getErrorMessages', () => {
    test('should return empty array for null', () => {
      expect(ErrorUtils.getErrorMessages(null)).toEqual([]);
    });

    test('should handle simple throwable', () => {
      expect(ErrorUtils.getErrorMessages(new Error())).toEqual(['Error']);
      expect(ErrorUtils.getErrorMessages(new Error('msg'))).toEqual(['Error(msg)']);
      expect(ErrorUtils.getErrorMessages(new Error(''))).toEqual(['Error']);
    });

    test('should handle nested exceptions', () => {
      const nested = new Error();
      const parent = new Error();
      parent.cause = nested;

      expect(ErrorUtils.getErrorMessages(parent)).toEqual([
        'Error(Error)',
        'Error'
      ]);
    });

    test('should handle nested exceptions with messages', () => {
      const nested = new Error('state');
      const parent = new Error();
      parent.cause = nested;

      expect(ErrorUtils.getErrorMessages(parent)).toEqual([
        'Error(Error)',
        'Error(state)'
      ]);
    });

    test('should handle complex exception chain', () => {
      const deepest = new TypeError('not allowed');
      const middle = new Error('state');
      middle.cause = deepest;
      const top = new Error();
      top.cause = middle;

      expect(ErrorUtils.getErrorMessages(top)).toEqual([
        'Error(Error)',
        'Error(state)',
        'TypeError(not allowed)'
      ]);
    });

    test('should handle complex exception chain without nested cause messages', () => {
      const deepest = new TypeError('not allowed');
      const middle = new Error();
      middle.cause = deepest;
      const top = new Error();
      top.cause = middle;

      expect(ErrorUtils.getErrorMessages(top)).toEqual([
        'Error(Error)',
        'Error(TypeError)',
        'TypeError(not allowed)'
      ]);
    });
  });

  describe('getErrorMessages with addClassName=false', () => {
    test('should return empty array for null', () => {
      expect(ErrorUtils.getErrorMessages(null, false)).toEqual([]);
    });

    test('should handle simple throwable without class names', () => {
      expect(ErrorUtils.getErrorMessages(new Error(), false)).toEqual(['Error']);
      expect(ErrorUtils.getErrorMessages(new Error('msg'), false)).toEqual(['msg']);
      expect(ErrorUtils.getErrorMessages(new Error(''), false)).toEqual(['Error']);
    });

    test('should handle nested exceptions without class prefix', () => {
      const nested = new Error();
      const parent = new Error();
      parent.cause = nested;

      expect(ErrorUtils.getErrorMessages(parent, false)).toEqual([
        'Error',
        'Error'
      ]);
    });

    test('should handle nested exceptions with messages without class prefix', () => {
      const nested = new Error('state');
      const parent = new Error();
      parent.cause = nested;

      expect(ErrorUtils.getErrorMessages(parent, false)).toEqual([
        'Error',
        'state'
      ]);
    });

    test('should handle complex exception chain without class prefix', () => {
      const deepest = new TypeError('not allowed');
      const middle = new Error('state');
      middle.cause = deepest;
      const top = new Error();
      top.cause = middle;

      expect(ErrorUtils.getErrorMessages(top, false)).toEqual([
        'Error',
        'state',
        'not allowed'
      ]);
    });

    test('should handle complex exception chain with no middle message', () => {
      const deepest = new TypeError('not allowed');
      const middle = new Error();
      middle.cause = deepest;
      const top = new Error();
      top.cause = middle;

      expect(ErrorUtils.getErrorMessages(top, false)).toEqual([
        'Error',
        'Error',
        'not allowed'
      ]);
    });
  });

  describe('getErrorClassNames and getExceptionFullClassNames', () => {
    test('should return empty array for null', () => {
      expect(ErrorUtils.getErrorClassNames(null)).toEqual([]);
    });

    test('should return class names for single exception', () => {
      const error = new Error();
      expect(ErrorUtils.getErrorClassNames(error)).toEqual(['Error']);
    });

    test('should return class names for exception chain', () => {
      const nested = new Error();
      const parent = new TypeError();
      parent.cause = nested;

      expect(ErrorUtils.getErrorClassNames(parent)).toEqual(['TypeError', 'Error']);
    });

    test('should handle complex exception chain class names', () => {
      const deepest = new TypeError('not allowed');
      const middle = new Error('state');
      middle.cause = deepest;
      const top = new ReferenceError();
      top.cause = middle;

      expect(ErrorUtils.getErrorClassNames(top)).toEqual([
        'ReferenceError',
        'Error',
        'TypeError'
      ]);
    });
  });

  describe('self-cause in chain', () => {
    class ExceptionWithSelfCause extends Error {
      constructor(message: string) {
        super(message);
        const internalSelf = new Error('internal self');
        internalSelf.cause = this;
        this.cause = internalSelf;
      }
    }

    test('should handle self-referencing exception chain', () => {
      const topError = new Error();
      topError.cause = new ExceptionWithSelfCause('Self');

      expect(ErrorUtils.getErrorMessages(topError)).toEqual([
        'Error(ExceptionWithSelfCause)',
        'ExceptionWithSelfCause(Self)',
        'Error(internal self)'
      ]);
    });
  });

  describe('getNotEmptyMessageOrErrorClassSimpleName', () => {
    test('should return message if not empty', () => {
      expect(ErrorUtils.getNotEmptyMessageOrErrorClassSimpleName(new Error('msg'))).toBe('msg');
    });

    test('should return class name if message is null/empty', () => {
      expect(ErrorUtils.getNotEmptyMessageOrErrorClassSimpleName(new Error())).toBe('Error');
      expect(ErrorUtils.getNotEmptyMessageOrErrorClassSimpleName(new Error(''))).toBe('Error');
    });
  });

  describe('validation methods', () => {
    test('isValidArgument should throw BusinessRuleError on false', () => {
      expect(() => ErrorUtils.isValidArgument(false, 'Message')).toThrow(BusinessRuleError);
      expect(() => ErrorUtils.isValidArgument(false, 'Message')).toThrow('[BAD_REQUEST_GENERAL] Message');
    });

    test('isFoundResource should throw BusinessRuleError on false', () => {
      expect(() => ErrorUtils.isFoundResource(false, 'Message')).toThrow(BusinessRuleError);
      expect(() => ErrorUtils.isFoundResource(false, 'Message')).toThrow('[NOT_FOUND_GENERAL] Message');
    });

    test('isAllowed should throw BusinessRuleError on false', () => {
      expect(() => ErrorUtils.isAllowed(false, 'Message')).toThrow(BusinessRuleError);
      expect(() => ErrorUtils.isAllowed(false, 'Message')).toThrow('[FORBIDDEN_GENERAL] Message');
    });

    test('isConflict should throw BusinessRuleError on false', () => {
      expect(() => ErrorUtils.isConflict(false, 'Message')).toThrow(BusinessRuleError);
      expect(() => ErrorUtils.isConflict(false, 'Message')).toThrow('[CONFLICT_GENERAL] Message');
    });
  });

  describe('trimAndValidateId', () => {
    test('should trim and return valid id', () => {
      expect(ErrorUtils.trimAndValidateId(' value\r\n\t ', 'testId')).toBe('value');
      expect(ErrorUtils.trimAndValidateId(
        'Very-Long-Long-ID-Very-Long-Long-ID-Very-Long-Long-ID-Very-Long-Long-ID-Very-Long-Long-ID-',
        'testId',
        100
      )).toBe('Very-Long-Long-ID-Very-Long-Long-ID-Very-Long-Long-ID-Very-Long-Long-ID-Very-Long-Long-ID-');
    });

    test('should throw BusinessRuleError for null/empty/whitespace ids', () => {
      expect(() => ErrorUtils.trimAndValidateId(null as any, 'testId')).toThrow(BusinessRuleError);
      expect(() => ErrorUtils.trimAndValidateId(null as any, 'testId')).toThrow('[BAD_REQUEST_GENERAL] Expected not empty testId');

      expect(() => ErrorUtils.trimAndValidateId('', 'testId')).toThrow(BusinessRuleError);
      expect(() => ErrorUtils.trimAndValidateId('', 'testId')).toThrow('[BAD_REQUEST_GENERAL] Expected not empty testId');

      expect(() => ErrorUtils.trimAndValidateId(' ', 'testId')).toThrow(BusinessRuleError);
      expect(() => ErrorUtils.trimAndValidateId(' ', 'testId')).toThrow('[BAD_REQUEST_GENERAL] Expected not empty testId');

      expect(() => ErrorUtils.trimAndValidateId(' \r\n\t', 'testId')).toThrow(BusinessRuleError);
      expect(() => ErrorUtils.trimAndValidateId(' \r\n\t', 'testId')).toThrow('[BAD_REQUEST_GENERAL] Expected not empty testId');
    });

    test('should throw BusinessRuleError for invalid id characters', () => {
      expect(() => ErrorUtils.trimAndValidateId('!@id==Wrong', 'testId')).toThrow(BusinessRuleError);
      expect(() => ErrorUtils.trimAndValidateId('!@id==Wrong', 'testId')).toThrow('[BAD_REQUEST_GENERAL] Invalid testId: !@id==Wrong');
    });

    test('should throw BusinessRuleError for too long id', () => {
      const longId = 'Very-Long-Long-ID-Very-Long-Long-ID-Very-Long-Long-ID-Very-Long-Long-ID-Very-Long-Long-ID-' + 'x'.repeat(100);
      expect(() => ErrorUtils.trimAndValidateId(longId, 'testId')).toThrow(BusinessRuleError);
      expect(() => ErrorUtils.trimAndValidateId(longId, 'testId')).toThrow('[BAD_REQUEST_GENERAL] Invalid testId:');
    });

    test('should throw Error for invalid idName parameter', () => {
      expect(() => ErrorUtils.trimAndValidateId('!@id==Wrong', null as any)).toThrow('Expected not empty idName');
      expect(() => ErrorUtils.trimAndValidateId('!@id==Wrong', '')).toThrow('Expected not empty idName');
      expect(() => ErrorUtils.trimAndValidateId('!@id==Wrong', '\r\n\t ')).toThrow('Expected not empty idName');
    });

    test('should throw Error for invalid maxIdSize parameter', () => {
      expect(() => ErrorUtils.trimAndValidateId('!@id==Wrong', 'idName', -1)).toThrow('Expected maxIdSize to be positive: -1');
      expect(() => ErrorUtils.trimAndValidateId('!@id==Wrong', 'idName', 0)).toThrow('Expected maxIdSize to be positive: 0');
    });
  });

  describe('toBusinessRuleError', () => {
    test('should handle null ErrorDto', () => {
      const result = ErrorUtils.toBusinessRuleError(null);
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[INTERNAL_SERVER_ERROR_GENERAL] Unknown error');
    });

    test('should handle null ErrorDto with message', () => {
      const result = ErrorUtils.toBusinessRuleError(null, 'Error message');
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[INTERNAL_SERVER_ERROR_GENERAL] Error message');
    });

    test('should handle ErrorDto with default values', () => {
      const errorDto = ErrorDtoBuilder.create().build();
      const result = ErrorUtils.toBusinessRuleError(errorDto, 'Error message');
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[INTERNAL_SERVER_ERROR_GENERAL] Error message');
    });

    test('should handle ErrorDto with specific error code', () => {
      const errorDto = ErrorDtoBuilder.create(
        GeneralErrorCodeImpl.from(GeneralErrorCode.NOT_FOUND_GENERAL)
      ).build();
      const result = ErrorUtils.toBusinessRuleError(errorDto, 'Error message');
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[NOT_FOUND_GENERAL] Error message');
    });

    test('should handle ErrorDto with error details', () => {
      const errorDto = ErrorDtoBuilder.create(
        GeneralErrorCodeImpl.from(GeneralErrorCode.NOT_FOUND_GENERAL)
      )
        .withErrorDetails(['error 1'])
        .build();
      const result = ErrorUtils.toBusinessRuleError(errorDto, '');
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[NOT_FOUND_GENERAL] error 1');
    });

    test('should handle ErrorDto with multiple error details', () => {
      const errorDto = ErrorDtoBuilder.create(
        GeneralErrorCodeImpl.from(GeneralErrorCode.NOT_FOUND_GENERAL)
      )
        .withErrorDetails(['error 1', 'error 2'])
        .build();
      const result = ErrorUtils.toBusinessRuleError(errorDto, '');
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[NOT_FOUND_GENERAL] error 1, error 2');
    });

    test('should handle HTTP status codes', () => {
      let result = ErrorUtils.toBusinessRuleError(400, '');
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[BAD_REQUEST_GENERAL] Unknown error');

      result = ErrorUtils.toBusinessRuleError(400, null as any);
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[BAD_REQUEST_GENERAL] Unknown error');

      result = ErrorUtils.toBusinessRuleError(400, 'Bad request');
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[BAD_REQUEST_GENERAL] Bad request');
    });

    test('should handle JSON error messages', () => {
      const result = ErrorUtils.toBusinessRuleError(401, '{"error": "Error message custom"}');
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[UNAUTHORIZED_GENERAL] Error message custom');
    });

    test('should handle JSON with message field', () => {
      const result = ErrorUtils.toBusinessRuleError(404, '{"message": "Message custom"}');
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[NOT_FOUND_GENERAL] Message custom');
    });

    test('should handle JSON with both error and message fields', () => {
      const result = ErrorUtils.toBusinessRuleError(404, '{"error": "Error", "message": "Message custom"}');
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[NOT_FOUND_GENERAL] Error, Message custom');
    });

    test('should handle JSON with unknown fields', () => {
      const result = ErrorUtils.toBusinessRuleError(404, '{"custom": "Custom", "message": "Message custom"}');
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toContain('[NOT_FOUND_GENERAL] {"custom": "Custom", "message": "Message custom"}');
    });

    test('should handle formatting in error message', () => {
      const result = ErrorUtils.toBusinessRuleError(null, 'Error message %s');
      expect(result).toBeInstanceOf(BusinessRuleError);
      expect(result.message).toBe('[INTERNAL_SERVER_ERROR_GENERAL] Error message %s');
    });
  });

  describe('sprintf formatting', () => {
    test('should format various placeholders correctly', () => {
      expect(() => ErrorUtils.isValidArgument(
        false, 
        'User %s with ID %d has balance $%.2f and data: %j',
        'John Doe',
        12345,
        1234.567,
        { status: 'active' }
      )).toThrow('[BAD_REQUEST_GENERAL] User John Doe with ID 12345 has balance $1234.57 and data: {"status":"active"}');
    });

    test('BusinessRuleError constructor should support sprintf formatting', () => {
      const error = new BusinessRuleError(
        GeneralErrorCodeImpl.from(GeneralErrorCode.NOT_FOUND_GENERAL),
        'Resource %s with ID %d not found',
        'User',
        42
      );
      
      expect(error.message).toBe('[NOT_FOUND_GENERAL] Resource User with ID 42 not found');
      expect(error.originalMessage).toBe('Resource User with ID 42 not found');
    });
  });
});
