import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { chatService } from "@/lib/services/chat.service";
import { ChatMessage } from "@/lib/types/chat.types";

interface UseChatMessagesReturn {
  // State
  messages: ChatMessage[];
  isSending: boolean;
  error: string | null;
  
  // Actions
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  sendUserMessage: (content: string, conversationId: string) => Promise<ChatMessage | null>;
  saveAIMessage: (content: string, conversationId: string, metadata?: Record<string, unknown>) => Promise<ChatMessage | null>;
  clearMessages: () => void;
  clearError: () => void;
}

export const useChatMessages = (): UseChatMessagesReturn => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  const sendUserMessage = useCallback(async (
    content: string, 
    conversationId: string
  ): Promise<ChatMessage | null> => {
    setIsSending(true);
    setError(null);

    try {
      const userMessage = await chatService.sendUserMessage(content, conversationId);
      addMessage(userMessage);
      return userMessage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("messageSendFailed");
      setError(errorMessage);
      return null;
    } finally {
      setIsSending(false);
    }
  }, [addMessage, t]);

  const saveAIMessage = useCallback(async (
    content: string,
    conversationId: string,
    metadata?: Record<string, unknown>
  ): Promise<ChatMessage | null> => {
    try {
      const aiMessage = await chatService.saveAIMessage(content, conversationId, metadata);
      return aiMessage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("aiStreamFailed");
      setError(errorMessage);
      return null;
    }
  }, [t]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isSending,
    error,
    addMessage,
    updateMessage,
    sendUserMessage,
    saveAIMessage,
    clearMessages,
    clearError
  };
}; 