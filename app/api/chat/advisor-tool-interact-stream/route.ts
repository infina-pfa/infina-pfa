import { openai } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";
import { ConversationMessage } from "@/lib/types/ai-streaming.types";
import { ResponseDataEvent } from "@/lib/types/chat.types";
import { NextRequest, NextResponse } from "next/server";
import { Message } from "openai/resources/beta/threads/messages.mjs";

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, userContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("🚀 AI Advisor Stream Function Called");
    console.log("👤 User ID:", user.id);
    console.log("📝 Message:", message);
    console.log("💬 History Length:", conversationHistory?.length || 0);

    // Prepare user context information
    const contextInfo = userContext
      ? `
Thông tin người dùng:
- User ID: ${user.id}
- Thông tin tài chính người dùng:
- Tổng thu nhập: ${
          userContext.financial?.totalIncome
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(userContext.financial.totalIncome)
            : "Chưa có dữ liệu"
        }
- Tổng chi tiêu: ${
          userContext.financial?.totalExpenses
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(userContext.financial.totalExpenses)
            : "Chưa có dữ liệu"
        }
- Số lượng ngân sách: ${userContext.financial?.currentBudgets || 0}
- Đã hoàn thành onboarding: ${
          userContext.financial?.hasCompletedOnboarding ? "Có" : "Không"
        }

Thông tin học tập:
- Level hiện tại: ${userContext.learning?.currentLevel || 1}
- Điểm kinh nghiệm: ${userContext.learning?.xp || 0}
- Mục tiêu hiện tại: ${userContext.learning?.currentGoal || "Chưa có mục tiêu"}
`
      : `
Thông tin người dùng:
- User ID: ${user.id}
- Chưa có thông tin context người dùng
`;

    // Prepare conversation history
    const historyContext =
      conversationHistory && conversationHistory.length > 0
        ? conversationHistory
            .slice(-15)
            .map((msg: ConversationMessage, index: number) => {
              return `${index + 1}. ${
                msg.sender === "user" ? "Người dùng" : "AI"
              }: ${msg.content}`;
            })
            .join("\n")
        : "Đây là cuộc trò chuyện đầu tiên.";

    const systemPrompt = `
<system_prompt>
    <general_info>
        <today_date>${new Date().toLocaleDateString("en-US")}</today_date>
        <user_id>${user.id}</user_id>
    </general_info>

    <identity>
        <name>Finny</name>
        <creator>Infina Financial Personal Advisor</creator>
        <description>
            You are Finny, an AI Personal Financial Advisor. Your mission is to guide users through their financial journey by providing personalized, actionable advice.
        </description>
    </identity>

    <input_context>
        <current_context>
            <description>Current user information to personalize advice.</description>
            <data>${contextInfo}</data>
        </current_context>
        <history_context>
            <description>Previous turns in the conversation to maintain continuity.</description>
            <data>${historyContext}</data>
        </history_context>
    </input_context>

    <response_instructions>
        <summary>Guidelines for generating responses and calling functions.</summary>
        <streaming_behavior>
            <rule id="stream_first">Always stream the text part of your response before calling a function.</rule>
            <rule id="function_at_end">Function calls should occur after streaming a useful, human-readable message.</rule>
        </streaming_behavior>
        
        <response_format>
            <mobile_first>
                - Use relevant emojis 📊💰📈.
                - Use bullet points for lists, not long paragraphs.
                - Provide clear, natural calls to action.
            </mobile_first>
            <tone_guidelines>
                - Confident but not authoritarian; friendly and approachable.
                - Avoid complex financial jargon.
                - Encourage positive action.
            </tone_guidelines>
        </response_format>
    </response_instructions>
</system_prompt>
`;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg: ConversationMessage) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // Create streaming response
    const stream = await openai.responses.create({
      model: "gpt-4.1-2025-04-14",
      input: messages,
      stream: true,
      temperature: 0.7,
      max_output_tokens: 1000,
    });

    // Set up Server-Sent Events headers
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    // Create a readable stream
    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          let responseContent = "";
          interface FunctionCall {
            id: string;
            name: string;
            arguments: string;
          }
          const functionCalls: Record<string, FunctionCall> = {};
          for await (const chunk of stream) {
            // Handle different chunk types properly for responses API
            if (!chunk || typeof chunk !== "object") {
              continue;
            }

            // Handle response creation to send response_id
            if (chunk.type === "response.created" && chunk.response?.id) {
              const data = {
                type: ResponseDataEvent.RESPONSE_CREATED,
                response_id: chunk.response.id,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            // Handle text content deltas
            if (chunk.type === "response.output_text.delta" && chunk.delta) {
              responseContent += chunk.delta;
              const data = {
                type: ResponseDataEvent.OUTPUT_TEXT_STREAMING,
                content: chunk.delta,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            if (chunk.type === "response.output_text.done") {
              const data = {
                type: ResponseDataEvent.OUTPUT_TEXT_DONE,
                content: responseContent,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            // Handle function call arguments deltas
            if (chunk.type === "response.function_call_arguments.delta") {
              const data = {
                type: ResponseDataEvent.FUNCTION_CALL_ARGUMENTS_STREAMING,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            if (chunk.type === "response.mcp_call.in_progress") {
              const data = {
                type: ResponseDataEvent.MCP_TOOL_CALLING,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            if (
              chunk.type === "response.output_item.done" &&
              chunk.item.type === "function_call"
            ) {
              console.log("🔍 Function call arguments:", chunk);
              const toolData = JSON.parse(chunk.item.arguments);
              const action = {
                type: chunk.item.name,
                payload: {
                  componentId: toolData.component_id,
                  toolId: toolData.tool_id,
                  title: toolData.title,
                  context: toolData.context || {},
                },
              };

              const data = {
                type: ResponseDataEvent.FUNCTION_CALL_ARGUMENTS_DONE,
                action,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            if (
              chunk.type === "response.output_item.done" &&
              chunk.item.type === "mcp_call"
            ) {
              const data = {
                type: ResponseDataEvent.MCP_TOOL_CALL_DONE,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            // Handle response completion - Process all completed function calls
            if (chunk.type === "response.completed") {
              console.log(
                "✅ Response completed - Processing function calls:",
                Object.keys(functionCalls).length
              );

              // Send completion event
              const completionData = {
                type: ResponseDataEvent.RESPONSE_COMPLETED,
                finish_reason: "completed",
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(completionData)}\n\n`;
              controller.enqueue(encoder.encode(message));
              break;
            }
          }

          // End the stream
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("❌ Streaming error:", error);
          const errorData = {
            type: "error",
            error:
              error instanceof Error
                ? error.message
                : "Unknown streaming error",
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(readable, { headers });
  } catch (error) {
    console.error("❌ Function error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
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
