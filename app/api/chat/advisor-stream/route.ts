import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";

// Import migrated AI advisor system
import { AIAdvisorOrchestratorService } from "@/lib/ai-advisor/services/ai-advisor-orchestrator.service";
import { MemoryManagerFactory } from "@/lib/ai-advisor/services/memory-manager.factory";
import { openaiConfig, mcpConfig, getLLMConfig, defaultProvider, memoryEnabled } from "@/lib/ai-advisor/config/index";
import { validateInitialRequestBody, validateRequestBody, handleMCPError } from "@/lib/ai-advisor/utils/validation";
import { RequestBody } from "@/lib/ai-advisor/types/index";

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: openaiConfig.apiKey,
});

// Initialize AsyncMemoryManager using factory (with safe fallback)
let memoryManager = null;
if (memoryEnabled) {
  try {
    memoryManager = MemoryManagerFactory.createFromEnv();
    console.log("✅ Memory manager initialized successfully");
  } catch (error) {
    console.warn("⚠️ Memory manager initialization failed, continuing without memory:", error);
    memoryManager = null;
  }
} else {
  console.log("ℹ️ Memory is disabled via configuration");
}

// Initialize orchestrator service
const orchestratorService = new AIAdvisorOrchestratorService(
  openaiClient,
  memoryManager,
  mcpConfig
);

export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/chat/advisor-stream called");
  
  try {
    console.log("📥 Parsing request body...");
    const requestBody = await request.json();
    
    console.log("📋 Raw request body received:", {
      bodyType: typeof requestBody,
      keys: requestBody && typeof requestBody === 'object' ? Object.keys(requestBody) : 'none',
      hasMessage: !!requestBody?.message,
      messageLength: requestBody?.message ? requestBody.message.length : 0,
      hasConversationHistory: !!requestBody?.conversationHistory,
      historyLength: Array.isArray(requestBody?.conversationHistory) ? requestBody.conversationHistory.length : 0,
      hasUserContext: !!requestBody?.userContext,
      provider: requestBody?.provider || 'not specified'
    });

    // Validate initial request body (before authentication)
    console.log("🔍 Starting initial request validation...");
    const initialValidation = validateInitialRequestBody(requestBody);
    if (!initialValidation.isValid) {
      console.error("❌ Initial request validation failed:", initialValidation.error);
      return NextResponse.json({ error: initialValidation.error }, { status: 400 });
    }
    console.log("✅ Initial request validation passed");

    // Create Supabase client for authentication
    console.log("🔐 Creating Supabase client for authentication...");
    const cookieStore = await cookies();
    
    console.log("🍪 Cookies available:", {
      cookieCount: cookieStore.getAll().length,
      cookieNames: cookieStore.getAll().map(c => c.name)
    });
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component context
            }
          },
        },
      }
    );

    // Get current user
    console.log("👤 Getting current user from Supabase...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log("🔐 Authentication result:", {
      hasUser: !!user,
      userId: user?.id ? `${user.id.substring(0, 8)}...` : 'none',
      userEmail: user?.email || 'none',
      authError: authError?.message || 'none'
    });

    if (authError || !user) {
      console.error("❌ Authentication failed:", authError?.message || "No user found");
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Prepare request with user ID
    console.log("📝 Preparing AI advisor request...");
    const aiAdvisorRequest: RequestBody = {
      ...requestBody,
      user_id: user.id
    };

    // Validate complete request body (after authentication)
    console.log("🔍 Starting complete request validation...");
    const completeValidation = validateRequestBody(aiAdvisorRequest);
    if (!completeValidation.isValid) {
      console.error("❌ Complete request validation failed:", completeValidation.error);
      return NextResponse.json({ error: completeValidation.error }, { status: 400 });
    }
    console.log("✅ Complete request validation passed");

    console.log("📊 Final AI advisor request:", {
      hasMessage: !!aiAdvisorRequest.message,
      messageLength: aiAdvisorRequest.message?.length || 0,
      hasUserId: !!aiAdvisorRequest.user_id,
      hasConversationHistory: !!aiAdvisorRequest.conversationHistory,
      historyLength: Array.isArray(aiAdvisorRequest.conversationHistory) ? aiAdvisorRequest.conversationHistory.length : 0,
      hasUserContext: !!aiAdvisorRequest.userContext,
      provider: aiAdvisorRequest.provider || 'default'
    });

    // Determine which LLM provider to use
    const selectedProvider = requestBody.provider || defaultProvider;
    const llmConfig = getLLMConfig(selectedProvider);
    
    console.log("🤖 LLM Configuration:", {
      provider: llmConfig.provider,
      model: llmConfig.model,
      temperature: llmConfig.temperature,
      hasApiKey: !!llmConfig.apiKey
    });

    // Set up Server-Sent Events headers
    console.log("📡 Setting up SSE headers...");
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    // Create a readable stream
    console.log("🌊 Creating readable stream...");
    const readable = new ReadableStream({
      async start(controller) {
        console.log("🎬 Stream started, calling orchestrator...");
        try {
          await orchestratorService.processRequest(
            aiAdvisorRequest,
            llmConfig,
            controller
          );
          console.log("✅ Orchestrator completed successfully");
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

    console.log("🚀 Returning stream response");
    return new Response(readable, { headers });

  } catch (error) {
    console.error('❌ Function error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    handleMCPError(error, 'main function');
    
    const errorDetails = {
      error: error instanceof Error ? error.message : 'Unknown error',
      context: 'ai_advisor_stream_function',
      timestamp: new Date().toISOString(),
      errorType: error instanceof Error ? error.constructor.name : typeof error
    };
    
    console.error('❌ Returning error response:', errorDetails);
    
    return NextResponse.json(errorDetails, {
      status: 500,
    });
  }
}

export async function OPTIONS() {
  console.log("⚙️ OPTIONS request received");
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
} 