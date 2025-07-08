import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAIAdvisorStreamProcessor } from "@/hooks/use-ai-advisor-stream";
import { chatService } from "@/lib/services/chat.service";
import {
  ChatMessage,
  AdvisorStreamRequest,
  UIAction,
} from "@/lib/types/chat.types";

interface UseAIStreamingReturn {
  // State
  isStreaming: boolean;
  isThinking: boolean;
  currentStreamingMessage: ChatMessage | null;
  error: string | null;

  // Actions
  startStreaming: (request: AdvisorStreamRequest) => Promise<void>;
  startToolStreaming: (request: AdvisorStreamRequest) => Promise<void>;
  stopStreaming: () => void;
  clearError: () => void;
}

interface UseAIStreamingOptions {
  userId: string;
  onMessageComplete?: (message: ChatMessage) => void;
  onMessageStreaming?: (message: ChatMessage) => void;
  onMessageUpdate?: (messageId: string, message: ChatMessage) => void;
  onFunctionToolComplete?: (action: UIAction) => void;
}

export const useAIStreaming = (
  options: UseAIStreamingOptions
): UseAIStreamingReturn => {
  const { t } = useTranslation();
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] =
    useState<ChatMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI Advisor stream processor
  const aiAdvisorProcessor = useAIAdvisorStreamProcessor({
    userId: options.userId,
    onMessageComplete: async (message) => {
      // Clear streaming state
      setCurrentStreamingMessage(null);
      setIsStreaming(false);
      setIsThinking(false);
      // Call external callback
      options.onMessageComplete?.(message);
    },
    onFunctionToolComplete: (action) => {
      options.onFunctionToolComplete?.(action);
    },
    onMessageStreaming: (message) => {
      setIsStreaming(true);
      setIsThinking(false);
      // Update current streaming message
      setCurrentStreamingMessage(message);

      // Call external callback
      options.onMessageStreaming?.(message);
    },
    onMessageUpdate: (messageId, message) => {
      setIsStreaming(true);
      setIsThinking(false);
      // Update current streaming message if it matches
      if (currentStreamingMessage?.id === messageId) {
        setCurrentStreamingMessage(message);
      }

      // Call external callback to update messages state
      options.onMessageUpdate?.(messageId, message);
    },
  });

  const startStreaming = useCallback(
    async (request: AdvisorStreamRequest) => {
      setIsStreaming(false);
      setIsThinking(true);
      setError(null);
      setCurrentStreamingMessage(null);

      try {
        // Get stream from service
        const stream = await chatService.startAIAdvisorStream(request);

        // Process the stream
        await aiAdvisorProcessor.processStreamData(
          request.conversationId,
          stream
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("aiStreamFailed");
        setError(errorMessage);
        setIsStreaming(false);
        setIsThinking(false);
        setCurrentStreamingMessage(null);
      }
    },
    [aiAdvisorProcessor, t]
  );

  const startToolStreaming = useCallback(
    async (request: AdvisorStreamRequest) => {
      setIsStreaming(false);
      setIsThinking(true);
      setError(null);
      setCurrentStreamingMessage(null);

      try {
        // Get stream from service
        const stream = await chatService.startAIAdvisorToolStream(request);

        // Process the stream
        await aiAdvisorProcessor.processStreamData(
          request.conversationId,
          stream
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("aiStreamFailed");
        setError(errorMessage);
        setIsStreaming(false);
        setIsThinking(false);
        setCurrentStreamingMessage(null);
      }
    },
    [aiAdvisorProcessor, t]
  );

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    setIsThinking(false);
    setCurrentStreamingMessage(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isStreaming,
    isThinking,
    currentStreamingMessage,
    error,
    startStreaming,
    startToolStreaming,
    stopStreaming,
    clearError,
  };
};
