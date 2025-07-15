import { ErrorCode } from './error-code.interface';
import { GeneralErrorCode, GeneralErrorCodeImpl } from './general-error-code.enum';
import { BusinessRuleError } from './business-rule-error';
import { ErrorDto, ErrorDtoBuilder } from '../dto/error.dto';
import { IDUtils, StringUtils } from '@goldy/shared/utils';

export interface ExceptionMessageExtractor<T extends Error> {
  getExceptionClass(): new (...args: any[]) => T;
  getErrorCode(error: T): ErrorCode;
  getMessage(error: T): string;
}

export interface ExceptionErrorInfo {
  classNames: string[];
  fullClassNames: string[];
  messages: string[];
  errorCodes: ErrorCode[];
}

export class ErrorUtils {
  public static readonly JSON_RESPONSE_MESSAGE_KEY = 'message';
  public static readonly JSON_RESPONSE_ERROR_KEY = 'error';
  public static readonly DEFAULT_MAX_ID_SIZE = IDUtils.DEFAULT_MAX_ID_SIZE;

  private static readonly classToExceptionMessageExtractor = new Map<
    new (...args: any[]) => Error,
    ExceptionMessageExtractor<any>
  >();

  static {
    // Register default extractors
    this.registerExceptionMessageExtractor({
      getExceptionClass: () => BusinessRuleError,
      getErrorCode: (error: BusinessRuleError) => error.errorCode,
      getMessage: (error: BusinessRuleError) => error.originalMessage,
    });
  }

  private constructor() {
    throw new Error('Utility class');
  }

  public static findError<T extends Error>(error: Error, errorClass: new (...args: any[]) => T): T | null {
    let current: Error | null = error;

    while (current) {
      if (current instanceof errorClass) {
        return current as T;
      }
      current = current.cause as Error || null;
    }

    return null;
  }

  public static getExceptionClassNames(error: Error | null): string[] {
    if (!error) return [];
    return this.getExceptionErrorInfo(error, false).classNames;
  }

  public static getExceptionFullClassNames(error: Error | null): string[] {
    if (!error) return [];
    return this.getExceptionErrorInfo(error, false).fullClassNames;
  }

  public static getExceptionMessages(error: Error | null, addClassNameToMessage: boolean = true): string[] {
    if (!error) return [];
    return this.getExceptionErrorInfo(error, addClassNameToMessage).messages;
  }

  public static getNotEmptyMessageOrExceptionClassSimpleName(error: Error): string {
    const message = StringUtils.trimToEmpty(error.message);
    return message || error.constructor.name;
  }

  public static registerExceptionMessageExtractors(extractors: ExceptionMessageExtractor<any>[]): void {
    extractors.forEach(extractor => {
      this.registerExceptionMessageExtractor(extractor);
    });
  }

  public static registerExceptionMessageExtractor(extractor: ExceptionMessageExtractor<any>): void {
    this.classToExceptionMessageExtractor.set(extractor.getExceptionClass(), extractor);
  }

  public static getExceptionErrorInfo(error: Error, addClassNameToMessage: boolean): ExceptionErrorInfo {
    const errors = this.getErrorChain(error);

    const classNames: string[] = [];
    const fullClassNames: string[] = [];
    const messages: string[] = [];
    const errorCodes: ErrorCode[] = [];

    errors.forEach((err, index) => {
      const extractor = this.resolveExtractorForClass(err.constructor as new (...args: any[]) => Error);

      let message = '';

      if (extractor) {
        const errorCode = extractor.getErrorCode(err);
        message = StringUtils.trimToEmpty(extractor.getMessage(err));
        errorCodes.push(errorCode);
      }

      if (!message) {
        message = StringUtils.trimToEmpty(err.message || '');
      }

      const className = err.constructor.name;
      classNames.push(className);
      fullClassNames.push(className); // In JS, we use simple names

      if (addClassNameToMessage) {
        // For nested exceptions, show the parent's message if current has no message
        if (message) {
          messages.push(`${className}(${message})`);
        } else if (index < errors.length - 1) {
          // Has a cause, show the cause's class name
          const nextError = errors[index + 1];
          messages.push(`${className}(${nextError.constructor.name})`);
        } else {
          messages.push(className);
        }
      } else {
        if (message) {
          messages.push(message);
        } else {
          messages.push(className);
        }
      }
    });

    return { classNames, fullClassNames, messages, errorCodes };
  }

