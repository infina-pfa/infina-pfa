import { openai } from "@/lib/openai";
import { ResponseDataEvent } from "@/lib/types/chat.types";
import { Message } from "openai/resources/beta/threads/messages.mjs";
import { Stream } from "openai/streaming.mjs";

/**
 * Type for OpenAI response chunk
 */
type OpenAIChunk = {
  type: string;
  response?: { id: string };
  delta?: unknown;
  item?: {
    type?: string;
    arguments?: string;
    name?: string;
  };
};

/**
 * Service for handling OpenAI streaming responses
 */
export const aiStreamingService = {
  /**
   * Create a streaming response from OpenAI
   * @param messages Array of messages to send to OpenAI
   * @returns Streaming response
   */
  async createStream(messages: Message[]) {
    return await openai.responses.create({
      model: "gpt-4.1-2025-04-14",
      input: messages,
      stream: true,
      temperature: 0.7,
      max_output_tokens: 1000,
    });
  },

  /**
   * Create a readable stream from an OpenAI streaming response
   * @param stream OpenAI streaming response
   * @returns Readable stream with SSE format
   */
  createReadableStream(stream: Stream<OpenAIChunk>) {
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
              chunk.item?.type === "function_call"
            ) {
              console.log("🔍 Function call arguments:", chunk);
              const toolData = JSON.parse(chunk.item.arguments || "{}");
              const action = {
                type: chunk.item.name || "",
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
              chunk.item?.type === "mcp_call"
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
  },
};
