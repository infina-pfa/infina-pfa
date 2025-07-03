import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { generateOnboardingSystemPrompt } from "@/lib/ai-advisor/prompts/onboarding-system-prompt";
import { onboardingFunctionTools } from "@/lib/ai-advisor/tools/onboarding-definitions";

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OnboardingStreamRequest {
  message: string;
  conversationHistory?: Array<{
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: string;
  }>;
  userProfile?: Record<string, unknown>;
  currentStep?: string;
}

export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/onboarding/ai-stream called");
  
  try {
    const requestBody: OnboardingStreamRequest = await request.json();
    
    console.log("📥 Onboarding stream request:", {
      hasMessage: !!requestBody.message,
      messageLength: requestBody.message?.length || 0,
      hasHistory: !!requestBody.conversationHistory,
      historyLength: requestBody.conversationHistory?.length || 0,
      currentStep: requestBody.currentStep || 'unknown',
      hasUserProfile: !!requestBody.userProfile
    });

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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ Authentication failed:", authError?.message || "No user found");
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    console.log("✅ User authenticated:", user.id);

    // Generate onboarding-specific system prompt
    const conversationHistory = (requestBody.conversationHistory || []).map(msg => {
      if (msg.sender === "user") {
        return { role: "user" as const, content: msg.content };
      } else {
        return { role: "assistant" as const, content: msg.content };
      }
    });

    const systemPrompt = generateOnboardingSystemPrompt(
      user.id,
      requestBody.userProfile || {},
      conversationHistory,
      requestBody.currentStep || "ai_welcome"
    );

    console.log("📝 Generated onboarding system prompt");

    // Prepare messages for Chat Completions API
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory.slice(-5), // Keep last 5 messages
      { role: "user" as const, content: requestBody.message }
    ];

    console.log("💬 Prepared messages:", {
      totalMessages: messages.length,
      systemPromptLength: systemPrompt.length
    });

    // Set up SSE headers
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    // Create readable stream
    const readable = new ReadableStream({
      async start(controller) {
        console.log("🌊 Starting onboarding chat completions stream...");
        
        try {
          // Debug logging for messages and tools
          console.log("🔧 Available onboarding tools:", onboardingFunctionTools.length);
          console.log("📝 Final messages for AI:", {
            count: messages.length,
            systemPromptLength: messages[0]?.content?.length || 0,
            lastUserMessage: messages[messages.length - 1]?.content?.substring(0, 100) + "..."
          });

          // Use Chat Completions API with streaming
          const response = await openaiClient.chat.completions.create({
            model: "gpt-4.1-2025-04-14",
            messages: messages,
            tools: onboardingFunctionTools,
            tool_choice: "auto", // Let AI decide when to use tools
            stream: true,
            temperature: 0.7
          });

          const encoder = new TextEncoder();
          let responseContent = "";
          const functionCalls: Record<string, {
            id: string;
            name: string;
            arguments: string;
            status?: "new" | "in_progress" | "done";
          }> = {};

          // Generate unique response ID
          const responseId = `resp-${Date.now()}`;
          
          // Send response created event
          const responseCreatedData = {
            type: "response_created",
            response_id: responseId,
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(responseCreatedData)}\n\n`));

          // Process streaming response
          for await (const chunk of response) {
            const choice = chunk.choices[0];
            if (!choice) continue;

            const delta = choice.delta;
            
            // Handle text content
            if (delta.content) {
              responseContent += delta.content;
              const data = {
                type: "response_output_text_streaming",
                response_id: responseId,
                content: delta.content,
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }

            // Handle function calls
            if (delta.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                const callId = toolCall.id;
                
                if (callId && !functionCalls[callId]) {
                  functionCalls[callId] = {
                    id: callId,
                    name: toolCall.function?.name || "",
                    arguments: "",
                    status: "new",
                  };
                  if(functionCalls[callId].name){
                    console.log("🔧 New onboarding function call:", callId, toolCall.function?.name);
                  }
                }

                if (callId && toolCall.function?.arguments) {
                    if(functionCalls[callId].status === "new" && functionCalls[callId].name === ""){
                        // It's possible the name will arrive in a separate chunk.
                        // We will update it if we find it.
                        functionCalls[callId].name = toolCall.function?.name || "";
                    }
                    functionCalls[callId].arguments += toolCall.function.arguments;
                    functionCalls[callId].status = "in_progress";
                } else if (callId && toolCall.function?.name && functionCalls[callId].name === "") {
                    functionCalls[callId].name = toolCall.function.name;
                }
              }
            }

            // Check if response is complete
            if (choice.finish_reason) {
              console.log("🏁 Onboarding chat completions stream finished:", choice.finish_reason);
              
              // Send text done event
              if (responseContent) {
                const textDoneData = {
                  type: "response_output_text_done",
                  content: responseContent,
                  timestamp: new Date().toISOString(),
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(textDoneData)}\n\n`));
              }

              // Process completed function calls when the model is done calling tools
              if (choice.finish_reason === "tool_calls") {
                const successfulCalls: (typeof functionCalls[string])[] = [];
                const failedCalls: { call: typeof functionCalls[string]; error: string }[] = [];

                for (const callId in functionCalls) {
                  const call = functionCalls[callId];
                  
                  try {
                    console.log(`🔧 Attempting to parse arguments for ${call.name} (${callId}):`, call.arguments);
                    const toolData = call.arguments ? JSON.parse(call.arguments) : {};
                    console.log("✅ Successfully parsed arguments for:", call.name, toolData);
                    
                    if (call.name === "show_onboarding_component") {
                      if (!toolData.component_type || !toolData.title) {
                        const errorMsg = "Missing required parameters from AI for show_onboarding_component.";
                        console.error(`❌ ${errorMsg}`, toolData);
                        const errorData = { type: "tool_error", tool_name: call.name, error: errorMsg, details: toolData };
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
                        failedCalls.push({ call, error: errorMsg });
                        continue;
                      }
                      
                      const componentId = toolData.component_id || `${toolData.component_type}-${Date.now()}`;
                      
                      const action = {
                        type: "show_component",
                        payload: {
                          componentType: toolData.component_type,
                          componentId: componentId,
                          title: toolData.title,
                          context: toolData.context || {},
                        },
                      };
                      
                      console.log("📤 Sent onboarding component action:", action.payload.componentType);
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(action)}\n\n`));
                      successfulCalls.push(call);

                    } else if (call.name === "update_onboarding_profile") {
                        const { profile_updates } = toolData;
                        if (!profile_updates) {
                          throw new Error("Missing profile_updates in tool call");
                        }
                        const { error: updateError } = await supabase.from("users").update(profile_updates).eq('user_id', user.id);
                        if (updateError) throw new Error(`Supabase error updating profile: ${updateError.message}`);
                        console.log("✅ Profile updated successfully for user:", user.id);
                        successfulCalls.push(call);

                    } else if (call.name === "complete_onboarding") {
                        const { error: updateError } = await supabase.from("users").update({ onboarding_completed: true, onboarding_completed_at: new Date().toISOString() }).eq('user_id', user.id);
                        if (updateError) throw new Error(`Supabase error completing onboarding: ${updateError.message}`);
                        console.log("✅ Onboarding completed for user:", user.id);
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "onboarding_complete" })}\n\n`));
                        successfulCalls.push(call);
                        
                    } else {
                      console.log(`✅ Function call ${call.name} not handled explicitly, assuming success.`);
                      successfulCalls.push(call);
                    }

                  } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error(`❌ Error processing tool call ${call.name} (${call.id}):`, errorMessage);
                    const errorData = { type: "tool_error", tool_name: call.name, error: `Error processing tool call: ${errorMessage}` };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
                    failedCalls.push({ call, error: errorMessage });
                  }
                }
                
                console.log("📊 Function calls summary:", `${successfulCalls.length}/${Object.keys(functionCalls).length} completed successfully`);
              }

              // After processing, send done event and close
              const doneData = {
                type: "response_done",
                response_id: responseId,
                reason: choice.finish_reason,
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneData)}\n\n`));
              controller.close();
              break; // Exit loop
            }
          }
        } catch (error) {
          console.error("❌ Error in onboarding stream:", error);
          // Encoder might not be initialized if error happens before stream starts
          const encoder = new TextEncoder();
          const errorData = {
            type: "error",
            message: "An unexpected error occurred during the stream.",
            details: error instanceof Error ? error.message : String(error)
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.close();
        }
      },
    });

    console.log("🚀 Returning onboarding chat completions stream");
    return new NextResponse(readable, { headers });

  } catch (error) {
    console.error('❌ Onboarding chat completions stream function error:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      context: 'onboarding_chat_completions_stream'
    }, { status: 500 });
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