import { useState, useCallback } from "react";
import { useAIAdvisorStreamProcessor } from "@/hooks/use-ai-advisor-stream";
import { chatService } from "@/lib/services/chat.service";
import { 
  ChatMessage, 
  AdvisorStreamRequest, 
  UIAction 
} from "@/lib/types/chat.types";

interface UseAIStreamingReturn {
  // State
  isStreaming: boolean;
  currentStreamingMessage: ChatMessage | null;
  error: string | null;
  
  // Actions
  startStreaming: (request: AdvisorStreamRequest) => Promise<void>;
  stopStreaming: () => void;
  clearError: () => void;
}

interface UseAIStreamingOptions {
  conversationId: string;
  userId: string;
  onMessageComplete?: (message: ChatMessage) => void;
  onMessageStreaming?: (message: ChatMessage) => void;
  onMessageUpdate?: (messageId: string, message: ChatMessage) => void;
  onFunctionToolComplete?: (action: UIAction) => void;
}

export const useAIStreaming = (options: UseAIStreamingOptions): UseAIStreamingReturn => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<ChatMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI Advisor stream processor
  const aiAdvisorProcessor = useAIAdvisorStreamProcessor({
    conversationId: options.conversationId,
    userId: options.userId,
    onMessageComplete: async (message) => {
      console.log("✅ AI message complete:", message.id);
      
      // Clear streaming state
      setCurrentStreamingMessage(null);
      setIsStreaming(false);
      
      // Call external callback
      options.onMessageComplete?.(message);
    },
    onFunctionToolComplete: (action) => {
      console.log("🔧 Function tool complete:", action.type);
      options.onFunctionToolComplete?.(action);
    },
    onMessageStreaming: (message) => {
      console.log("🌊 AI message streaming:", message.id);
      
      // Update current streaming message
      setCurrentStreamingMessage(message);
      
      // Call external callback
      options.onMessageStreaming?.(message);
    },
    onMessageUpdate: (messageId, message) => {
      console.log("🔄 AI message update:", messageId, "content length:", message.content.length);
      
      // Update current streaming message if it matches
      if (currentStreamingMessage?.id === messageId) {
        setCurrentStreamingMessage(message);
      }
      
      // Call external callback to update messages state
      options.onMessageUpdate?.(messageId, message);
    },
  });

  const startStreaming = useCallback(async (request: AdvisorStreamRequest) => {
    setIsStreaming(true);
    setError(null);
    setCurrentStreamingMessage(null);

    try {
      console.log("🔄 Starting AI advisor stream...");
      
      // Get stream from service
      const stream = await chatService.startAIAdvisorStream(request);
      
      // Process the stream
      await aiAdvisorProcessor.processStreamData(stream);
      
      console.log("✅ AI advisor stream completed");
    } catch (err) {
      console.error("💥 Error in AI streaming:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to process AI stream";
      setError(errorMessage);
      setIsStreaming(false);
      setCurrentStreamingMessage(null);
    }
  }, [aiAdvisorProcessor]);

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    setCurrentStreamingMessage(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isStreaming: isStreaming || aiAdvisorProcessor.isStreaming,
    currentStreamingMessage,
    error,
    startStreaming,
    stopStreaming,
    clearError
  };
}; 