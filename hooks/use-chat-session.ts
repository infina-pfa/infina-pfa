import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  ChatSession, 
  CreateConversationResponse,
  ChatError 
} from "@/lib/types/chat.types";

interface UseChatSessionReturn {
  // State
  session: ChatSession | null;
  isLoading: boolean;
  error: ChatError | null;
  
  // Actions
  createSession: () => Promise<string | null>;
  clearSession: () => void;
  clearError: () => void;
}

export const useChatSession = (): UseChatSessionReturn => {
  const { user } = useAuth();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);

  const createSession = useCallback(async (): Promise<string | null> => {
    if (!user) {
      setError({
        code: "UNAUTHORIZED",
        message: "User must be authenticated to create a chat session"
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create new conversation
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Chat Session - ${new Date().toLocaleString()}`
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data: CreateConversationResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to create conversation");
      }

      // Create new session without any messages
      const newSession: ChatSession = {
        conversationId: data.data.id,
        messages: [],
        isAiTyping: false,
        componentState: {
          isOpen: false,
          history: []
        }
      };

      setSession(newSession);
      return data.data.id;

    } catch (err) {
      console.error("Error creating chat session:", err);
      setError({
        code: "SESSION_CREATE_FAILED",
        message: err instanceof Error ? err.message : "Failed to create chat session"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    session,
    isLoading,
    error,
    createSession,
    clearSession,
    clearError
  };
}; 