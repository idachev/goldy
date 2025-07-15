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
      ? `[${errorCode.errorId()}] ${originalMessage}`
      : `[${errorCode.errorId()}]`;

    super(formattedMessage);

    this.name = 'BusinessRuleError';
    this.errorCode = errorCode;
    this.originalMessage = originalMessage;
    this.timestamp = timestamp;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessRuleError);
    }
  }
}
