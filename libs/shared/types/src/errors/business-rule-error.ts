import { ErrorCode } from './error-code.interface';

export class BusinessRuleError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly originalMessage: string;
  public readonly timestamp: Date;

  constructor(
    errorCode: ErrorCode,
    originalMessage: string,
    timestamp: Date = new Date()
  ) {
    const formattedMessage = originalMessage 
      ? `[${errorCode.errorID()}] ${originalMessage}`
      : `[${errorCode.errorID()}]`;
    
    super(formattedMessage);
    
    this.name = 'BusinessRuleError';
    this.errorCode = errorCode;
    this.originalMessage = originalMessage;
    this.timestamp = timestamp;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessRuleError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode.errorCode(),
      errorID: this.errorCode.errorID(),
      originalMessage: this.originalMessage,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}