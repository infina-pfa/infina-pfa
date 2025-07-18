import { useCallback } from "react";
import { OnboardingMessage, UserProfile } from "@/lib/types/onboarding.types";

interface UseOnboardingAIProps {
  setIsAIThinking: (value: boolean) => void;
  setIsStreaming: (value: boolean) => void;
  setError: (value: string | null) => void;
  setMessages: React.Dispatch<React.SetStateAction<OnboardingMessage[]>>;
  saveChatMessage: (
    sender: "user" | "ai" | "system",
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>
  ) => Promise<void>;
  onComplete: () => void;
}

interface UseOnboardingAIReturn {
  streamOnboardingAI: (request: {
    message: string;
    conversationHistory: Array<{
      id: string;
      content: string;
      sender: "user" | "ai";
      timestamp: string;
    }>;
    userProfile: UserProfile;
  }) => Promise<void>;
}

export const useOnboardingAI = ({
  setIsAIThinking,
  setIsStreaming,
  setError,
  setMessages,
  saveChatMessage,
  onComplete,
}: UseOnboardingAIProps): UseOnboardingAIReturn => {
  const streamOnboardingAI = useCallback(
    async (request: {
      message: string;
      conversationHistory: Array<{
        id: string;
        content: string;
        sender: "user" | "ai";
        timestamp: string;
      }>;
      userProfile: UserProfile;
    }) => {
      try {
        setIsAIThinking(true);
        setIsStreaming(true);
        setError(null);

        const response = await fetch("/api/onboarding/ai-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                setIsStreaming(false);
                setIsAIThinking(false);
                return;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.type === "response_created") {
                  // Initialize new AI message
                  currentAIMessage = {
                    id: parsed.response_id || `ai-${Date.now()}`,
                    type: "ai",
                    content: "",
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, currentAIMessage!]);
                  fullContent = "";
                } else if (parsed.type === "response_output_text_streaming") {
                  // Update streaming content
                  if (currentAIMessage && parsed.response_id === currentAIMessage.id) {
                    fullContent += parsed.content;
                    currentAIMessage.content = fullContent;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === currentAIMessage!.id ? { ...currentAIMessage! } : msg
                      )
                    );
                  }
                } else if (parsed.type === "response_output_text_done") {
                  // Finalize text content
                  if (currentAIMessage) {
                    currentAIMessage.content = parsed.content;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === currentAIMessage!.id ? { ...currentAIMessage! } : msg
                      )
                    );

                    // Save AI message to database
                    await saveChatMessage("ai", parsed.content);
                  }
                } else if (parsed.type === "show_component") {
                  const { payload } = parsed;
                  const componentMessage: OnboardingMessage = {
                    id: payload.componentId,
                    type: "ai",
                    content: payload.title,
                    timestamp: new Date(),
                    component: {
                      id: payload.componentId,
                      type: payload.componentType,
                      title: payload.title,
                      context: payload.context,
                      isCompleted: false,
                    },
                  };
                  setMessages((prev) => [...prev, componentMessage]);

                  // Save component message to database
                  await saveChatMessage("ai", payload.title, payload.componentId, {
                    component: {
                      type: payload.componentType,
                      title: payload.title,
                      context: payload.context,
                      isCompleted: false,
                    },
                  });
                } else if (parsed.type === "tool_error") {
                  console.error("Tool error from server:", parsed);

                  // Show more detailed error information
                  const errorMessage = parsed.error || "Unknown tool error occurred";
                  const toolName = parsed.tool_name || "unknown tool";

                  console.error(`❌ Tool Error - ${toolName}: ${errorMessage}`);

                  // Optionally show details if available
                  if (parsed.details) {
                    console.error("Error details:", parsed.details);
                  }

                  // Don't set error or show retry messages - just log it
                  // The AI will continue with text instead of showing component
                } else if (parsed.type === "onboarding_complete") {
                  console.log("Onboarding complete signal received from server.");
                  onComplete();
                  setIsStreaming(false);
                  setIsAIThinking(false);
                } else if (parsed.type === "error") {
                  setError(parsed.error);
                  const errorMessage: OnboardingMessage = {
                    id: `error-${Date.now()}`,
                    type: "ai",
                    content: `An unexpected error occurred: ${parsed.error}`,
                    timestamp: new Date(),
                    isError: true,
                  };
                  setMessages((prev) => [...prev, errorMessage]);
                }
              } catch (parseError) {
                console.error("Error parsing SSE data:", parseError);
              }
            }
          }
        }
      } catch (err) {
        console.error("Streaming error:", err);
        setError(err instanceof Error ? err.message : "Streaming failed");
      } finally {
        setIsStreaming(false);
        setIsAIThinking(false);
      }
    },
    [setIsAIThinking, setIsStreaming, setError, setMessages, saveChatMessage, onComplete]
  );

  return {
    streamOnboardingAI,
  };
};