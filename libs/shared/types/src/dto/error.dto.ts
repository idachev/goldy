import { ErrorCode } from '../errors/error-code.interface';
import { GeneralErrorCode, GeneralErrorCodeImpl } from '../errors/general-error-code.enum';
import { BusinessRuleError } from '../errors/business-rule-error';

export interface ErrorDto {
  timestamp: Date;
  httpStatus: number;
  errorCode: number;
  errorId: string;
  errorDetails: string[];
}

export class ErrorDtoBuilder {
  private timestamp: Date = new Date();
  private errorCode: ErrorCode;
  private errorDetails: string[] = [];

  constructor(errorCode?: ErrorCode) {
    this.errorCode = errorCode ||
      GeneralErrorCodeImpl.from(GeneralErrorCode.INTERNAL_SERVER_ERROR_GENERAL);
  }

  static create(errorCode?: ErrorCode): ErrorDtoBuilder {
    return new ErrorDtoBuilder(errorCode);
  }

  static fromBusinessRuleError(error: BusinessRuleError): ErrorDto {
    return {
      timestamp: error.timestamp,
      httpStatus: GeneralErrorCodeImpl.httpStatusFromValue(error.errorCode.errorCode()),
      errorCode: error.errorCode.errorCode(),
      errorId: error.errorCode.errorId(),
      errorDetails: error.originalMessage ? [error.originalMessage] : [],
    };
  }

  withTimestamp(timestamp: Date): ErrorDtoBuilder {
    this.timestamp = timestamp;
    return this;
  }

  withErrorCode(errorCode: ErrorCode): ErrorDtoBuilder {
    this.errorCode = errorCode;
    return this;
  }

  withErrorDetails(errorDetails: string[]): ErrorDtoBuilder {
    this.errorDetails = errorDetails;
    return this;
  }


  build(): ErrorDto {
    if (!this.timestamp || !this.errorCode) {
      throw new Error('timestamp and errorCode are required');
    }

    const httpStatus = GeneralErrorCodeImpl.httpStatusFromValue(this.errorCode.errorCode());

    return {
      timestamp: this.timestamp,
      httpStatus,
      errorCode: this.errorCode.errorCode(),
      errorId: this.errorCode.errorId(),
      errorDetails: this.errorDetails,
    };
  }
}
