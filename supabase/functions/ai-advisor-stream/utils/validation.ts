import { MCPConfig, MCPError } from "../types/index.ts";

// MCP Tool Discovery and Validation
export async function validateMCPServer(config: MCPConfig): Promise<boolean> {
  try {
    console.log(`🔍 Validating MCP Server: ${config.serverUrl}`);
    
    // Basic URL validation
    const url = new URL(config.serverUrl);
    if (!url.protocol.startsWith('http')) {
      console.warn('⚠️ MCP Server URL must use HTTP/HTTPS protocol');
      return false;
    }
    
    // TODO: Add actual server health check when needed
    // For now, assume valid if URL is well-formed
    console.log('✅ MCP Server URL validation passed');
    return true;
  } catch (error) {
    console.error('❌ MCP Server validation failed:', error);
    return false;
  }
}

// Enhanced MCP Error Handling with proper typing
export function handleMCPError(error: MCPError | Error | unknown, context: string): void {
  const errorDetails = {
    message: 'Unknown MCP error',
    code: 'UNKNOWN',
    timestamp: new Date().toISOString()
  };

  if (error instanceof Error) {
    errorDetails.message = error.message;
  } else if (error && typeof error === 'object') {
    const mcpError = error as MCPError;
    errorDetails.message = mcpError.message || 'Unknown MCP error';
    errorDetails.code = mcpError.code || 'UNKNOWN';
  }

  console.error(`🔥 MCP Error in ${context}:`, errorDetails);
} 