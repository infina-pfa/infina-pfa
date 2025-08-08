import { useState, useCallback, useRef, useEffect } from "react";
import { StreamEvent } from "@/lib/types/streaming.types";
import {
  OnboardingComponent,
  ComponentResponse,
} from "@/lib/types/onboarding.types";

interface OnboardingMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  component?: OnboardingComponent;
}

interface UseOnboardingStreamReturn {
  // State
  messages: OnboardingMessage[];
  isLoading: boolean;
  error: string | null;
  isThinking: boolean;
  isStreaming: boolean;
  showSuggestions: boolean;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  handleComponentResponse: (
    componentId: string,
    response: ComponentResponse
  ) => Promise<void>;

  // Input handling
  handleSubmit: (text: string) => Promise<void>;
  isSubmitting: boolean;
}

export const useOnboarding = (): UseOnboardingStreamReturn => {
  // State management
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch("/api/onboarding/messages");
      const data = (await response.json()) as {
        data: {
          id: string;
          userId: string;
          sender: string;
          content: string;
          componentId: string | null;
          metadata: Record<string, unknown> | null;
          createdAt: string;
          updatedAt: string;
        }[];
      };

      setMessages(
        data.data.map((message) => ({
          id: message.id,
          type: message.sender as "user" | "ai" | "system",
          content: message.content,
          component: message.metadata as unknown as OnboardingComponent,
          timestamp: new Date(message.createdAt),
        }))
      );
    };
    fetchMessages();
  }, []);

  // Refs
  const currentStreamRef = useRef<OnboardingMessage | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Stream message from API
  const streamMessage = useCallback(async (userMessage: string) => {
    try {
      setIsStreaming(true);
      setIsThinking(true);
      setError(null);

      // Add user message
      const userMsg: OnboardingMessage = {
        id: `user-${Date.now()}`,
        type: "user",
        content: userMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Call streaming API
      const response = await fetch("/api/onboarding/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader");
      }

      const decoder = new TextDecoder();
      let currentAIMessage: OnboardingMessage | null = null;
      let fullContent = "";
      let buffer = "";
      const aiMessages: OnboardingMessage[] = [];

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
              setIsThinking(false);
              return;
            }

            try {
              const parsed = JSON.parse(data) as StreamEvent;

              if (
                parsed.type === "status" &&
                parsed.data.status_type === "started"
              ) {
                // Initialize new AI message
                currentAIMessage = {
                  id: `ai-${Date.now()}`,
                  type: "ai",
                  content: "",
                  timestamp: new Date(),
                  isStreaming: true,
                };
                currentStreamRef.current = currentAIMessage;
                setMessages((prev) => [...prev, currentAIMessage!]);
                setIsThinking(false); // Stop thinking, start streaming
              } else if (parsed.type === "text") {
                // Update streaming content
                if (currentAIMessage) {
                  fullContent += parsed.content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === currentAIMessage!.id
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                }
              } else if (
                parsed.type === "status" &&
                parsed.data.status_type === "text_completed"
              ) {
                // Finalize text content
                if (currentAIMessage && parsed.content) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === currentAIMessage!.id
                        ? {
                            ...msg,
                            content: parsed.content || "",
                            isStreaming: false,
                          }
                        : msg
                    )
                  );
                  aiMessages.push(currentAIMessage);
                  fullContent = "";
                  currentAIMessage = null;
                  currentStreamRef.current = null;
                }
              } else if (parsed.type === "function_call") {
                const functionCallMessage: OnboardingMessage = {
                  id: `ai-${Date.now()}`,
                  type: "ai",
                  content: parsed.content || "",
                  timestamp: new Date(),
                  component: {
                    id: parsed.data.function_args.component_id,
                    title: parsed.data.function_args.title,
                    type: parsed.data.function_args.component_type,
                    context: parsed.data.function_args.context,
                    isCompleted: false,
                  },
                };
                setMessages((prev) => [...prev, functionCallMessage]);
                aiMessages.push(functionCallMessage);
              } else if (parsed.type === "error") {
                const errorMessage =
                  "error" in parsed && typeof parsed.error === "string"
                    ? parsed.error
                    : "An error occurred";
                setError(errorMessage);
                if (currentAIMessage) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === currentAIMessage!.id
                        ? { ...msg, isStreaming: false }
                        : msg
                    )
                  );
                  currentStreamRef.current = null;
                }
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }

      await saveAiResponses(aiMessages);
    } catch (err) {
      console.error("Streaming error:", err);
      setError(err instanceof Error ? err.message : "Streaming failed");
    } finally {
      setIsStreaming(false);
      setIsThinking(false);
      setIsSubmitting(false);
    }
  }, []);

  const saveAiResponses = useCallback(
    async (aiMessages: OnboardingMessage[]) => {
      Promise.allSettled(
        aiMessages.map(async (message) => {
          await fetch("/api/onboarding/messages", {
            method: "POST",
            body: JSON.stringify({
              message: message.content,
              sender: "ai",
              component_id: message.component?.id,
              metadata: message.component,
            }),
          });
        })
      );
    },
    []
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isSubmitting) return;

      setIsSubmitting(true);
      await streamMessage(content);
    },
    [isSubmitting, streamMessage]
  );

  // Handle submit
  const handleSubmit = useCallback(
    async (text: string) => {
      if (!text.trim() || isSubmitting) return;

      const message = text.trim();
      await sendMessage(message);
    },
    [isSubmitting, sendMessage]
  );

  // Handle component response
  const handleComponentResponse = useCallback(
    async (componentId: string, response: ComponentResponse) => {
      // Mark component as completed
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.component?.id === componentId) {
            return {
              ...msg,
              component: {
                ...msg.component,
                isCompleted: true,
                response,
              },
            };
          }
          return msg;
        })
      );
    },
    []
  );

  return {
    // State
    messages,
    isLoading,
    error,
    isThinking,
    isStreaming,
    showSuggestions,

    // Actions
    sendMessage,
    clearError,
    handleComponentResponse,
    // Input handling
    handleSubmit,
    isSubmitting,
  };
};
