import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { generateStageSpecificPrompt, validateStageCompatibility, logPromptSelection, type FinancialStage } from "@/lib/ai-advisor/prompts/prompt-orchestrator";
import { onboardingFunctionTools, validateComponentArguments } from "@/lib/ai-advisor/tools/onboarding-definitions";
import { SystemPromptLogger } from "@/lib/utils/system-prompt-logger";
import { TokenEstimator } from "@/lib/ai-advisor/utils/token-estimator";

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

interface ToolCallData {
  component_type?: string;
  title?: string;
  component_id?: string;
  context?: Record<string, unknown>;
  profile_updates?: Record<string, unknown>;
  profile_data?: Record<string, unknown>;
  trigger_completion?: boolean;
}

// Type definitions for OpenAI Responses API events
interface FunctionCallItem {
  id: string;
  name: string;
  call_id: string;
  type: "function_call";
}

interface ResponseOutputItemAddedEvent {
  type: "response.output_item.added";
  item: FunctionCallItem;
}

interface FunctionCallArgumentsDoneEvent {
  type: "response.function_call_arguments.done";
  item_id: string;
  arguments: string;
}

// Convert function tools to Responses API format (flatten structure)
const convertToolsForResponsesAPI = (tools: typeof onboardingFunctionTools) => {
  return tools.map(tool => ({
    type: "function" as const,
    name: tool.function.name,
    description: tool.function.description,
    parameters: tool.function.parameters,
    strict: false
  }));
};

// Financial stage analysis logic (extracted from analyze-stage route)
interface ProfileData {
  name?: string;
  age?: number;
  income?: number;
  expenses?: number;
  currentDebts?: number;
  savings?: number;
  investmentExperience?: "none" | "beginner" | "intermediate" | "advanced";
  primaryFinancialGoal?: string;
  riskTolerance?: string;
}

const FINANCIAL_STAGES = {
  survival: {
    name: "Survival Stage",
    description: "Focus on stopping cash bleed and basic financial stability"
  },
  debt: {
    name: "Debt Elimination", 
    description: "Priority on eliminating high-interest debt"
  },
  foundation: {
    name: "Foundation Building",
    description: "Building emergency fund and financial foundation"
  },
  investing: {
    name: "Investing Stage",
    description: "Ready to start building wealth through investments"
  },
  optimizing: {
    name: "Optimizing Assets",
    description: "Optimizing investment portfolio and tax efficiency"
  },
  protecting: {
    name: "Protecting Assets", 
    description: "Focus on insurance and asset protection"
  },
  retirement: {
    name: "Retirement Planning",
    description: "Advanced retirement and estate planning"
  }
} as const;

function fallbackStageAnalysis(profile: ProfileData) {
  const income = profile.income || 0;
  const expenses = profile.expenses || 0;
  const debts = profile.currentDebts || 0;
  const savings = profile.savings || 0;

  // Stage 0: Survival - negative cash flow
  if (income < expenses) {
    return {
      stage: "survival",
      confidence: 0.8,
      reasoning: "Negative cash flow indicates immediate need for financial stabilization and expense reduction"
    };
  }

  // Stage 1: Debt - has significant high-interest debt
  if (debts > income * 0.3) {
    return {
      stage: "debt",
      confidence: 0.7,
      reasoning: "High debt-to-income ratio (>30%) suggests prioritizing debt elimination before other financial goals"
    };
  }

  // Stage 2: Foundation - little to no emergency fund
  const monthlyExpenses = expenses;
  const emergencyFundMonths = monthlyExpenses > 0 ? savings / monthlyExpenses : 0;
  
  if (emergencyFundMonths < 3) {
    return {
      stage: "foundation",
      confidence: 0.7,
      reasoning: "Insufficient emergency fund (<3 months expenses) indicates need for foundation building before investing"
    };
  }

  // Stage 3: Investing - has good foundation, ready to invest
  if (emergencyFundMonths >= 3 && profile.investmentExperience === "none") {
    return {
      stage: "investing",
      confidence: 0.6,
      reasoning: "Good financial foundation established, ready to begin wealth building through investments"
    };
  }

  // Stage 4: Optimizing - experienced investor with substantial assets
  if (profile.investmentExperience === "intermediate" || profile.investmentExperience === "advanced") {
    return {
      stage: "optimizing",
      confidence: 0.6,
      reasoning: "Investment experience suggests focus on portfolio optimization and tax efficiency"
    };
  }

  // Default to foundation building
  return {
    stage: "foundation",
    confidence: 0.5,
    reasoning: "Based on available information, foundation building appears most appropriate"
  };
}

