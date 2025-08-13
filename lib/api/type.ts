import { AUTH_ERROR_CODES } from "./error-code/auth";

/**
 * Legacy API response format (for backward compatibility)
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * New standardized success response format from backend
 * All successful API responses are wrapped with this structure
 */
export interface ApiSuccessResponse<T> {
  data: T;                // The actual response payload
  status: number;         // HTTP status code (200, 201, etc.)
  code: "success";        // Always "success" for successful responses
  timestamp: string;      // ISO 8601 timestamp
}

/**
 * New standardized error response format from backend
 * All error responses follow this structure
 */
export interface ApiErrorResponse {
  statusCode: number;     // HTTP status code (400, 404, 500, etc.)
  code: string;           // Error code for identifying specific errors
  message: string;        // Human-readable error message
  error: string;          // Error type/name (e.g., "NotFoundException")
  timestamp: string;      // ISO 8601 timestamp
  path: string;           // The API path that was called
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
