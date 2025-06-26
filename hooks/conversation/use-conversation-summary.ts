import { useState, useEffect, useCallback } from "react";
import { conversationService } from "@/lib/services/conversation.service";
import { handleError } from "@/lib/error-handler";
import { ConversationSummary, GetConversationsQuery } from "@/lib/types/conversation.types";

export const useConversationSummary = (query?: GetConversationsQuery) => {
  const [summary, setSummary] = useState<ConversationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await conversationService.getSummary(query);
      setSummary(data);
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, [query?.include_deleted, query?.search, query?.limit, query?.offset]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    summary,
    isLoading,
    error,
    refetch: loadSummary,
  };
}; 