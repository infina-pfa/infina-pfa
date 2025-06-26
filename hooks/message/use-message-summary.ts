import { useState, useEffect, useCallback } from "react";
import { messageService } from "@/lib/services/message.service";
import { handleError } from "@/lib/error-handler";
import { MessageSummary, GetMessagesQuery } from "@/lib/types/message.types";

export const useMessageSummary = (query?: GetMessagesQuery) => {
  const [summary, setSummary] = useState<MessageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await messageService.getSummary(query);
      setSummary(data);
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    query?.conversation_id,
    query?.sender_type,
    query?.from_date,
    query?.to_date,
    query?.search,
    query?.limit,
    query?.offset,
  ]);

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