async function analyzeFinancialStageLogic(profile: ProfileData): Promise<{
  success: boolean;
  data?: { stage: string; confidence: number; reasoning: string };
  error?: string;
}> {
  try {
    // Use AI to analyze financial stage
    const analysisPrompt = `
      Analyze this user's financial profile and determine their appropriate financial stage:

      User Profile:
      - Name: ${profile.name || 'Not provided'}
      - Age: ${profile.age || 'Not provided'}
      - Monthly Income: ${profile.income ? `${profile.income.toLocaleString()} VND` : 'Not provided'}
      - Monthly Expenses: ${profile.expenses ? `${profile.expenses.toLocaleString()} VND` : 'Not provided'} 
      - Current Debts: ${profile.currentDebts ? `${profile.currentDebts.toLocaleString()} VND` : 'Not provided'}
      - Current Savings: ${profile.savings ? `${profile.savings.toLocaleString()} VND` : 'Not provided'}
      - Investment Experience: ${profile.investmentExperience || 'Not provided'}
      - Primary Financial Goal: ${profile.primaryFinancialGoal || 'Not provided'}
      - Risk Tolerance: ${profile.riskTolerance || 'Not provided'}

      Available Financial Stages:
      ${Object.entries(FINANCIAL_STAGES).map(([key, stage]) => 
        `- ${key}: ${stage.name} - ${stage.description}`
      ).join('\n')}

      Based on this profile, determine:
      1. The most appropriate financial stage (survival, debt, foundation, investing, optimizing, protecting, retirement)
      2. Confidence level (0.0 to 1.0)
      3. Clear reasoning for this classification

      Respond in JSON format:
      {
        "stage": "stage_key",
        "confidence": 0.8,
        "reasoning": "Detailed explanation of why this stage was selected"
      }
    `;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4.1-2025-04-14",
      messages: [
        {
          role: "system",
          content: "You are a financial advisor AI that analyzes user profiles to determine their appropriate financial stage. Always respond with valid JSON only."
        },
        {
          role: "user", 
          content: analysisPrompt
        }
      ],
      temperature: 0.3
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content || "{}");

    return {
      success: true,
      data: analysisResult
    };

  } catch (aiError) {
    console.error("AI Analysis failed, using fallback logic:", aiError);
    
    // Fallback to rule-based analysis
    const fallbackResult = fallbackStageAnalysis(profile);
    
    return {
      success: true,
      data: fallbackResult
    };
  }
}

