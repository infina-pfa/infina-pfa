import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { OnboardingOrchestratorService } from "@/lib/ai-advisor/services/onboarding-orchestrator.service";
import { 
  onboardingMcpConfig, 
  getLLMConfig, 
  defaultProvider 
} from "@/lib/ai-advisor/config/index";
// Note: Orchestrator service now handles all prompt generation and tool management

interface OnboardingStreamRequest {
  message: string;
  conversationHistory?: Array<{
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: string;
  }>;
  userProfile?: Record<string, unknown>;
}

// Note: All analysis logic and tool handling is now managed by OnboardingOrchestratorService

export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/onboarding/ai-stream called - Using MCP Orchestrator");

  try {
    const requestBody: OnboardingStreamRequest = await request.json();

    // Create Supabase client for authentication
    const cookieStore = await cookies();
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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(
        "❌ Authentication failed:",
        authError?.message || "No user found"
      );
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("✅ User authenticated:", user.id);

    // 🚀 Initialize MCP-enabled Orchestrator Service
    console.log("🔧 Initializing OnboardingOrchestratorService with MCP...");
    const openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const orchestrator = new OnboardingOrchestratorService(
      openaiClient,
      onboardingMcpConfig
    );

    // Get LLM configuration
    const llmConfig = getLLMConfig(defaultProvider);

    // Get user data for stage information
    const userData = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Prepare request for orchestrator service
    const orchestratorRequest = {
      message: requestBody.message,
      conversationHistory: requestBody.conversationHistory || [],
      userProfile: {
        ...requestBody.userProfile,
        identifiedStage: userData.data?.financial_stage,
      },
      user_id: user.id,
    };

    // Note: Token metrics and system prompt logging are now managed by the orchestrator service

    // 🚀 Process request through MCP-enabled orchestrator
    console.log("🌊 Starting MCP-enabled onboarding stream...");
    const readable = await orchestrator.processRequest(
      orchestratorRequest,
      llmConfig
    );

    // Set up SSE headers
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    console.log("🚀 Returning MCP-enabled onboarding stream");
    return new NextResponse(readable, { headers });
  } catch (error) {
    console.error("❌ Onboarding responses stream function error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        context: "onboarding_responses_stream",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
