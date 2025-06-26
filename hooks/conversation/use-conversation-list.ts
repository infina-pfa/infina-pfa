import { useState, useEffect, useCallback } from "react";
import { conversationService } from "@/lib/services/conversation.service";
import { handleError } from "@/lib/error-handler";
import {
  Conversation,
  ConversationWithStats,
  GetConversationsQuery,
} from "@/lib/types/conversation.types";

export const useConversationList = (query?: GetConversationsQuery) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await conversationService.getAll(query);
      setConversations(data);
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, [query?.include_deleted, query?.search, query?.limit, query?.offset]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    isLoading,
    error,
    refetch: loadConversations,
  };
};

export const useConversationListWithStats = (query?: GetConversationsQuery) => {
  const [conversations, setConversations] = useState<ConversationWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await conversationService.getAllWithStats(query);
      setConversations(data);
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, [query?.include_deleted, query?.search, query?.limit, query?.offset]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    isLoading,
    error,
    refetch: loadConversations,
  };
}; 