  private static resolveExtractorForClass(
    errorClass: new (...args: any[]) => Error
  ): ExceptionMessageExtractor<any> | null {
    let extractor = this.classToExceptionMessageExtractor.get(errorClass);

    if (!extractor) {
      // Check for inheritance
      for (const [registeredClass, registeredExtractor] of this.classToExceptionMessageExtractor.entries()) {
        if (errorClass.prototype instanceof registeredClass) {
          extractor = registeredExtractor;
          break;
        }
      }
    }

    return extractor || null;
  }

  public static registerExceptionMessageExtractor<T extends Error>(
    extractor: ExceptionMessageExtractor<T>
  ): void {
    this.classToExceptionMessageExtractor.set(extractor.getExceptionClass(), extractor);
  }

  public static getNotEmptyMessageOrExceptionClassSimpleName(error: Error): string {
    const message = StringUtils.trimToEmpty(error.message || '');
    return message || error.constructor.name;
  }

  // Validation utilities
  public static isValidArgument(condition: boolean, message: string, ...args: any[]): void {
    this.isValid(
      condition,
      GeneralErrorCodeImpl.from(GeneralErrorCode.BAD_REQUEST_GENERAL),
      message,
      ...args
    );
  }

  public static isFoundResource(condition: boolean, message: string, ...args: any[]): void {
    this.isValid(
      condition,
      GeneralErrorCodeImpl.from(GeneralErrorCode.NOT_FOUND_GENERAL),
      message,
      ...args
    );
  }

  public static isAllowed(condition: boolean, message: string, ...args: any[]): void {
    this.isValid(
      condition,
      GeneralErrorCodeImpl.from(GeneralErrorCode.FORBIDDEN_GENERAL),
      message,
      ...args
    );
  }

  public static isConflict(condition: boolean, message: string, ...args: any[]): void {
    this.isValid(
      condition,
      GeneralErrorCodeImpl.from(GeneralErrorCode.CONFLICT_GENERAL),
      message,
      ...args
    );
  }

  private static isValid(condition: boolean, errorCode: ErrorCode, message: string, ...args: any[]): void {
    if (!condition) {
      const formattedMessage = this.formatMessage(message, ...args);
      throw new BusinessRuleError(errorCode, formattedMessage);
    }
  }

  public static trimAndValidateId(idValue: string, idName: string, maxIdSize: number = this.DEFAULT_MAX_ID_SIZE): string {
    const trimmedIdName = StringUtils.trimToEmpty(idName);
    const trimmedIdValue = StringUtils.trimToEmpty(idValue);

    if (!trimmedIdName) {
      throw new Error('Expected not empty idName');
    }

    if (maxIdSize <= 0) {
      throw new Error(`Expected maxIdSize to be positive: ${maxIdSize}`);
    }

    this.isValidArgument(!!trimmedIdValue, `Expected not empty ${trimmedIdName}`);
    this.isValidArgument(
      IDUtils.isValidId(trimmedIdValue, maxIdSize),
      `Invalid ${trimmedIdName}: ${StringUtils.hideString(trimmedIdValue, Math.floor(maxIdSize / 2))}`
    );

    return trimmedIdValue;
  }

  public static toBusinessRuleException(httpStatus: number, errorResponse: string): BusinessRuleError;
  public static toBusinessRuleException(errorDto: ErrorDto | null, errorMessage?: string): BusinessRuleError;
  public static toBusinessRuleException(httpStatusOrDto: number | ErrorDto | null, errorResponseOrMessage?: string): BusinessRuleError {
    if (typeof httpStatusOrDto === 'number') {
      return this.toBusinessRuleError(httpStatusOrDto, errorResponseOrMessage || '');
    }
    return this.toBusinessRuleErrorFromDto(httpStatusOrDto, errorResponseOrMessage);
  }

