import { MCPConfig } from "../types/index";

// LLM Provider Configuration
export type LLMProvider = 'openai' | 'gemini';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  temperature: number;
  thinkingBudget?: number; // For Gemini, 0 disables thinking mode
}

export const mcpConfig: MCPConfig = {
  enabled: true,
  serverUrl: process.env.MCP_SERVER_URL || "https://de85-52-77-39-125.ngrok-free.app/mcp/d263b47b-c447-4046-b3d9-90d4885b7840/sse",
  serverLabel: "personal-finance-management-tools",
  timeout: 30000, // 30 seconds
  retryAttempts: 2,
  requireApproval: "never",
  // Allow all tools from MCP server - no restrictions
  allowedTools: undefined,
  description: "Personal Finance Management Tools",
  bearerToken: process.env.MCP_BEARER_TOKEN
};

// Add onboarding-specific MCP configuration
export const onboardingMcpConfig: MCPConfig = {
  enabled: false, // ❌ TEMPORARILY DISABLED
  serverUrl: process.env.ONBOARDING_MCP_SERVER_URL || "https://pfa-mcp.realstake.co/mcp/d02349d2-16a9-444e-862d-3eddd978e3ce/sse",
  serverLabel: "onboarding-financial-tools",
  timeout: 30000, // 30 seconds
  retryAttempts: 2,
  requireApproval: "never",
  // Allow all tools from MCP server - no restrictions
  allowedTools: undefined,
  description: "Onboarding Financial Analysis Tools",
  bearerToken: process.env.MCP_BEARER_TOKEN || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
};

export const openaiConfig: LLMConfig = {
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY || "",
  model: 'gpt-4.1-2025-04-14',
  // model: 'o3-mini',
  temperature: 0.7
};

export const geminiConfig: LLMConfig = {
  provider: 'gemini',
  apiKey: process.env.GEMINI_API_KEY || "",
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  thinkingBudget: 0 // Disable thinking mode for faster responses
};

// Default LLM provider - can be controlled via environment variable
export const defaultProvider: LLMProvider = (process.env.DEFAULT_LLM_PROVIDER as LLMProvider) || 'openai';

// Memory can be disabled in development mode if needed
export const memoryEnabled = process.env.DISABLE_MEMORY !== 'true';

export const memoryConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  openaiKey: process.env.OPENAI_API_KEY || "",
  maxMemories: 10,
  cacheEnabled: true,
  backgroundPersist: true,
};

// Get active LLM configuration based on provider
export function getLLMConfig(provider?: LLMProvider): LLMConfig {
  const activeProvider = provider || defaultProvider;
  return activeProvider === 'gemini' ? geminiConfig : openaiConfig;
} 