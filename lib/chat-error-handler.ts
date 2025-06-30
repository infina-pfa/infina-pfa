import { ChatError } from "@/lib/types/chat.types";

// Chat-specific error codes
export const CHAT_ERROR_CODES = {
  // Session errors
  SESSION_CREATE_FAILED: "SESSION_CREATE_FAILED",
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  
  // Message errors
  MESSAGE_SEND_FAILED: "MESSAGE_SEND_FAILED",
  MESSAGE_NOT_FOUND: "MESSAGE_NOT_FOUND",
  
  // Streaming errors
  STREAMING_ERROR: "STREAMING_ERROR",
  STREAM_CONNECTION_FAILED: "STREAM_CONNECTION_FAILED",
  
  // Validation errors
  CONTENT_REQUIRED: "CONTENT_REQUIRED",
  CONTENT_TOO_LONG: "CONTENT_TOO_LONG",
  CONVERSATION_ID_REQUIRED: "CONVERSATION_ID_REQUIRED",
  
  // Authorization errors
  UNAUTHORIZED_CHAT: "UNAUTHORIZED_CHAT",
  CONVERSATION_ACCESS_DENIED: "CONVERSATION_ACCESS_DENIED",
  
  // Generic errors
  CHAT_UNKNOWN_ERROR: "CHAT_UNKNOWN_ERROR"
} as const;

// User-friendly messages for chat errors
export const CHAT_ERROR_MESSAGES = {
  [CHAT_ERROR_CODES.SESSION_CREATE_FAILED]: "Failed to start chat session. Please try again.",
  [CHAT_ERROR_CODES.SESSION_NOT_FOUND]: "Chat session not found. Please start a new conversation.",
  [CHAT_ERROR_CODES.MESSAGE_SEND_FAILED]: "Failed to send message. Please try again.",
  [CHAT_ERROR_CODES.MESSAGE_NOT_FOUND]: "Message not found.",
  [CHAT_ERROR_CODES.STREAMING_ERROR]: "Connection lost while receiving response. Please try again.",
  [CHAT_ERROR_CODES.STREAM_CONNECTION_FAILED]: "Unable to connect to chat service. Please refresh and try again.",
  [CHAT_ERROR_CODES.CONTENT_REQUIRED]: "Message content is required.",
  [CHAT_ERROR_CODES.CONTENT_TOO_LONG]: "Message is too long. Please shorten your message.",
  [CHAT_ERROR_CODES.CONVERSATION_ID_REQUIRED]: "Conversation ID is required.",
  [CHAT_ERROR_CODES.UNAUTHORIZED_CHAT]: "You must be signed in to use the chat feature.",
  [CHAT_ERROR_CODES.CONVERSATION_ACCESS_DENIED]: "You don't have access to this conversation.",
  [CHAT_ERROR_CODES.CHAT_UNKNOWN_ERROR]: "An unexpected error occurred. Please try again."
} as const;

/**
 * Transform any error into a consistent ChatError format
 */
export function handleChatError(error: unknown): ChatError {
  // If it's already a ChatError, return as is
  if (isChatError(error)) {
    return error;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    const code = classifyChatError(error);
    return {
      code,
      message: CHAT_ERROR_MESSAGES[code as keyof typeof CHAT_ERROR_MESSAGES] || error.message
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: CHAT_ERROR_CODES.CHAT_UNKNOWN_ERROR,
      message: error
    };
  }

  // Handle unknown errors
  return {
    code: CHAT_ERROR_CODES.CHAT_UNKNOWN_ERROR,
    message: CHAT_ERROR_MESSAGES[CHAT_ERROR_CODES.CHAT_UNKNOWN_ERROR]
  };
}

/**
 * Check if an error is already a ChatError
 */
function isChatError(error: unknown): error is ChatError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as ChatError).code === 'string' &&
    typeof (error as ChatError).message === 'string'
  );
}

/**
 * Classify error type based on the error message and properties
 */
function classifyChatError(error: Error): string {
  const message = error.message.toLowerCase();

  // Session errors
  if (message.includes('conversation') && (message.includes('create') || message.includes('session'))) {
    return CHAT_ERROR_CODES.SESSION_CREATE_FAILED;
  }

  if (message.includes('conversation not found') || message.includes('session not found')) {
    return CHAT_ERROR_CODES.SESSION_NOT_FOUND;
  }

  // Message errors
  if (message.includes('message') && message.includes('send')) {
    return CHAT_ERROR_CODES.MESSAGE_SEND_FAILED;
  }

  if (message.includes('message not found')) {
    return CHAT_ERROR_CODES.MESSAGE_NOT_FOUND;
  }

  // Streaming errors
  if (message.includes('stream') || message.includes('eventsource')) {
    return CHAT_ERROR_CODES.STREAMING_ERROR;
  }

  // Validation errors
  if (message.includes('content') && message.includes('required')) {
    return CHAT_ERROR_CODES.CONTENT_REQUIRED;
  }

  if (message.includes('content') && (message.includes('long') || message.includes('exceed'))) {
    return CHAT_ERROR_CODES.CONTENT_TOO_LONG;
  }

  if (message.includes('conversation') && message.includes('required')) {
    return CHAT_ERROR_CODES.CONVERSATION_ID_REQUIRED;
  }

  // Authorization errors
  if (message.includes('unauthorized') || message.includes('401')) {
    return CHAT_ERROR_CODES.UNAUTHORIZED_CHAT;
  }

  if (message.includes('access denied') || message.includes('forbidden') || message.includes('403')) {
    return CHAT_ERROR_CODES.CONVERSATION_ACCESS_DENIED;
  }

  // Default to unknown error
  return CHAT_ERROR_CODES.CHAT_UNKNOWN_ERROR;
}

/**
 * Create a standardized ChatError
 */
export function createChatError(code: string, message: string, details?: Record<string, unknown>): ChatError {
  return {
    code,
    message,
    details
  };
}

/**
 * Log chat error with context
 */
export function logChatError(error: unknown, context?: string): void {
  const chatError = handleChatError(error);
  
  console.error(`[CHAT ERROR${context ? ` - ${context}` : ''}]:`, {
    code: chatError.code,
    message: chatError.message,
    details: chatError.details,
    timestamp: new Date().toISOString(),
    originalError: error
  });
} 