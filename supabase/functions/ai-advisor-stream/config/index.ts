import { MCPConfig } from "../types/index.ts";

// Declare Deno global for Supabase Edge Functions
declare global {
  interface Window {
    Deno: {
      env: {
        get(key: string): string | undefined;
      };
    };
  }
}

// For Deno runtime, Deno is available globally
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

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
  serverUrl: Deno.env.get("MCP_SERVER_URL") || "https://de85-52-77-39-125.ngrok-free.app/mcp/d263b47b-c447-4046-b3d9-90d4885b7840/sse",
  serverLabel: "personal-finance-management-tools",
  timeout: 30000, // 30 seconds
  retryAttempts: 2,
  requireApproval: "never",
  // Allow all tools from MCP server - no restrictions
  allowedTools: undefined,
  description: "Personal Finance Management Tools",
  bearerToken: Deno.env.get("MCP_BEARER_TOKEN")
};

export const openaiConfig: LLMConfig = {
  provider: 'openai',
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
  model: 'gpt-4.1-2025-04-14',
  // model: 'o3-mini',
  temperature: 0.7
};

export const geminiConfig: LLMConfig = {
  provider: 'gemini',
  apiKey: Deno.env.get("GEMINI_API_KEY") || "",
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  thinkingBudget: 0 // Disable thinking mode for faster responses
};

// Default LLM provider - can be controlled via environment variable
export const defaultProvider: LLMProvider = (Deno.env.get("DEFAULT_LLM_PROVIDER") as LLMProvider) || 'openai';

export const memoryConfig = {
  supabaseUrl: Deno.env.get("SUPABASE_URL") || "",
  supabaseKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  openaiKey: Deno.env.get("OPENAI_API_KEY") || "",
  similarityThreshold: 0.7,
  maxMemories: 10,
  cacheEnabled: true,
  backgroundPersist: true,
};

// Get active LLM configuration based on provider
export function getLLMConfig(provider?: LLMProvider): LLMConfig {
  const activeProvider = provider || defaultProvider;
  return activeProvider === 'gemini' ? geminiConfig : openaiConfig;
} 