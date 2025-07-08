import { NextRequest } from "next/server";
import { Message } from "openai/resources/beta/threads/messages.mjs";
import { authenticateUser } from "@/lib/middleware/auth-middleware";
import { userContextService } from "@/lib/services/user-context.service";
import { aiStreamingService } from "@/lib/services/ai-streaming.service";
import { ConversationMessage } from "@/lib/types/ai-streaming.types";
import { chatErrorHandler } from "@/lib/chat-error-handler";

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, userContext } = await request.json();

    if (!message) {
      return chatErrorHandler.missingMessageError();
    }

    // Authenticate user
    const { user, errorResponse } = await authenticateUser();
    if (errorResponse) {
      return chatErrorHandler.authenticationError();
    }

    console.log("🚀 AI Advisor Stream Function Called");
    console.log("👤 User ID:", user.id);
    console.log("📝 Message:", message);
    console.log("💬 History Length:", conversationHistory?.length || 0);

    // Prepare user context information
    const contextInfo = userContextService.formatUserContext(
      user.id,
      userContext
    );

    // Prepare conversation history
    const historyContext =
      userContextService.formatConversationHistory(conversationHistory);

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

    try {
      // Create streaming response
      const stream = await aiStreamingService.createStream(messages);

      // Return the readable stream
      return aiStreamingService.createReadableStream(stream);
    } catch (error) {
      if (error instanceof Error) {
        return chatErrorHandler.openAIError(error);
      }
      return chatErrorHandler.internalError(error);
    }
  } catch (error) {
    return chatErrorHandler.internalError(error);
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
