import { describe, test, expect, beforeEach } from '@jest/globals';
import { ErrorDto, ErrorDtoBuilder } from './error.dto';
import { GeneralErrorCode, GeneralErrorCodeImpl } from '../errors/general-error-code.enum';
import { BusinessRuleError } from '../errors/business-rule-error';

describe('ErrorDto', () => {
  const TEST_DATE_20220905_081555_789 = new Date(1652084155789);
  const ERROR_DETAILS = ['error detail1', 'error detail 2'];

  let testModel: ErrorDto;

  beforeEach(() => {
    testModel = ErrorDtoBuilder.create(
      GeneralErrorCodeImpl.from(GeneralErrorCode.BAD_REQUEST_GENERAL)
    )
      .withTimestamp(TEST_DATE_20220905_081555_789)
      .withErrorDetails(ERROR_DETAILS)
      .build();
  });

  describe('constructor/builder tests', () => {
    test('should create default ErrorDto with current timestamp', () => {
      const beforeTime = new Date();
      const result = ErrorDtoBuilder.create().build();
      const afterTime = new Date();

      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      expect(result.httpStatus).toBe(500);
      expect(result.errorCode).toBe(5009999);
      expect(result.errorId).toBe('INTERNAL_SERVER_ERROR_GENERAL');
      expect(result.errorDetails).toEqual([]);
    });

    test('should create ErrorDto with NOT_FOUND_GENERAL', () => {
      const beforeTime = new Date();
      const result = ErrorDtoBuilder.create(
        GeneralErrorCodeImpl.from(GeneralErrorCode.NOT_FOUND_GENERAL)
      ).build();
      const afterTime = new Date();

      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      expect(result.httpStatus).toBe(404);
      expect(result.errorCode).toBe(4049999);
      expect(result.errorId).toBe('NOT_FOUND_GENERAL');
      expect(result.errorDetails).toEqual([]);
    });

    test('should create ErrorDto with BAD_GATEWAY_GENERAL and error details', () => {
      const beforeTime = new Date();
      const result = ErrorDtoBuilder.create(
        GeneralErrorCodeImpl.from(GeneralErrorCode.BAD_GATEWAY_GENERAL)
      )
        .withErrorDetails(ERROR_DETAILS)
        .build();
      const afterTime = new Date();

      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      expect(result.httpStatus).toBe(502);
      expect(result.errorCode).toBe(5029999);
      expect(result.errorId).toBe('BAD_GATEWAY_GENERAL');
      expect(result.errorDetails).toEqual(ERROR_DETAILS);
    });
  });

  describe('getters', () => {
    test('should return correct property values', () => {
      expect(testModel.timestamp).toEqual(TEST_DATE_20220905_081555_789);
      expect(testModel.httpStatus).toBe(400);
      expect(testModel.errorCode).toBe(4009999);
      expect(testModel.errorId).toBe('BAD_REQUEST_GENERAL');
      expect(testModel.errorDetails).toEqual(ERROR_DETAILS);
    });
  });

  describe('serialization', () => {
    test('should serialize to JSON correctly', () => {
      const jsonString = JSON.stringify(testModel);
      const parsed = JSON.parse(jsonString);

      expect(parsed.timestamp).toBe('2022-05-09T08:15:55.789Z');
      expect(parsed.httpStatus).toBe(400);
      expect(parsed.errorCode).toBe(4009999);
      expect(parsed.errorId).toBe('BAD_REQUEST_GENERAL');
      expect(parsed.errorDetails).toEqual(ERROR_DETAILS);
    });

    test('should deserialize from JSON correctly', () => {
      const jsonString = JSON.stringify(testModel);
      const parsed = JSON.parse(jsonString);

      // Convert timestamp back to Date object
      const reconstructed: ErrorDto = {
        ...parsed,
        timestamp: new Date(parsed.timestamp)
      };

      expect(reconstructed.timestamp).toEqual(TEST_DATE_20220905_081555_789);
      expect(reconstructed.httpStatus).toBe(400);
      expect(reconstructed.errorCode).toBe(4009999);
      expect(reconstructed.errorId).toBe('BAD_REQUEST_GENERAL');
      expect(reconstructed.errorDetails).toEqual(ERROR_DETAILS);
    });
  });

  describe('builder pattern', () => {
    test('should throw error when building without required fields', () => {
      // This test validates that the builder enforces required fields
      const builder = new (ErrorDtoBuilder as any)(); // Access private constructor for testing
      builder.timestamp = null;
      builder.errorCode = null;

      expect(() => builder.build()).toThrow('timestamp and errorCode are required');
    });

    test('should allow method chaining', () => {
      const result = ErrorDtoBuilder.create()
        .withTimestamp(TEST_DATE_20220905_081555_789)
        .withErrorCode(GeneralErrorCodeImpl.from(GeneralErrorCode.BAD_REQUEST_GENERAL))
        .withErrorDetails(['test detail'])
        .build();

      expect(result.timestamp).toEqual(TEST_DATE_20220905_081555_789);
      expect(result.errorCode).toBe(4009999);
      expect(result.errorDetails).toEqual(['test detail']);
    });
  });

  describe('error code mapping', () => {
    test('should map error codes to correct HTTP status', () => {
      const testCases = [
        { errorCode: GeneralErrorCode.BAD_REQUEST_GENERAL, expectedStatus: 400 },
        { errorCode: GeneralErrorCode.NOT_FOUND_GENERAL, expectedStatus: 404 },
        { errorCode: GeneralErrorCode.BAD_GATEWAY_GENERAL, expectedStatus: 502 },
        { errorCode: GeneralErrorCode.INTERNAL_SERVER_ERROR_GENERAL, expectedStatus: 500 },
      ];

      testCases.forEach(({ errorCode, expectedStatus }) => {
        const result = ErrorDtoBuilder.create(
          GeneralErrorCodeImpl.from(errorCode)
        ).build();

        expect(result.httpStatus).toBe(expectedStatus);
      });
    });
  });

  describe('fromBusinessRuleError', () => {
    test('should convert BusinessRuleError to ErrorDto', () => {
      const businessRuleError = new BusinessRuleError(
        GeneralErrorCodeImpl.from(GeneralErrorCode.NOT_FOUND_GENERAL),
        'User %s not found',
        'john123'
      );

      const errorDto = ErrorDtoBuilder.fromBusinessRuleError(businessRuleError);

      expect(errorDto.timestamp).toEqual(businessRuleError.timestamp);
      expect(errorDto.httpStatus).toBe(404);
      expect(errorDto.errorCode).toBe(4049999);
      expect(errorDto.errorId).toBe('NOT_FOUND_GENERAL');
      expect(errorDto.errorDetails).toEqual(['User john123 not found']);
    });

    test('should handle BusinessRuleError with empty message', () => {
      const businessRuleError = new BusinessRuleError(
        GeneralErrorCodeImpl.from(GeneralErrorCode.FORBIDDEN_GENERAL),
        ''
      );

      const errorDto = ErrorDtoBuilder.fromBusinessRuleError(businessRuleError);

      expect(errorDto.httpStatus).toBe(403);
      expect(errorDto.errorCode).toBe(4039999);
      expect(errorDto.errorId).toBe('FORBIDDEN_GENERAL');
      expect(errorDto.errorDetails).toEqual([]);
    });
  });
});
