import { MCPConfig, MCPTool, FunctionTool } from "../types/index.ts";
import { validateMCPServer } from "../utils/validation.ts";

// MCP tool names will be discovered dynamically by clients
const mcpToolNames: string[] = [];

export async function setupMCPTools(
  mcpConfig: MCPConfig,
  functionTools: FunctionTool[]
): Promise<(FunctionTool | MCPTool)[]> {
  const mcpTools: MCPTool[] = [];
  
  if (mcpConfig.enabled) {
    console.log("🔧 Initializing MCP Integration...");
    
    const isValidServer = await validateMCPServer(mcpConfig);
    
    if (isValidServer) {
      // Create the MCP tool configuration
      const mcpTool: MCPTool = {
        type: "mcp" as const,
        server_label: mcpConfig.serverLabel,
        server_url: mcpConfig.serverUrl,
        require_approval: mcpConfig.requireApproval,
        allowed_tools: mcpConfig.allowedTools,
        headers: mcpConfig.bearerToken ? {
          'Authorization': `Bearer ${mcpConfig.bearerToken}`,
          'Accept': 'text/event-stream'
        } : undefined
      };

      mcpTools.push(mcpTool);
      
      // Note: MCP tool names will be discovered dynamically by Gemini client
      // during tools conversion process using proper HTTP+SSE transport
      console.log("ℹ️ MCP tools will be discovered dynamically during conversation");
      
      if (mcpConfig.bearerToken) {
        console.log("🔐 Bearer authentication configured for MCP server");
      }
      
      console.log("✅ MCP Server configured successfully:", {
        serverLabel: mcpConfig.serverLabel,
        serverUrl: mcpConfig.serverUrl,
        allowedTools: mcpConfig.allowedTools ? mcpConfig.allowedTools.length : 'all available',
        requireApproval: mcpConfig.requireApproval,
        hasAuth: !!mcpConfig.bearerToken,
        discoveredTools: mcpToolNames.length
      });
    } else {
      console.warn("⚠️ MCP Server validation failed - Continuing with UI tools only");
    }
  } else {
    console.log("ℹ️ MCP Integration disabled - Using UI tools only");
  }

  // Combine existing function tools with MCP tools
  const allTools: (FunctionTool | MCPTool)[] = [...functionTools, ...mcpTools];

  // Enhanced Debug Logging
  console.log("🛠️ Tools Configuration:", {
    totalTools: allTools.length,
    functionTools: functionTools.length,
    mcpTools: mcpTools.length,
    mcpEnabled: mcpConfig.enabled,
    mcpServerUrl: mcpConfig.serverUrl,
    mcpToolNames: mcpToolNames,
    toolBreakdown: allTools.map(tool => ({ 
      type: tool.type, 
      identifier: tool.type === 'function' ? tool.name : tool.server_label
    }))
  });

  return allTools;
}

// Helper function to check if a tool name is an MCP tool
export function isMCPToolName(toolName: string): boolean {
  return mcpToolNames.includes(toolName);
}

// Get all discovered MCP tool names
export function getMCPToolNames(): string[] {
  return [...mcpToolNames];
} 