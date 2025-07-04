import {
  AdvisorStreamEvent,
  ChatMessage,
  MessageType,
  ResponseDataEvent,
  UIAction,
  UIActionType,
  UseAIAdvisorStreamProcessorOptions,
  UseAIAdvisorStreamProcessorReturn,
} from "@/lib/types/chat.types";
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

  const processStreamEvent = useCallback(
    (event: AdvisorStreamEvent) => {
      const { type, content, action, response_id } = event;

      // Store response ID when received
      if (response_id) {
        responseIdRef.current = response_id;
      }

      switch (type) {
        case ResponseDataEvent.RESPONSE_CREATED: {
          break;
        }

        case ResponseDataEvent.OUTPUT_TEXT_STREAMING: {
          setIsStreaming(true);
          if (!content) return;

          // Create new message if we don't have a current text message
          if (!currentTextMessageRef.current) {
            const newMessage = createStreamingMessage(content, true);
            currentTextMessageRef.current = newMessage;
            onMessageStreaming(newMessage);
          } else {
            // Update existing message with streamed content
            const updatedContent =
              (currentTextMessageRef.current.streamingContent || "") + content;
            const updatedMessage = updateStreamingMessage(
              currentTextMessageRef.current,
              {
                content: updatedContent,
                isStreaming: true,
              }
            );
            currentTextMessageRef.current = updatedMessage;
            onMessageUpdate(updatedMessage.id, updatedMessage);
          }
          break;
        }

        case ResponseDataEvent.OUTPUT_TEXT_DONE: {
          if (currentTextMessageRef.current) {
            // Mark the text message as complete
            const completedMessage = updateStreamingMessage(
              currentTextMessageRef.current,
              {
                isStreaming: false,
                isComplete: true,
              }
            );

            onMessageUpdate(completedMessage.id, completedMessage);
            onMessageComplete(completedMessage);

            // Reset ref
            currentTextMessageRef.current = null;
            setIsStreaming(false);
            setIsProcessing(false);
          }
          break;
        }

        case ResponseDataEvent.FUNCTION_CALL_ARGUMENTS_STREAMING: {
          setIsStreaming(true);
          setIsProcessing(true);
          // Create new tool preparation message if we don't have one
          if (!currentToolMessageRef.current) {
            const newMessage = createStreamingMessage(
              "Đang chuẩn bị công cụ...",
              true,
              action
            );
            currentToolMessageRef.current = newMessage;
            onMessageStreaming(newMessage);
          }
          break;
        }

        case ResponseDataEvent.FUNCTION_CALL_ARGUMENTS_DONE: {
          if (currentToolMessageRef.current && action) {
            // Update tool message with final content
            const toolTitle = action.payload?.title || "";
            const finalContent = `Hiển thị công cụ: ${toolTitle}`;

            const completedMessage = updateStreamingMessage(
              currentToolMessageRef.current,
              {
                type: getMessageType(action),
                content: finalContent,
                action,
                isStreaming: false,
                isComplete: true,
              }
            );

            onMessageUpdate(completedMessage.id, completedMessage);
            onMessageComplete(completedMessage);
            onFunctionToolComplete(action);

            // Reset ref
            currentToolMessageRef.current = null;
            setIsStreaming(false);
            setIsProcessing(false);
          }
          break;
        }

        case ResponseDataEvent.RESPONSE_COMPLETED: {
          // Clean up any remaining streaming messages
          if (currentTextMessageRef.current) {
            const completedMessage = updateStreamingMessage(
              currentTextMessageRef.current,
              {
                isStreaming: false,
                isComplete: true,
              }
            );
            onMessageUpdate(completedMessage.id, completedMessage);
            onMessageComplete(completedMessage);
            currentTextMessageRef.current = null;
          }

          if (currentToolMessageRef.current) {
            const completedMessage = updateStreamingMessage(
              currentToolMessageRef.current,
              {
                isStreaming: false,
                isComplete: true,
              }
            );
            onMessageUpdate(completedMessage.id, completedMessage);
            onMessageComplete(completedMessage);
            currentToolMessageRef.current = null;
          }

          setIsStreaming(false);
          setIsProcessing(false);
          break;
        }

        case "error": {
          setIsStreaming(false);
          setIsProcessing(false);

          // Update any current streaming message with error state
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
          }
          break;
        }

        default:
          break;
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

      try {
        const reader = readableStream.getReader();
        let buffer = ""; // Buffer to accumulate partial data

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          buffer += chunk;

          // Process complete events from buffer
          const events = buffer.split("\n\n");

          // Keep the last potentially incomplete event in buffer
          buffer = events.pop() || "";

          for (const event of events) {
            if (event.trim() === "") continue;

            if (event.startsWith("data: ")) {
              try {
                const eventData = event.substring(6).trim();

                // Skip [DONE] marker
                if (eventData === "[DONE]") {
                  continue;
                }

                // Validate JSON before parsing
                if (eventData.startsWith("{") && eventData.endsWith("}")) {
                  const parsedEvent: AdvisorStreamEvent = JSON.parse(eventData);
                  processStreamEvent(parsedEvent);
                }
              } catch {
                // Skip malformed events
              }
            }
          }
        }

        // Process any remaining data in buffer
        if (buffer.trim() && buffer.startsWith("data: ")) {
          try {
            const eventData = buffer.substring(6).trim();
            if (
              eventData !== "[DONE]" &&
              eventData.startsWith("{") &&
              eventData.endsWith("}")
            ) {
              const parsedEvent: AdvisorStreamEvent = JSON.parse(eventData);
              processStreamEvent(parsedEvent);
            }
          } catch {
            // Skip malformed final event
          }
        }
      } catch {
        setIsStreaming(false);
        setIsProcessing(false);
      }
    },
    [processStreamEvent]
  );

  const reset = useCallback(() => {
    setIsProcessing(false);
    setIsStreaming(false);
    currentTextMessageRef.current = null;
    currentToolMessageRef.current = null;
    responseIdRef.current = "";
  }, []);

  return {
    isProcessing,
    isStreaming,
    processStreamData,
    processStreamEvent,
    reset,
    responseId: responseIdRef.current,
  };
};
