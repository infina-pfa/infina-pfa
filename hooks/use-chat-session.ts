import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/auth/use-auth";
import { useTranslation } from "react-i18next";
import { chatService } from "@/lib/services-v2/chat.service";
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
  const { t } = useTranslation();
  const conversation = useRef<Conversation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversation = useCallback(
    async (title?: string): Promise<string | null> => {
      setIsCreating(true);
      setError(null);

      try {
        const newConversation = await chatService.createConversation(title);
        conversation.current = newConversation;
        return newConversation.id;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("conversationCreateFailed");
        setError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [user, t]
  );

  const clearSession = useCallback(() => {
    conversation.current = null;
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    conversation: conversation.current,
    isCreating,
    error,
    createConversation,
    clearSession,
    clearError,
  };
};
