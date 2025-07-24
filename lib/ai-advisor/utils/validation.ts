/**
 * Handle MCP-related errors with proper logging
 */
export function handleMCPError(
  error: unknown,
  context: string = 'unknown'
): void {
  if (error instanceof Error) {
    console.error(`❌ MCP Error in ${context}:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context
    });
  } else {
    console.error(`❌ MCP Unknown Error in ${context}:`, error);
  }
}

/**
 * Validate initial request body structure (before authentication)
 */
export function validateInitialRequestBody(body: unknown): {
  isValid: boolean;
  error?: string;
} {
  console.log("🔍 Validating initial request body:", {
    bodyType: typeof body,
    isNull: body === null,
    isUndefined: body === undefined,
    bodyKeys: body && typeof body === 'object' ? Object.keys(body) : 'N/A'
  });

  if (!body || typeof body !== 'object') {
    console.error("❌ Validation failed: Request body is required and must be an object");
    return { isValid: false, error: 'Request body is required and must be an object' };
  }

  const requestBody = body as Record<string, unknown>;
  
  console.log("🔍 Initial request body contents:", {
    message: requestBody.message ? `"${String(requestBody.message).substring(0, 50)}..."` : 'MISSING',
    messageType: typeof requestBody.message,
    conversationHistory: Array.isArray(requestBody.conversationHistory) ? `Array[${requestBody.conversationHistory.length}]` : typeof requestBody.conversationHistory,
    userContext: typeof requestBody.userContext,
    provider: requestBody.provider || 'default',
    allKeys: Object.keys(requestBody)
  });

  if (!requestBody.message || typeof requestBody.message !== 'string') {
    console.error("❌ Validation failed: Message validation", {
      message: requestBody.message,
      messageType: typeof requestBody.message,
      messageLength: requestBody.message ? String(requestBody.message).length : 0
    });
    return { isValid: false, error: 'Message is required and must be a string' };
  }

  console.log("✅ Initial request body validation passed");
  return { isValid: true };
}

/**
 * Validate complete request body structure (after authentication with user_id)
 */
export function validateRequestBody(body: unknown): {
  isValid: boolean;
  error?: string;
} {
  console.log("🔍 Validating complete request body:", {
    bodyType: typeof body,
    isNull: body === null,
    isUndefined: body === undefined,
    bodyKeys: body && typeof body === 'object' ? Object.keys(body) : 'N/A'
  });

  if (!body || typeof body !== 'object') {
    console.error("❌ Validation failed: Request body is required and must be an object");
    return { isValid: false, error: 'Request body is required and must be an object' };
  }

  const requestBody = body as Record<string, unknown>;
  
  console.log("🔍 Complete request body contents:", {
    message: requestBody.message ? `"${String(requestBody.message).substring(0, 50)}..."` : 'MISSING',
    messageType: typeof requestBody.message,
    user_id: requestBody.user_id ? `"${String(requestBody.user_id).substring(0, 20)}..."` : 'MISSING',
    user_idType: typeof requestBody.user_id,
    conversationHistory: Array.isArray(requestBody.conversationHistory) ? `Array[${requestBody.conversationHistory.length}]` : typeof requestBody.conversationHistory,
    userContext: typeof requestBody.userContext,
    provider: requestBody.provider || 'default',
    allKeys: Object.keys(requestBody)
  });

  if (!requestBody.message || typeof requestBody.message !== 'string') {
    console.error("❌ Validation failed: Message validation", {
      message: requestBody.message,
      messageType: typeof requestBody.message,
      messageLength: requestBody.message ? String(requestBody.message).length : 0
    });
    return { isValid: false, error: 'Message is required and must be a string' };
  }

  if (!requestBody.user_id || typeof requestBody.user_id !== 'string') {
    console.error("❌ Validation failed: User ID validation", {
      user_id: requestBody.user_id,
      user_idType: typeof requestBody.user_id,
      user_idLength: requestBody.user_id ? String(requestBody.user_id).length : 0
    });
    return { isValid: false, error: 'User ID is required and must be a string' };
  }

  console.log("✅ Complete request body validation passed");
  return { isValid: true };
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Network timeout errors are usually recoverable
    if (error.message.includes('timeout')) return true;
    
    // Rate limit errors are recoverable with retry
    if (error.message.includes('rate limit')) return true;
    
    // Server errors (5xx) are often recoverable
    if (error.message.includes('Internal Server Error')) return true;
  }
  
  return false;
} 