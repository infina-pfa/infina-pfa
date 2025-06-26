import { useState, useEffect, useCallback } from "react";
import { messageService } from "@/lib/services/message.service";
import { handleError } from "@/lib/error-handler";
import {
  Message,
  MessageWithConversation,
  GetMessagesQuery,
} from "@/lib/types/message.types";

export const useMessageList = (query?: GetMessagesQuery) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await messageService.getAll(query);
      setMessages(data);
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
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    isLoading,
    error,
    refetch: loadMessages,
  };
};

export const useMessageListWithConversation = (query?: GetMessagesQuery) => {
  const [messages, setMessages] = useState<MessageWithConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await messageService.getAllWithConversation(query);
      setMessages(data);
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
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    isLoading,
    error,
    refetch: loadMessages,
  };
};

export const useConversationMessages = (
  conversationId: string | null,
  options?: { limit?: number; offset?: number }
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await messageService.getByConversationId(conversationId, options);
      setMessages(data);
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, options?.limit, options?.offset]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    isLoading,
    error,
    refetch: loadMessages,
  };
}; 