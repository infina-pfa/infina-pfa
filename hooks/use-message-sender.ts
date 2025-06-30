import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  ChatMessage, 
  SendMessageRequest, 
  SendMessageResponse,
  ChatError 
} from "@/lib/types/chat.types";

interface UseMessageSenderReturn {
  // State
  isSubmitting: boolean;
  error: ChatError | null;
  
  // Actions
  sendMessage: (content: string, conversationId: string) => Promise<ChatMessage | null>;
  clearError: () => void;
}

export const useMessageSender = (): UseMessageSenderReturn => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);

  const sendMessage = useCallback(async (
    content: string, 
    conversationId: string
  ): Promise<ChatMessage | null> => {
    if (!user) {
      setError({
        code: "UNAUTHORIZED",
        message: "User must be authenticated to send messages"
      });
      return null;
    }

    if (!content.trim()) {
      setError({
        code: "VALIDATION_ERROR",
        message: "Message content cannot be empty"
      });
      return null;
    }

    if (content.length > 10000) {
      setError({
        code: "VALIDATION_ERROR",
        message: "Message content cannot exceed 10,000 characters"
      });
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const requestData: SendMessageRequest = {
        content: content.trim(),
        conversationId,
        type: "text"
      };

      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SendMessageResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to send message");
      }

      // Transform the message to include client-side properties
      const userMessage: ChatMessage = {
        ...data.data.userMessage,
        isStreaming: false,
        component: null
      };

      return userMessage;

    } catch (err) {
      console.error("Error sending message:", err);
      setError({
        code: "MESSAGE_SEND_FAILED",
        message: err instanceof Error ? err.message : "Failed to send message"
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSubmitting,
    error,
    sendMessage,
    clearError
  };
}; 