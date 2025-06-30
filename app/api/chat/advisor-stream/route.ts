import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";

// Response data event types
enum ResponseDataEvent {
  RESPONSE_CREATED = "response_created",
  OUTPUT_TEXT_STREAMING = "response_output_text_streaming",
  OUTPUT_TEXT_DONE = "response_output_text_done",
  FUNCTION_CALL_ARGUMENTS_STREAMING = "response_function_call_arguments_streaming",
  FUNCTION_CALL_ARGUMENTS_DONE = "response_function_call_arguments_done",
  MCP_TOOL_CALLING = "mcp_tool_calling", 
  MCP_TOOL_CALL_DONE = "mcp_tool_call_done",
  MCP_TOOL_CALL_FAILED = "mcp_tool_call_failed",
  RESPONSE_COMPLETED = "response_completed",
}

enum UIActionType {
  OPEN_TOOL = "open_tool",
  SHOW_COMPONENT = "show_component",
}

interface ChatTool {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

interface ConversationMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat tools configuration
const chatTools: ChatTool[] = [
  {
    id: "budget-tool",
    name: "Công cụ Ngân sách",
    description: "Giúp người dùng tạo và quản lý ngân sách cá nhân",
    keywords: ["ngân sách", "budget", "chi tiêu", "tiết kiệm", "quản lý tiền"],
  },
  {
    id: "loan-calculator",
    name: "Công cụ tính lãi vay",
    description: "Tính toán lãi suất và lịch trả nợ cho các khoản vay",
    keywords: ["tính vay", "vay tiền", "lãi vay", "loan", "tín dụng", "trả nợ"],
  },
  {
    id: "interest-calculator",
    name: "Công cụ tính lãi tiết kiệm",
    description: "Tính toán lãi suất tiền gửi tiết kiệm",
    keywords: ["tính lãi", "lãi suất", "tiết kiệm", "interest", "tiền gửi"],
  },
  {
    id: "salary-calculator",
    name: "Công cụ tính lương",
    description: "Tính lương gross sang net và các khoản khấu trừ",
    keywords: ["tính lương", "lương net", "lương gross", "salary", "thuế thu nhập"],
  },
  {
    id: "learning-center",
    name: "Hành trình Học tập",
    description: "Hiển thị hành trình học tập thực tế của người dùng với milestone và task cụ thể",
    keywords: ["học", "kiến thức", "tài chính", "learning", "bài học", "hành trình"],
  },
];

const chatComponents = [
  {
    id: "budget-overview",
    name: "Tổng quan Ngân sách",
    description: "Hiển thị tổng quan về ngân sách của người dùng",
    keywords: ["tổng quan", "ngân sách", "chi tiêu", "thu nhập"],
  },
  {
    id: "budget-detail",
    name: "Chi tiết một ngân sách",
    description: "Hiển thị chi tiết về một ngân sách của người dùng",
    keywords: ["chi tiết", "ngân sách", "tỷ lệ chi tiêu"],
  },
];

// Tool definitions for function calling
const tools = [
  {
    type: "function" as const,
    function: {
      name: UIActionType.OPEN_TOOL,
      description: "Open a specific financial tool for the user when they need practical assistance",
      parameters: {
        type: "object",
        properties: {
          tool_id: {
            type: "string",
            description: "ID of the tool to open",
            enum: ["budget-tool", "loan-calculator", "interest-calculator", "salary-calculator", "learning-center"],
          },
          title: {
            type: "string",
            description: "Title or reason for opening the tool",
          },
          context: {
            type: "object",
            description: "Additional context or parameters for the tool",
          },
          trigger_reason: {
            type: "string",
            description: "Explanation for why this tool should be opened",
          },
        },
        required: ["tool_id", "title", "trigger_reason"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: UIActionType.SHOW_COMPONENT,
      description: "Show a specific component to the user instead of long information",
      parameters: {
        type: "object",
        properties: {
          component_id: {
            type: "string", 
            description: "ID of the component to show",
            enum: ["budget-overview", "budget-detail"],
          },
          title: {
            type: "string",
            description: "Title of the component",
          },
        },
        required: ["component_id", "title"],
      },
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, userContext } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Create Supabase client
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
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
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
- Tổng thu nhập: ${userContext.financial?.totalIncome ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(userContext.financial.totalIncome) : "Chưa có dữ liệu"}
- Tổng chi tiêu: ${userContext.financial?.totalExpenses ? new Intl.NumberFormat("vi-VN", {
        style: "currency", 
        currency: "VND",
      }).format(userContext.financial.totalExpenses) : "Chưa có dữ liệu"}
- Số lượng ngân sách: ${userContext.financial?.currentBudgets || 0}
- Đã hoàn thành onboarding: ${userContext.financial?.hasCompletedOnboarding ? "Có" : "Không"}

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
    const historyContext = conversationHistory && conversationHistory.length > 0
      ? conversationHistory.slice(-15).map((msg: ConversationMessage, index: number) => {
          return `${index + 1}. ${msg.sender === "user" ? "Người dùng" : "AI"}: ${msg.content}`;
        }).join("\n")
      : "Đây là cuộc trò chuyện đầu tiên.";

    // Prepare tools information
    const toolsInfo = [...chatTools, ...chatComponents]
      .map(tool => `Tool ID: "${tool.id}" | Tên: "${tool.name}" | Mô tả: "${tool.description}" | Từ khóa: [${tool.keywords.join(", ")}]`)
      .join("\n");

    const systemPrompt = `
<system_prompt>
    <general_info>
        <today_date>${new Date().toLocaleDateString("en-US")}</today_date>
        <user_id>${user.id}</user_id>
    </general_info>

    <identity>
        <name>Finny</name>
        <creator>Infina Financial Hub</creator>
        <description>
            You are Finny, an AI Personal Financial Advisor. Your mission is to guide users through their financial journey by providing personalized, actionable advice.
        </description>
    </identity>

    <available_tools>
        <summary>List of tools that can be activated to assist the user.</summary>
        <tools>
          ${toolsInfo}
        </tools>
    </available_tools>

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

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg: ConversationMessage) => ({
        role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Set up Server-Sent Events headers
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
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

          // Send response created event
          const responseCreatedData = {
            type: ResponseDataEvent.RESPONSE_CREATED,
            response_id: `response-${Date.now()}`,
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(responseCreatedData)}\n\n`));

          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;

            // Handle text content
            if (delta?.content) {
              responseContent += delta.content;
              const data = {
                type: ResponseDataEvent.OUTPUT_TEXT_STREAMING,
                content: delta.content,
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }

            // Handle function calls
            if (delta?.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                const callId = toolCall.id || `call_${Date.now()}`;
                
                if (!functionCalls[callId]) {
                  functionCalls[callId] = {
                    id: callId,
                    name: toolCall.function?.name || "",
                    arguments: "",
                  };
                }

                if (toolCall.function?.arguments) {
                  functionCalls[callId].arguments += toolCall.function.arguments;
                  
                  const streamingData = {
                    type: ResponseDataEvent.FUNCTION_CALL_ARGUMENTS_STREAMING,
                    timestamp: new Date().toISOString(),
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(streamingData)}\n\n`));
                }
              }
            }

            // Check if streaming is complete
            if (chunk.choices[0]?.finish_reason) {
              // Send text done event
              if (responseContent) {
                const textDoneData = {
                  type: ResponseDataEvent.OUTPUT_TEXT_DONE,
                  content: responseContent,
                  timestamp: new Date().toISOString(),
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(textDoneData)}\n\n`));
              }

              // Process completed function calls
              for (const callId in functionCalls) {
                const call = functionCalls[callId];
                try {
                  const toolData = JSON.parse(call.arguments || "{}");
                  const action = {
                    type: call.name,
                    payload: {
                      componentId: toolData.component_id,
                      toolId: toolData.tool_id,
                      title: toolData.title,
                      context: toolData.context || {},
                    },
                  };

                  const functionDoneData = {
                    type: ResponseDataEvent.FUNCTION_CALL_ARGUMENTS_DONE,
                    action,
                    timestamp: new Date().toISOString(),
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(functionDoneData)}\n\n`));
                } catch (error) {
                  console.error("Error parsing function arguments:", error);
                }
              }

              // Send completion event
              const completionData = {
                type: ResponseDataEvent.RESPONSE_COMPLETED,
                finish_reason: chunk.choices[0].finish_reason,
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));
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
            error: error instanceof Error ? error.message : "Unknown streaming error",
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
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