# Onboarding MCP Server Integration

## Overview
The onboarding flow now includes Model Context Protocol (MCP) server integration, allowing the AI to access external tools and services during the onboarding process. This follows the same architecture pattern as the advisor stream.

## Architecture

### MCP Configuration
- **Onboarding MCP Config**: `lib/ai-advisor/config/index.ts`
  - Default URL: `https://pfa-mcp.realstake.co/mcp/d02349d2-16a9-444e-862d-3eddd978e3ce/sse`
  - Environment variable: `ONBOARDING_MCP_SERVER_URL`
  - Bearer token support: `ONBOARDING_MCP_BEARER_TOKEN`

### Core Components

#### OnboardingOrchestratorService
- **Location**: `lib/ai-advisor/services/onboarding-orchestrator.service.ts`
- **Purpose**: Orchestrates the complete onboarding flow with MCP tools integration
- **Features**:
  - MCP server configuration
  - OpenAI Responses API with streaming
  - Error handling and validation
  - **Note**: Memory management is disabled for onboarding to keep it lightweight

#### Updated Onboarding Route
- **Location**: `app/api/onboarding/ai-stream/route.ts`
- **Changes**:
  - Replaced manual stream processing with orchestrator service
  - Added MCP configuration support
  - Integrated memory management
  - Simplified error handling

## Key Features

### 1. MCP Tools Integration
- MCP tools are automatically available when the MCP server is configured
- Tools are passed to the OpenAI Responses API via `mcp_servers` configuration
- No manual tool registration required - tools are discovered dynamically

### 2. Simplified Flow (No Memory Management)
- Memory management is intentionally disabled for onboarding
- Keeps the onboarding flow lightweight and fast
- Each conversation starts fresh without historical context

### 3. Streaming Support
- Real-time streaming of AI responses
- MCP tool call progress indicators
- Function call handling with proper error reporting

### 4. Error Handling
- Centralized error handling via `handleMCPError`
- Request validation before processing
- Graceful fallbacks when MCP server is unavailable

## Configuration

### Environment Variables
```bash
# Onboarding MCP Server
ONBOARDING_MCP_SERVER_URL=https://pfa-mcp.realstake.co/mcp/d02349d2-16a9-444e-862d-3eddd978e3ce/sse
MCP_BEARER_TOKEN=your_bearer_token_here

# LLM Configuration
DEFAULT_LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_key

# Note: Memory management is disabled for onboarding
```

### MCP Server Configuration
```typescript
export const onboardingMcpConfig: MCPConfig = {
  enabled: true,
  serverUrl: process.env.ONBOARDING_MCP_SERVER_URL || "https://pfa-mcp.realstake.co/mcp/d02349d2-16a9-444e-862d-3eddd978e3ce/sse",
  serverLabel: "onboarding-financial-tools",
  timeout: 30000,
  retryAttempts: 2,
  requireApproval: "never",
  allowedTools: undefined, // Allow all tools
  description: "Onboarding Financial Analysis Tools",
  bearerToken: process.env.ONBOARDING_MCP_BEARER_TOKEN
};
```

## Usage

### Client-Side Integration
The onboarding flow automatically uses MCP tools when available. No changes are required to existing onboarding components.

### MCP Tool Calls
MCP tools are called automatically by the AI when needed. The streaming response includes:
- `mcp_tool_calling`: When an MCP tool is being invoked
- `mcp_tool_call_done`: When an MCP tool call completes
- `mcp_tool_call_failed`: When an MCP tool call fails

### Event Flow
1. User sends message to `/api/onboarding/ai-stream`
2. Request is validated and authenticated
3. OnboardingOrchestratorService processes the request
4. OpenAI Responses API streams response with MCP tools available
5. Client receives streaming response with tool calls and text

## Benefits

### 1. Enhanced Functionality
- Access to external financial analysis tools
- Dynamic tool discovery from MCP server
- Real-time financial data integration

### 2. Consistent Architecture
- Same pattern as advisor stream for maintainability
- Reusable orchestrator service pattern
- Centralized MCP configuration

### 3. Scalability
- Easy to add new MCP servers
- Tool-specific configuration options
- Environment-based configuration

## Migration Notes

### From Previous Implementation
The previous manual stream processing has been replaced with the orchestrator service:
- ✅ MCP tools now available
- ✅ Memory management disabled for lightweight onboarding
- ✅ Cleaner error handling
- ✅ Consistent with advisor stream architecture

### Backward Compatibility
- All existing onboarding functionality preserved
- No changes required to client-side code
- Same API endpoints and response format

## Troubleshooting

### Common Issues
1. **MCP Server Unreachable**: Check network connectivity and server URL
2. **Authentication Errors**: Verify bearer token configuration
3. **Tool Discovery**: Ensure MCP server is properly configured and running

### Debugging
- Enable detailed logging by checking console output
- MCP errors are handled via `handleMCPError` with proper context
- No memory management in onboarding simplifies debugging

## 🚀 Implementation Status

✅ **Fixed MCP Integration**: The implementation has been corrected to properly integrate MCP tools following OpenAI's Responses API specification.

**Key Fix Applied:**
- ❌ Removed invalid `mcp_servers` parameter that was causing "unknown parameter" error
- ✅ Added MCP tools correctly to the `tools` array alongside function tools
- ✅ MCP tools are now properly configured as per OpenAI documentation

**Current Status:**
- ✅ MCP server configuration added
- ✅ Memory management disabled for lightweight onboarding  
- ✅ Tools array properly configured with both function and MCP tools
- ✅ Error handling and logging in place

**To test the integration:**
1. Set the environment variables:
   ```bash
   ONBOARDING_MCP_SERVER_URL=https://pfa-mcp.realstake.co/mcp/d02349d2-16a9-444e-862d-3eddd978e3ce/sse
   MCP_BEARER_TOKEN=your_bearer_token_here
   ```
2. Start the onboarding flow
3. The AI will automatically have access to MCP tools for enhanced financial analysis

The implementation now correctly follows OpenAI's MCP specification and should work without the previous "unknown parameter" error.

## Future Enhancements
- Multiple MCP server support for onboarding
- Tool-specific permission controls
- Enhanced error recovery mechanisms
- Performance monitoring and metrics 