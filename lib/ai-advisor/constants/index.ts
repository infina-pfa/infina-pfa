// Stream processing constants
export const STREAM_CONSTANTS = {
  MAX_HISTORY_MESSAGES: 10,
  RESPONSE_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  CHUNK_PROCESSING_DELAY: 50
} as const;

// Error messages
export const ERROR_MESSAGES = {
  METHOD_NOT_ALLOWED: "Method not allowed",
  MESSAGE_REQUIRED: "Message is required", 
  STREAMING_ERROR: "Unknown streaming error",
  PROVIDER_NOT_SUPPORTED: "LLM provider not supported",
  MEMORY_PROCESSING_ERROR: "Memory processing error"
} as const;

// Event types for stream responses
export const STREAM_EVENTS = {
  DATA: "data: ",
  DONE: "data: [DONE]\n\n",
  SEPARATOR: "\n\n"
} as const; 