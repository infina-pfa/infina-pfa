import { AUTH_ERROR_CODES } from "./error-code/auth";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * A standardized error class for API failures.
 * Includes an HTTP status code and a language-agnostic error code for translation.
 */
export class ApiError extends Error {
  statusCode: number;
  errorCode: AUTH_ERROR_CODES | null;

  constructor(
    errorCode: AUTH_ERROR_CODES | null = null,
    message: string,
    statusCode: number = 500
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}
