import { ErrorCode } from './error-code.interface';
import { sprintf } from 'sprintf-js';

export class BusinessRuleError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly originalMessage: string;
  public readonly timestamp: Date;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(errorCode: ErrorCode, message: string, ...args: any[]) {
    // Format the message using sprintf if there are format arguments
    const formattedOriginalMessage =
      args.length > 0 ? sprintf(message, ...args) : message;

    const formattedMessage = formattedOriginalMessage
      ? `[${errorCode.errorId()}] ${formattedOriginalMessage}`
      : `[${errorCode.errorId()}]`;

    super(formattedMessage);

    this.name = 'BusinessRuleError';
    this.errorCode = errorCode;
    this.originalMessage = formattedOriginalMessage;
    this.timestamp = new Date();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessRuleError);
    }
  }
}