// Helper function to create well-formatted error objects
const createToolError = (toolName: string, errorMessage: string, details?: Record<string, unknown>) => {
  const safeErrorMessage = errorMessage || "Unknown error occurred";
  const safeToolName = toolName || "unknown_tool";
  
  return {
    type: "tool_error",
    tool_name: safeToolName,
    error: safeErrorMessage,
    details: details || {},
    timestamp: new Date().toISOString()
  };
};

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

    // // 🔍 DEBUG: Log detailed conversation history received from client
    // if (requestBody.conversationHistory && requestBody.conversationHistory.length > 0) {
    //   console.log("📋 Detailed conversation history received from client:");
    //   requestBody.conversationHistory.forEach((msg, index) => {
    //     console.log(`${index + 1}. [${msg.sender}] (${msg.id}): "${msg.content}" (${msg.content?.length || 0} chars)`);
    //   });
      
    //   // Check for potential truncation or filtering issues
    //   const emptyMessages = requestBody.conversationHistory.filter(msg => !msg.content || msg.content.length < 5);
    //   if (emptyMessages.length > 0) {
    //     console.warn(`⚠️ Server received ${emptyMessages.length} messages with empty/short content:`, emptyMessages);
    //   }
    // } else {
    //   console.log("📋 No conversation history received from client");
    // }

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

    // Use conversation history from current session (request body)
    const completeConversationHistory = (requestBody.conversationHistory || []).map(msg => ({
      role: msg.sender === "user" ? "user" as const : "assistant" as const,
      content: msg.content
    }));

    console.log(`📥 Using session conversation history: ${completeConversationHistory.length} messages`);

    // Generate stage-specific system prompt based on user's identified financial stage
    // The conversation history will be passed separately in the input field
    const systemInstructions = generateStageSpecificPrompt({
      userId: user.id,
      userProfile: requestBody.userProfile || {},
      conversationHistory: [], // Empty array - conversation history goes to input field instead
      currentStep: requestBody.currentStep || "ai_welcome"
    });

    // Validate stage compatibility and log prompt selection for debugging
    const identifiedStage = (requestBody.userProfile?.identifiedStage || 'none') as FinancialStage;
    if (identifiedStage !== 'none') {
      const stageValidation = validateStageCompatibility(identifiedStage, requestBody.userProfile || {});
      if (!stageValidation.isValid) {
        console.warn('⚠️ Stage compatibility issue:', stageValidation);
      }
    }
    
    logPromptSelection(
      user.id, 
      identifiedStage, 
      identifiedStage === 'none' ? 'onboarding' : `${identifiedStage}_stage`,
      requestBody.userProfile || {}
    );

    console.log("📝 Generated onboarding system instructions (no history embedded)");

    // Prepare input for Responses API - include complete conversation history + current message
    // No system message in input - it will be passed via instructions field
    const input = [
      ...completeConversationHistory, // Include complete conversation history
      { role: "user" as const, content: requestBody.message }
    ];

    // Convert tools for Responses API format
    const responsesApiTools = convertToolsForResponsesAPI(onboardingFunctionTools);

    // Calculate token metrics for cost tracking and monitoring
    const systemInstructionsTokens = TokenEstimator.estimateTokensAdvanced(systemInstructions);
    const inputTokens = TokenEstimator.estimateInputTokensFromMessages(input);
    const toolTokens = TokenEstimator.estimateToolTokens(responsesApiTools);
    const totalInputTokens = systemInstructionsTokens + inputTokens + toolTokens;

    // Log system prompt to file for debugging (with token metrics)
    const requestId = await SystemPromptLogger.logSystemPrompt({
      userId: user.id,
      currentStep: requestBody.currentStep || "ai_welcome",
      userProfile: requestBody.userProfile,
      conversationHistory: completeConversationHistory,
      systemPrompt: systemInstructions,
      userMessage: requestBody.message,
    });

    // Also log summary for daily tracking
    await SystemPromptLogger.logPromptSummary({
      userId: user.id,
      currentStep: requestBody.currentStep || "ai_welcome",
      promptLength: systemInstructions.length,
      userMessage: requestBody.message,
      requestId,
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
        console.log("🌊 Starting onboarding responses stream...");
        
        try {
          // Debug logging for input and tools
          console.log("🔧 Available onboarding tools:", responsesApiTools.length);
          console.log("📝 Final input for AI:", {
            inputMessagesCount: input.length,
            lastUserMessage: input[input.length - 1]?.content?.substring(0, 100) + "...",
            hasCompleteHistory: completeConversationHistory.length > 0,
            tokenMetrics: {
              systemInstructionsTokens,
              inputMessagesTokens: inputTokens,
              toolTokens,
              totalEstimatedInputTokens: totalInputTokens
            }
          });

          // Use Responses API with streaming - instructions field for system prompt
          const stream = await openaiClient.responses.create({
            model: "gpt-4.1-2025-04-14",
            instructions: systemInstructions, // System prompt goes here instead of input
            input: input, // Only conversation history + current message
            tools: responsesApiTools,
            stream: true,
            temperature: 0.7,
          });

          const encoder = new TextEncoder();
          let responseContent = "";
          const functionCalls: Record<string, {
            id: string;
            name: string;
            arguments: string;
            call_id: string;
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

          // Process streaming response from Responses API
          for await (const event of stream) {
            // Handle text streaming
            if (event.type === "response.output_text.delta") {
              responseContent += event.delta;
              const data = {
                type: "response_output_text_streaming",
                response_id: responseId,
                content: event.delta,
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }

            // Handle function call item added
            if (event.type === "response.output_item.added") {
              const typedEvent = event as ResponseOutputItemAddedEvent;
              if (typedEvent.item?.type === "function_call") {
                const functionCall = typedEvent.item;
                functionCalls[functionCall.id] = {
                  id: functionCall.id,
                  name: functionCall.name,
                  arguments: "",
                  call_id: functionCall.call_id,
                  status: "new",
                };
                console.log("🔧 New onboarding function call:", functionCall.id, functionCall.name);
              }
            }

            // Handle function call arguments completion
            if (event.type === "response.function_call_arguments.done") {
              const typedEvent = event as FunctionCallArgumentsDoneEvent;
              const itemId = typedEvent.item_id;
              if (functionCalls[itemId]) {
                functionCalls[itemId].arguments = typedEvent.arguments;
                functionCalls[itemId].status = "done";
                console.log(`🔧 Function call arguments complete for ${functionCalls[itemId].name} (${itemId}):`, typedEvent.arguments);
              }
            }

            // Handle response completion
            if (event.type === "response.completed") {
              console.log("🏁 Onboarding responses stream finished");
              
              // Send final text content if any exists
              if (responseContent) {
                const textDoneData = {
                  type: "response_output_text_done",
                  content: responseContent,
                  timestamp: new Date().toISOString(),
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(textDoneData)}\n\n`));
              }

              // Process any complete function calls
              const successfulCalls: (typeof functionCalls[string])[] = [];
              const failedCalls: { call: typeof functionCalls[string]; error: string }[] = [];

              for (const itemId in functionCalls) {
                const call = functionCalls[itemId];
                
                try {
                  console.log(`🔧 Processing function call ${call.name} (${itemId}):`);
                  console.log(`🔧 Raw arguments string: "${call.arguments}"`);
                  console.log(`🔧 Arguments length: ${call.arguments.length}`);
                  
                  // Handle empty or invalid arguments
                  let toolData: ToolCallData = {};
                  let hasValidArguments = false;
                  
                  if (call.arguments && call.arguments.trim().length > 0) {
                    try {
                      toolData = JSON.parse(call.arguments);
                      console.log("✅ Successfully parsed arguments for:", call.name, toolData);
                      
                      // Validate arguments if this is show_onboarding_component
                      if (call.name === "show_onboarding_component") {
                        const validation = validateComponentArguments(toolData);
                        if (validation.isValid) {
                          hasValidArguments = true;
                          console.log("✅ Arguments validation passed for:", call.name);
                        } else {
                          console.error(`❌ Argument validation failed for ${call.name}:`, validation.errors);
                          const errorMsg = `Invalid arguments for ${call.name}: ${validation.errors.join(", ")}`;
                          const errorData = createToolError(call.name, errorMsg, {
                            rawArguments: call.arguments,
                            validationErrors: validation.errors,
                            hint: "Please provide all required parameters: component_type, title, component_id, context"
                          });
                          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
                          failedCalls.push({ call, error: errorMsg });
                          continue;
                        }
                      } else {
                        hasValidArguments = true;
                      }
                    } catch (parseError) {
                      console.error(`❌ Failed to parse arguments for ${call.name}:`, parseError);
                      const errorMsg = `Invalid JSON arguments provided by AI for ${call.name}. Please provide valid JSON.`;
                      const errorData = createToolError(call.name, errorMsg, {
                        rawArguments: call.arguments,
                        parseError: parseError instanceof Error ? parseError.message : String(parseError),
                        hint: "Arguments must be valid JSON format"
                      });
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
                      failedCalls.push({ call, error: errorMsg });
                      continue;
                    }
                  } else {
                    console.warn(`⚠️ Empty arguments for ${call.name}, will provide defaults if possible`);
                  }
                  
                  if (call.name === "show_onboarding_component") {
                    // If we already have valid arguments, use them directly
                    if (hasValidArguments) {
                      // Ensure component_id is set
                      const componentId = toolData.component_id || `${toolData.component_type}_${Date.now()}`;
                      
                      const action = {
                        type: "show_component",
                        payload: {
                          componentType: toolData.component_type,
                          componentId: componentId,
                          title: toolData.title,
                          context: toolData.context,
                        },
                      };
                      
                      console.log("📤 Sent onboarding component action (from valid args):", action.payload.componentType, "with ID:", componentId);
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(action)}\n\n`));
                      successfulCalls.push(call);
                      continue;
                    }
                    
                    // If arguments are invalid, don't use fallbacks - just report the error
                    console.error("🔧 Invalid arguments for show_onboarding_component, not using fallbacks");
                    const errorMsg = "Component arguments validation failed. Please provide valid component parameters.";
                    const errorData = createToolError(call.name, errorMsg);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
                    failedCalls.push({ call, error: errorMsg });
                    continue;

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
                      
                  } else if (call.name === "analyze_financial_stage") {
                      const { profile_data, trigger_completion } = toolData;
                      
                      if (!profile_data) {
                        throw new Error("Missing profile_data in analyze_financial_stage call");
                      }
                      
                      console.log("🔍 Analyzing financial stage for user:", user.id);
                      
                      // Call the analysis logic directly to avoid HTTP/auth issues
                      const analysisResult = await analyzeFinancialStageLogic(profile_data);
                      
                      if (!analysisResult.success || !analysisResult.data) {
                        throw new Error(`Analysis failed: ${analysisResult.error || 'No analysis data returned'}`);
                      }
                      
                      const { stage, confidence, reasoning } = analysisResult.data;
                      
                      console.log("✅ Financial stage analysis completed:", { stage, confidence });
                       
                      // Map stage to friendly Vietnamese names
                      const stageNames: Record<string, string> = {
                        'survival': 'Tình trạng khẩn cấp (Survival)',
                        'debt': 'Xoá bỏ nợ (Debt Elimination)',
                        'foundation': 'Xây dựng nền tảng (Foundation Building)',
                        'investing': 'Đầu tư và tích luỹ (Investing)',
                        'optimizing': 'Tối ưu hóa tài sản (Optimizing Assets)',
                        'protecting': 'Bảo vệ tài sản (Protecting Assets)',
                        'retirement': 'Lập kế hoạch hưu trí (Retirement Planning)'
                      };
                       
                      const stageName = stageNames[stage] || stage.charAt(0).toUpperCase() + stage.slice(1);
                       
                      // Stream the analysis result back to the user
                      const analysisMessage = `🎯 **Phân tích tình trạng tài chính hoàn thành!**\n\n**Giai đoạn tài chính của bạn:** ${stageName}\n**Độ tin cậy:** ${Math.round(confidence * 100)}%\n\n**Lý do:** ${reasoning}\n\n${trigger_completion ? "🎉 Chúc mừng! Bạn đã hoàn thành quá trình thiết lập. Hệ thống sẽ chuyển bạn đến giao diện chính trong giây lát..." : ""}`;
                       
                      // Send the analysis result as streaming text
                      const chars = analysisMessage.split('');
                      for (let i = 0; i < chars.length; i++) {
                        const textDelta = {
                          type: "response_output_text_streaming",
                          response_id: responseId,
                          content: chars[i],
                          timestamp: new Date().toISOString(),
                        };
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(textDelta)}\n\n`));
                        
                        // Small delay to simulate natural streaming
                        await new Promise(resolve => setTimeout(resolve, 10));
                      }
                      
                      // Send text done event
                      const textDoneData = {
                        type: "response_output_text_done",
                        content: analysisMessage,
                        timestamp: new Date().toISOString(),
                      };
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(textDoneData)}\n\n`));
                      
                      // Update user profile with the analysis results
                      const profileUpdate = {
                        financial_stage: stage,
                        stage_confidence: confidence,
                        stage_reasoning: reasoning,
                        onboarding_completed: trigger_completion || false,
                        onboarding_completed_at: trigger_completion ? new Date().toISOString() : null,
                      };
                      
                      const { error: updateError } = await supabase
                        .from("users")
                        .update(profileUpdate)
                        .eq('user_id', user.id);
                      
                      if (updateError) {
                        console.error("❌ Error updating user profile:", updateError.message);
                        throw new Error(`Supabase error updating profile: ${updateError.message}`);
                      }
                      
                      console.log("✅ User profile updated with analysis results");
                      
                      // Trigger completion if requested
                      if (trigger_completion) {
                        // Small delay before completion
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        console.log("🏁 Triggering onboarding completion");
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "onboarding_complete" })}\n\n`));
                      }
                      
                      successfulCalls.push(call);
                      
                  } else {
                    console.log(`✅ Function call ${call.name} not handled explicitly, assuming success.`);
                    successfulCalls.push(call);
                  }

                } catch (error: unknown) {
                  const errorMessage = error instanceof Error ? error.message : String(error);
                  console.error(`❌ Error processing tool call ${call.name} (${call.id}):`, errorMessage);
                  const errorData = createToolError(call.name, errorMessage);
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
                  failedCalls.push({ call, error: errorMessage });
                }
              }
              
              console.log("📊 Function calls summary:", `${successfulCalls.length}/${Object.keys(functionCalls).length} completed successfully`);
            }
          }

          // Send done event and close
          const doneData = {
            type: "response_done",
            response_id: responseId,
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneData)}\n\n`));
          controller.close();
        } catch (error) {
          console.error("❌ Error in onboarding stream:", error);
          // Encoder might not be initialized if error happens before stream starts
          const encoder = new TextEncoder();
          const errorData = {
            type: "error",
            message: "An unexpected error occurred during the stream.",
            details: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.close();
        }
      },
    });

    console.log("🚀 Returning onboarding responses stream");
    return new NextResponse(readable, { headers });

  } catch (error) {
    console.error('❌ Onboarding responses stream function error:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      context: 'onboarding_responses_stream'
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