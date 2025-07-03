import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import OpenAI from "npm:openai";
import { corsHeaders } from "../_shared/cors.ts";
import { RequestBody } from "./types/index.ts";
import { openaiConfig, mcpConfig, getLLMConfig, defaultProvider } from "./config/index.ts";
import { handleMCPError } from "./utils/validation.ts";
import { AIAdvisorOrchestratorService } from "./services/ai-advisor-orchestrator.service.ts";
import { MemoryManagerFactory } from "./services/memory-manager.factory.ts";
import { ERROR_MESSAGES } from "./constants/index.ts";

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: openaiConfig.apiKey,
});

// Initialize AsyncMemoryManager using factory
const memoryManager = MemoryManagerFactory.createFromEnv();

// Initialize orchestrator service
const orchestratorService = new AIAdvisorOrchestratorService(
  openaiClient,
  memoryManager,
  mcpConfig
);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: ERROR_MESSAGES.METHOD_NOT_ALLOWED }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const requestBody: RequestBody = await req.json();

    if (!requestBody.message) {
      return new Response(JSON.stringify({ error: ERROR_MESSAGES.MESSAGE_REQUIRED }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine which LLM provider to use
    const selectedProvider = requestBody.provider || defaultProvider;
    const llmConfig = getLLMConfig(selectedProvider);



    // Create a readable stream
    const readable = new ReadableStream({
      async start(controller) {
        try {
          await orchestratorService.processRequest(
            requestBody,
            llmConfig,
            controller
          );
        } catch (error) {
          console.error('❌ Streaming error:', error);
          handleMCPError(error, 'streaming');
          
          const encoder = new TextEncoder();
          const errorData = {
            type: "error",
            error:
              error instanceof Error
                ? error.message
                : "Unknown streaming error",
            timestamp: new Date().toISOString(),
            context: 'streaming_response',
            provider: selectedProvider
          };

          const message = `data: ${JSON.stringify(errorData)}\n\n`;
          controller.enqueue(encoder.encode(message));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(readable, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
      }
    });
    
  } catch (error) {
    console.error('❌ Function error:', error);
    handleMCPError(error, 'main function');
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      context: 'ai_advisor_stream_function',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});