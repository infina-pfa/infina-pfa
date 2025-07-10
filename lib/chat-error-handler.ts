import { NextResponse } from "next/server";

/**
 * Error codes for chat API endpoints
 */
export enum ChatErrorCode {
  AUTHENTICATION_REQUIRED = "auth_required",
  INVALID_REQUEST = "invalid_request",
  MISSING_MESSAGE = "missing_message",
  OPENAI_ERROR = "openai_error",
  INTERNAL_ERROR = "internal_error",
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  error: string;
  code: ChatErrorCode;
  status: number;
}

/**
 * Centralized error handler for chat API endpoints
 */
export const chatErrorHandler = {
  /**
   * Handle authentication errors
   * @returns Error response
   */
  authenticationError(): NextResponse {
    return NextResponse.json(
      {
        error: "Authentication required",
        code: ChatErrorCode.AUTHENTICATION_REQUIRED,
      },
      { status: 401 }
    );
  },

  /**
   * Handle invalid request errors
   * @param message Error message
   * @returns Error response
   */
  invalidRequestError(message: string = "Invalid request"): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: ChatErrorCode.INVALID_REQUEST,
      },
      { status: 400 }
    );
  },

  /**
   * Handle missing message errors
   * @returns Error response
   */
  missingMessageError(): NextResponse {
    return NextResponse.json(
      {
        error: "Message is required",
        code: ChatErrorCode.MISSING_MESSAGE,
      },
      { status: 400 }
    );
  },

  /**
   * Handle OpenAI API errors
   * @param error Error object
   * @returns Error response
   */
  openAIError(error: Error): NextResponse {
    console.error("❌ OpenAI API error:", error);

    return NextResponse.json(
      {
        error: "Error processing AI request",
        code: ChatErrorCode.OPENAI_ERROR,
        details: error.message,
      },
      { status: 502 }
    );
  },

  /**
   * Handle internal server errors
   * @param error Error object
   * @returns Error response
   */
  internalError(error: unknown): NextResponse {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Internal server error:", errorMessage);

    return NextResponse.json(
      {
        error: "Internal server error",
        code: ChatErrorCode.INTERNAL_ERROR,
        details: errorMessage,
      },
      { status: 500 }
    );
  },
};
