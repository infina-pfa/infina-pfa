import {
  ChatMessage,
  MessageType,
  UIAction,
  UIActionType,
  UseAIAdvisorStreamProcessorOptions,
  UseAIAdvisorStreamProcessorReturn,
} from "@/lib/types/chat.types";
import { StreamEvent } from "@/lib/types/streaming.types";
import { useCallback, useRef, useState } from "react";

const getMessageType = (action: UIAction): MessageType => {
  if (action.type === UIActionType.SHOW_COMPONENT) {
    return "component";
  }

  if (action.type === UIActionType.OPEN_TOOL) {
    return "tool";
  }

  return "text";
};

export const useAIAdvisorStreamProcessor = ({
  userId,
  onMessageComplete = () => {},
  onFunctionToolComplete = () => {},
  onMessageStreaming = () => {},
  onMessageUpdate = () => {},
}: UseAIAdvisorStreamProcessorOptions): UseAIAdvisorStreamProcessorReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMCPLoading, setIsMCPLoading] = useState(false);
  const conversationIdRef = useRef<string>("");

  // Refs to track current streaming states
  const currentTextMessageRef = useRef<ChatMessage | null>(null);
  const currentToolMessageRef = useRef<ChatMessage | null>(null);
  const responseIdRef = useRef<string>("");

  const createStreamingMessage = useCallback(
    (
      content: string,
      isStreaming: boolean = false,
      action?: UIAction
    ): ChatMessage => {
      const message: ChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId,
        conversation_id: conversationIdRef.current,
        content,
        sender: "ai",
        type: action ? getMessageType(action) : "text",
        metadata: action
          ? JSON.parse(
              JSON.stringify({
                isStreaming,
                isComplete: !isStreaming,
                action,
              })
            )
          : null,
        isStreaming,
        streamingContent: isStreaming ? content : undefined,
      };

      return message;
    },
    [userId]
  );

  const updateStreamingMessage = useCallback(
    (
      message: ChatMessage,
      updates: {
        type?: MessageType;
        content?: string;
        isStreaming?: boolean;
        isComplete?: boolean;
        action?: UIAction;
      }
    ): ChatMessage => {
      const currentMetadata =
        (message.metadata as Record<string, unknown>) || {};

      const updatedMessage: ChatMessage = {
        ...message,
        content: updates.content ?? message.content,
        metadata: JSON.parse(
          JSON.stringify({
            ...currentMetadata,
            isStreaming: updates.isStreaming ?? currentMetadata.isStreaming,
            isComplete: updates.isComplete ?? currentMetadata.isComplete,
            action: updates.action ?? currentMetadata.action,
          })
        ),
        isStreaming: updates.isStreaming ?? message.isStreaming,
        streamingContent: updates.isStreaming
          ? updates.content ?? message.content
          : undefined,
        type: updates.type ?? message.type,
        updated_at: new Date().toISOString(),
      };

      return updatedMessage;
    },
    []
  );

  // Add ref to track full content accumulation
  const fullContentRef = useRef<string>("");

  const processStreamEvent = useCallback(
    (event: StreamEvent) => {
      // Handle status events
      if (event.type === "status" && event.data?.status_type === "started") {
        setIsProcessing(false);
        setIsStreaming(true);
        // Initialize message if needed
        if (!currentTextMessageRef.current) {
          const newMessage = createStreamingMessage("", true);
          currentTextMessageRef.current = newMessage;
          onMessageStreaming(newMessage);
        }
        return;
      }

      // Handle text streaming
      if (event.type === "text" && event.content) {
        setIsStreaming(true);
        fullContentRef.current += event.content;

        if (!currentTextMessageRef.current) {
          const newMessage = createStreamingMessage(
            fullContentRef.current,
            true
          );
          currentTextMessageRef.current = newMessage;
          onMessageStreaming(newMessage);
        } else {
          const updatedMessage = updateStreamingMessage(
            currentTextMessageRef.current,
            {
              content: fullContentRef.current,
              isStreaming: true,
            }
          );
          currentTextMessageRef.current = updatedMessage;
          onMessageUpdate(updatedMessage.id, updatedMessage);
        }
        return;
      }

      // Handle text completion
      if (
        event.type === "status" &&
        event.data?.status_type === "text_completed"
      ) {
        if (currentTextMessageRef.current && event.content) {
          const completedMessage = updateStreamingMessage(
            currentTextMessageRef.current,
            {
              content: event.content || fullContentRef.current,
              isStreaming: false,
              isComplete: true,
            }
          );
          onMessageUpdate(completedMessage.id, completedMessage);
          onMessageComplete(completedMessage);

          // Reset for next message
          currentTextMessageRef.current = null;
          fullContentRef.current = "";
          setIsStreaming(false);
          setIsProcessing(false);
        }
        return;
      }

      // Handle function calls (components)
      if (event.type === "function_call" && event.data) {
        const functionArgs = event.data.function_args;
        if (functionArgs.component_id) {
          // Create UI action from function args
          const action: UIAction = {
            type:
              event.data.function_name === "open_tool"
                ? UIActionType.OPEN_TOOL
                : UIActionType.SHOW_COMPONENT,
            payload: {
              componentId: functionArgs.component_id,
              title: functionArgs.title,
              context: functionArgs.context,
            },
          };

          const componentMessage = createStreamingMessage(
            event.content || "",
            false,
            action
          );

          onMessageStreaming(componentMessage);
          onMessageComplete(componentMessage);
          onFunctionToolComplete(action);
        }
        return;
      }

      // Handle MCP tool events
      if (event.type === "mcp_call") {
        setIsMCPLoading(true);
        return;
      }

      if (event.type === "mcp_result") {
        setIsMCPLoading(false);
        return;
      }

      // Handle completion
      if (event.type === "complete") {
        // Clean up any remaining streaming messages
        if (currentTextMessageRef.current) {
          const completedMessage = updateStreamingMessage(
            currentTextMessageRef.current,
            {
              content:
                fullContentRef.current || currentTextMessageRef.current.content,
              isStreaming: false,
              isComplete: true,
            }
          );
          onMessageUpdate(completedMessage.id, completedMessage);
          onMessageComplete(completedMessage);
          currentTextMessageRef.current = null;
          fullContentRef.current = "";
        }

        setIsStreaming(false);
        setIsProcessing(false);
        return;
      }

      // Handle errors
      if (event.type === "error") {
        setIsStreaming(false);
        setIsProcessing(false);

        if (currentTextMessageRef.current) {
          const errorMessage = updateStreamingMessage(
            currentTextMessageRef.current,
            {
              content:
                currentTextMessageRef.current.content ||
                "Sorry, I encountered an error while responding.",
              isStreaming: false,
              isComplete: true,
            }
          );
          onMessageUpdate(errorMessage.id, errorMessage);
          onMessageComplete(errorMessage);
          currentTextMessageRef.current = null;
          fullContentRef.current = "";
        }
        return;
      }
    },
    [
      createStreamingMessage,
      updateStreamingMessage,
      onMessageStreaming,
      onMessageUpdate,
      onMessageComplete,
      onFunctionToolComplete,
    ]
  );

  const processStreamData = useCallback(
    async (
      conversationId: string,
      readableStream: ReadableStream<Uint8Array>
    ) => {
      conversationIdRef.current = conversationId;
      setIsProcessing(true);
      setIsStreaming(true);

      try {
        const reader = readableStream.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process line by line instead of splitting by \n\n
          const lines = buffer.split("\n");
          // Keep incomplete line in buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            // Skip empty lines (they separate SSE events but we don't need to process them)
            if (line === "") continue;

            // Check for SSE data field
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();

              if (data === "[DONE]") {
                setIsStreaming(false);
                setIsProcessing(false);
                break;
              }

              try {
                const parsed = JSON.parse(data) as StreamEvent;
                processStreamEvent(parsed);
              } catch (parseError) {
                console.error(
                  "Error parsing SSE data:",
                  parseError,
                  "Data:",
                  data
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("Streaming error:", error);
        setIsStreaming(false);
        setIsProcessing(false);
      }
    },
    [processStreamEvent]
  );

  const reset = useCallback(() => {
    setIsProcessing(false);
    setIsStreaming(false);
    setIsMCPLoading(false);
    currentTextMessageRef.current = null;
    currentToolMessageRef.current = null;
    responseIdRef.current = "";
    fullContentRef.current = "";
  }, []);

  return {
    isProcessing,
    isStreaming,
    isMCPLoading,
    mcpLoadingMessage: "Fina đang xử lý...bạn đợi Fina một chút nhé ^^",
    processStreamData,
    processStreamEvent,
    reset,
    responseId: responseIdRef.current,
  };
};
