import { ErrorCode } from './error-code.interface.js';

export enum GeneralErrorCode {
  BAD_REQUEST_GENERAL = 4009999,
  UNAUTHORIZED_GENERAL = 4019999,
  PAYMENT_REQUIRED_GENERAL = 4029999,
  FORBIDDEN_GENERAL = 4039999,
  NOT_FOUND_GENERAL = 4049999,
  METHOD_NOT_ALLOWED_GENERAL = 4059999,
  NOT_ACCEPTABLE_GENERAL = 4069999,
  PROXY_AUTHENTICATION_REQUIRED_GENERAL = 4079999,
  REQUEST_TIMEOUT_GENERAL = 4089999,
  CONFLICT_GENERAL = 4099999,
  GONE_GENERAL = 4109999,
  LENGTH_REQUIRED_GENERAL = 4119999,
  PRECONDITION_FAILED_GENERAL = 4129999,
  PAYLOAD_TOO_LARGE_GENERAL = 4139999,
  URI_TOO_LONG_GENERAL = 4149999,
  UNSUPPORTED_MEDIA_TYPE_GENERAL = 4159999,
  REQUESTED_RANGE_NOT_SATISFIABLE_GENERAL = 4169999,
  EXPECTATION_FAILED_GENERAL = 4179999,
  I_AM_A_TEAPOT_GENERAL = 4189999,
  INSUFFICIENT_SPACE_ON_RESOURCE_GENERAL = 4199999,
  METHOD_FAILURE_GENERAL = 4209999,
  DESTINATION_LOCKED_GENERAL = 4219999,
  UNPROCESSABLE_ENTITY_GENERAL = 4229999,
  LOCKED_GENERAL = 4239999,
  FAILED_DEPENDENCY_GENERAL = 4249999,
  TOO_EARLY_GENERAL = 4259999,
  UPGRADE_REQUIRED_GENERAL = 4269999,
  PRECONDITION_REQUIRED_GENERAL = 4289999,
  TOO_MANY_REQUESTS_GENERAL = 4299999,
  REQUEST_HEADER_FIELDS_TOO_LARGE_GENERAL = 4319999,
  UNAVAILABLE_FOR_LEGAL_REASONS_GENERAL = 4519999,
  INTERNAL_SERVER_ERROR_GENERAL = 5009999,
  NOT_IMPLEMENTED_GENERAL = 5019999,
  BAD_GATEWAY_GENERAL = 5029999,
  SERVICE_UNAVAILABLE_GENERAL = 5039999,
  GATEWAY_TIMEOUT_GENERAL = 5049999,
  HTTP_VERSION_NOT_SUPPORTED_GENERAL = 5059999,
  VARIANT_ALSO_NEGOTIATES_GENERAL = 5069999,
  INSUFFICIENT_STORAGE_GENERAL = 5079999,
  LOOP_DETECTED_GENERAL = 5089999,
  BANDWIDTH_LIMIT_EXCEEDED_GENERAL = 5099999,
  NOT_EXTENDED_GENERAL = 5109999,
  NETWORK_AUTHENTICATION_REQUIRED_GENERAL = 5119999,
}

export class GeneralErrorCodeImpl implements ErrorCode {
  public static readonly HTTP_STATUS_ERROR_CODE_BASE = 10000;
  public static readonly GENERAL_ERROR_CODE_BASE = 9900;
  public static readonly HTTP_STATUS_MIN_VALUE = 100;
  public static readonly HTTP_STATUS_MAX_VALUE = 599;
  public static readonly INTERNAL_SERVER_ERROR_HTTP_STATUS = 500;

  private static readonly _map = new Map<number, ErrorCode>();

  static {
    for (const [key, value] of Object.entries(GeneralErrorCode)) {
      if (typeof value === 'number') {
        const errorCode = new GeneralErrorCodeImpl(value, key);
        this._map.set(value, errorCode);
        this.httpStatusFromValue(value);
      }
    }
  }

  constructor(
    private readonly value: number,
    private readonly name: string
  ) {
    this.validateErrorCode(value, GeneralErrorCodeImpl.GENERAL_ERROR_CODE_BASE);
  }

  errorCode(): number {
    return this.value;
  }

  errorID(): string {
    return this.name;
  }

  static from(value: number, logWarning: boolean = true): ErrorCode {
    if (this._map.has(value)) {
      return this._map.get(value)!;
    }

    if (value >= this.HTTP_STATUS_MIN_VALUE && value <= this.HTTP_STATUS_MAX_VALUE) {
      return this.errorCodeFromHttpStatus(value);
    }

    if (logWarning) {
      console.warn(`Failed to find error code for: ${value}`);
    }

    return this._map.get(GeneralErrorCode.INTERNAL_SERVER_ERROR_GENERAL)!;
  }

  private validateErrorCode(errorCode: number, errorCodeBase: number): void {
    GeneralErrorCodeImpl.httpStatusFromValue(errorCode, true);

    // Extract the error code base from the middle of the error code
    // Format: [HTTP_STATUS][ERROR_BASE][999]
    // Example: 4009999 -> extract 99 -> 9900
    const base = GeneralErrorCodeImpl.HTTP_STATUS_ERROR_CODE_BASE / 100; // 100
    const calculatedErrorCodeBase = Math.floor((errorCode / base) % 100) * base;

    if (calculatedErrorCodeBase !== errorCodeBase) {
      throw new Error(
        `Expected errorCodeBase: ${errorCodeBase} but found: ${calculatedErrorCodeBase}`
      );
    }
  }

  static httpStatusFromValue(value: number, fail: boolean = false): number {
    if (value >= this.HTTP_STATUS_MIN_VALUE && value <= this.HTTP_STATUS_MAX_VALUE) {
      return value;
    }

    let httpStatus = this.INTERNAL_SERVER_ERROR_HTTP_STATUS;
    const httpStatusFromValue = Math.floor(value / this.HTTP_STATUS_ERROR_CODE_BASE);

    if (httpStatusFromValue >= this.HTTP_STATUS_MIN_VALUE && 
        httpStatusFromValue <= this.HTTP_STATUS_MAX_VALUE) {
      httpStatus = httpStatusFromValue;
    } else if (fail) {
      throw new Error(
        `Invalid HttpStatus: ${httpStatusFromValue} from errorCode: ${value}`
      );
    }

    return httpStatus;
  }

  static errorCodeFromHttpStatus(httpStatus: number): ErrorCode {
    const errorCodeValue = httpStatus * this.HTTP_STATUS_ERROR_CODE_BASE + 9999;
    return new GeneralErrorCodeImpl(errorCodeValue, `HTTP_${httpStatus}_GENERAL`);
  }
}