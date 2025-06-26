import { useState, useEffect, useCallback } from "react";
import { conversationService } from "@/lib/services/conversation.service";
import { handleError } from "@/lib/error-handler";
import { Conversation } from "@/lib/types/conversation.types";

export const useConversation = (id: string | null) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback(async () => {
    if (!id) {
      setConversation(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await conversationService.getById(id);
      setConversation(data);
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      setConversation(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  return {
    conversation,
    isLoading,
    error,
    refetch: loadConversation,
  };
}; 