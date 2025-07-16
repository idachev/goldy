import { describe, test, expect } from '@jest/globals';
import { BusinessRuleError } from './business-rule-error';
import {
  GeneralErrorCode,
  GeneralErrorCodeImpl,
} from './general-error-code.enum';

describe('BusinessRuleError', () => {
  test('constructor with sprintf formatting', () => {
    const error = new BusinessRuleError(
      GeneralErrorCodeImpl.from(GeneralErrorCode.INTERNAL_SERVER_ERROR_GENERAL),
      'Error message: %s',
      'arg'
    );

    expect(error.message).toBe(
      '[INTERNAL_SERVER_ERROR_GENERAL] Error message: arg'
    );
    expect(error.errorCode).toBe(
      GeneralErrorCodeImpl.from(GeneralErrorCode.INTERNAL_SERVER_ERROR_GENERAL)
    );
    expect(error.originalMessage).toBe('Error message: arg');
  });

  test('constructor with multiple sprintf arguments', () => {
    const error = new BusinessRuleError(
      GeneralErrorCodeImpl.from(GeneralErrorCode.BAD_REQUEST_GENERAL),
      'User %s with ID %d has status: %s',
      'John',
      12345,
      'active'
    );

    expect(error.message).toBe(
      '[BAD_REQUEST_GENERAL] User John with ID 12345 has status: active'
    );
    expect(error.originalMessage).toBe(
      'User John with ID 12345 has status: active'
    );
  });

  test('constructor without format arguments', () => {
    const error = new BusinessRuleError(
      GeneralErrorCodeImpl.from(GeneralErrorCode.NOT_FOUND_GENERAL),
      'Resource not found'
    );

    expect(error.message).toBe('[NOT_FOUND_GENERAL] Resource not found');
    expect(error.originalMessage).toBe('Resource not found');
  });

  test('constructor with empty message', () => {
    const error = new BusinessRuleError(
      GeneralErrorCodeImpl.from(GeneralErrorCode.FORBIDDEN_GENERAL),
      ''
    );

    expect(error.message).toBe('[FORBIDDEN_GENERAL]');
    expect(error.originalMessage).toBe('');
  });

  test('should have correct error properties', () => {
    const errorCode = GeneralErrorCodeImpl.from(
      GeneralErrorCode.CONFLICT_GENERAL
    );
    const error = new BusinessRuleError(errorCode, 'Conflict detected');

    expect(error.name).toBe('BusinessRuleError');
    expect(error.errorCode).toBe(errorCode);
    expect(error.timestamp).toBeInstanceOf(Date);
    expect(error.stack).toBeDefined();
  });

  test('should support cause (through manual assignment)', () => {
    const cause = new Error('underlying cause');
    const error = new BusinessRuleError(
      GeneralErrorCodeImpl.from(GeneralErrorCode.INTERNAL_SERVER_ERROR_GENERAL),
      'Error with cause: %s',
      'test'
    );
    error.cause = cause;

    expect(error.message).toBe(
      '[INTERNAL_SERVER_ERROR_GENERAL] Error with cause: test'
    );
    expect(error.cause).toBe(cause);
  });

  test('should format various sprintf placeholders', () => {
    const error = new BusinessRuleError(
      GeneralErrorCodeImpl.from(GeneralErrorCode.BAD_REQUEST_GENERAL),
      'String: %s, Number: %d, Float: %.2f, JSON: %j',
      'test',
      42,
      3.14159,
      { key: 'value' }
    );

    expect(error.originalMessage).toBe(
      'String: test, Number: 42, Float: 3.14, JSON: {"key":"value"}'
    );
  });
});
