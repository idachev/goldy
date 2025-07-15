import { ErrorCode } from './error-code.interface';
import { GeneralErrorCode, GeneralErrorCodeImpl } from './general-error-code.enum';
import { BusinessRuleError } from './business-rule-error';
import { ErrorDto, ErrorDtoBuilder } from '../dto/error.dto';
import { IDUtils, StringUtils } from '@goldy/shared/utils';

export interface ErrorMessageExtractor<T extends Error> {
  getErrorClass(): new (...args: any[]) => T;
  getErrorCode(error: T): ErrorCode;
  getMessage(error: T): string;
}

export interface ErrorInfo {
  classNames: string[];
  messages: string[];
  errorCodes: ErrorCode[];
}

export class ErrorUtils {
  public static readonly JSON_RESPONSE_MESSAGE_KEY = 'message';
  public static readonly JSON_RESPONSE_ERROR_KEY = 'error';
  public static readonly DEFAULT_MAX_ID_SIZE = IDUtils.DEFAULT_MAX_ID_SIZE;

  private static readonly classToErrorMessageExtractor = new Map<
    new (...args: any[]) => Error,
    ErrorMessageExtractor<any>
  >();

  static {
    // Register default extractors
    this.registerErrorMessageExtractor({
      getErrorClass: () => BusinessRuleError,
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

  public static getErrorClassNames(error: Error | null): string[] {
    if (!error) return [];
    return this.getErrorInfo(error, false).classNames;
  }

  public static getErrorMessages(error: Error | null, addClassNameToMessage: boolean = true): string[] {
    if (!error) return [];
    return this.getErrorInfo(error, addClassNameToMessage).messages;
  }

  public static getNotEmptyMessageOrErrorClassSimpleName(error: Error): string {
    const message = StringUtils.trimToEmpty(error.message);
    return message || error.constructor.name;
  }

  public static registerErrorMessageExtractors(extractors: ErrorMessageExtractor<any>[]): void {
    extractors.forEach(extractor => {
      this.registerErrorMessageExtractor(extractor);
    });
  }

  public static getErrorInfo(error: Error, addClassNameToMessage: boolean): ErrorInfo {
    const errors = this.getErrorChain(error);

    const classNames: string[] = [];
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

      if (addClassNameToMessage) {
        if (message) {
          messages.push(`${className}(${message})`);

        } else if (index < errors.length - 1) {

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

    return { classNames, messages, errorCodes };
  }

  private static resolveExtractorForClass(
    errorClass: new (...args: any[]) => Error
  ): ErrorMessageExtractor<any> | null {
    let extractor = this.classToErrorMessageExtractor.get(errorClass);

    if (!extractor) {
      // Check for inheritance
      for (const [registeredClass, registeredExtractor] of this.classToErrorMessageExtractor.entries()) {
        if (errorClass.prototype instanceof registeredClass) {
          extractor = registeredExtractor;
          break;
        }
      }
    }

    return extractor || null;
  }

  public static registerErrorMessageExtractor<T extends Error>(
    extractor: ErrorMessageExtractor<T>
  ): void {
    this.classToErrorMessageExtractor.set(extractor.getErrorClass(), extractor);
  }

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

  public static toBusinessRuleError(httpStatusOrDto: number | ErrorDto | null, errorResponseOrMessage?: string): BusinessRuleError {
    if (typeof httpStatusOrDto === 'number') {
      return this.toBusinessRuleErrorFromStatus(httpStatusOrDto, errorResponseOrMessage);
    }
    return this.toBusinessRuleErrorFromDto(httpStatusOrDto, errorResponseOrMessage);
  }

  public static toBusinessRuleErrorFromStatus(httpStatus: number, errorResponse?: string): BusinessRuleError {
    const trimmedResponse = StringUtils.trimToEmpty(errorResponse);

    let errorData: any = null;
    try {
      errorData = trimmedResponse ? JSON.parse(trimmedResponse) : null;
    } catch {
      // Ignore parsing errors
    }

    let errorDto: ErrorDto | null = null;

    if (errorData && typeof errorData === 'object' &&
        'errorCode' in errorData && 'httpStatus' in errorData) {
      errorDto = errorData as ErrorDto;
    }

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
    return template.replace(/%s/g, () => String(args.shift() ?? ''));
  }
}
