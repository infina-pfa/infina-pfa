import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ChatMessage, ChatError } from "@/lib/types/chat.types";

interface UseAIMessageSaverReturn {
  // State
  isSaving: boolean;
  error: ChatError | null;
  
  // Actions
  saveAIMessage: (content: string, conversationId: string, metadata?: Record<string, unknown>) => Promise<ChatMessage | null>;
  clearError: () => void;
}

export const useAIMessageSaver = (): UseAIMessageSaverReturn => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);

  const saveAIMessage = useCallback(async (
    content: string,
    conversationId: string,
    metadata?: Record<string, unknown>
  ): Promise<ChatMessage | null> => {
    if (!user) {
      setError({
        code: "UNAUTHORIZED",
        message: "User must be authenticated to save AI messages"
      });
      return null;
    }

    if (!content.trim()) {
      setError({
        code: "VALIDATION_ERROR",
        message: "AI message content cannot be empty"
      });
      return null;
    }

    setIsSaving(true);
    setError(null);

    try {
      const requestData = {
        content: content.trim(),
        conversation_id: conversationId,
        sender_type: "BOT", // AI messages use BOT sender type
        type: "text",
        metadata: metadata || null
      };

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to save AI message");
      }

      // Transform the message to include client-side properties
      const aiMessage: ChatMessage = {
        ...data.data,
        isStreaming: false,
        component: null
      };

      return aiMessage;

    } catch (err) {
      console.error("Error saving AI message:", err);
      setError({
        code: "AI_MESSAGE_SAVE_FAILED",
        message: err instanceof Error ? err.message : "Failed to save AI message"
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSaving,
    error,
    saveAIMessage,
    clearError
  };
}; 