  public static toBusinessRuleError(httpStatus: number, errorResponse: string): BusinessRuleError {
    const trimmedResponse = StringUtils.trimToEmpty(errorResponse);

    let errorData: any = null;
    try {
      errorData = trimmedResponse ? JSON.parse(trimmedResponse) : null;
    } catch {
      // Ignore parsing errors
    }

    let errorDto: ErrorDto | null = null;

    // Try to parse as ErrorDto
    if (errorData && typeof errorData === 'object' &&
        'errorCode' in errorData && 'httpStatus' in errorData) {
      errorDto = errorData as ErrorDto;
    }

    // Handle simple message/error responses
    if (!errorDto && errorData && typeof errorData === 'object') {
      const errorCode = GeneralErrorCodeImpl.errorCodeFromHttpStatus(httpStatus);

      if (Object.keys(errorData).length === 1 &&
          (this.JSON_RESPONSE_MESSAGE_KEY in errorData || this.JSON_RESPONSE_ERROR_KEY in errorData)) {
        const errorMsg = errorData[this.JSON_RESPONSE_MESSAGE_KEY] || errorData[this.JSON_RESPONSE_ERROR_KEY];

        errorDto = ErrorDtoBuilder.create(errorCode)
          .withErrorDetails([String(errorMsg)])
          .build();
      } else if (Object.keys(errorData).length === 2 &&
                 this.JSON_RESPONSE_MESSAGE_KEY in errorData &&
                 this.JSON_RESPONSE_ERROR_KEY in errorData) {
        const message = String(errorData[this.JSON_RESPONSE_MESSAGE_KEY]);
        const error = String(errorData[this.JSON_RESPONSE_ERROR_KEY]);

        errorDto = ErrorDtoBuilder.create(errorCode)
          .withErrorDetails([error, message])
          .build();
      }
    }

    // Fallback to default error
    if (!errorDto) {
      const defaultErrorCode = GeneralErrorCodeImpl.errorCodeFromHttpStatus(httpStatus);
      errorDto = ErrorDtoBuilder.create(defaultErrorCode)
        .withErrorDetails([trimmedResponse || 'Unknown error'])
        .build();
    }

    return this.toBusinessRuleErrorFromDto(errorDto);
  }

  public static toBusinessRuleErrorFromDto(errorDto: ErrorDto, errorMessage?: string): BusinessRuleError {
    if (!errorDto) {
      return new BusinessRuleError(
        GeneralErrorCodeImpl.from(GeneralErrorCode.INTERNAL_SERVER_ERROR_GENERAL),
        errorMessage || 'Unknown error'
      );
    }

    let errorCode: ErrorCode;
    if (errorDto.errorCode === 0) {
      errorCode = errorDto.httpStatus !== 0
        ? GeneralErrorCodeImpl.errorCodeFromHttpStatus(errorDto.httpStatus)
        : GeneralErrorCodeImpl.from(GeneralErrorCode.INTERNAL_SERVER_ERROR_GENERAL);
    } else {
      errorCode = GeneralErrorCodeImpl.from(errorDto.errorCode, false);
    }

    let message = '';
    if (errorMessage && StringUtils.trimToEmpty(errorMessage)) {
      message = errorMessage;
    } else if (errorDto.errorDetails && errorDto.errorDetails.length > 0) {
      message = errorDto.errorDetails.join(', ');
    }

    return new BusinessRuleError(errorCode, message, errorDto.timestamp);
  }

  // Helper methods
  private static getErrorChain(error: Error): Error[] {
    const chain: Error[] = [];
    const visited = new Set<Error>();
    let current: Error | null = error;

    while (current && !visited.has(current)) {
      chain.push(current);
      visited.add(current);
      current = current.cause as Error || null;
    }

    return chain;
  }

  private static formatMessage(template: string, ...args: any[]): string {
    return template.replace(/%s/g, () => String(args.shift() || ''));
  }
}
