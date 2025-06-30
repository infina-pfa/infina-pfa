import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { chatService } from "@/lib/services/chat.service";
import { Conversation } from "@/lib/types/chat.types";

interface UseSimpleChatSessionReturn {
  // State
  conversation: Conversation | null;
  isCreating: boolean;
  error: string | null;
  
  // Actions
  createConversation: (title?: string) => Promise<string | null>;
  clearSession: () => void;
  clearError: () => void;
}

export const useSimpleChatSession = (): UseSimpleChatSessionReturn => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversation = useCallback(async (title?: string): Promise<string | null> => {
    if (!user) {
      setError("User must be authenticated to create a chat session");
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      const newConversation = await chatService.createConversation(title);
      setConversation(newConversation);
      return newConversation.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create conversation";
      setError(errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user]);

  const clearSession = useCallback(() => {
    setConversation(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    conversation,
    isCreating,
    error,
    createConversation,
    clearSession,
    clearError
  };
}; 