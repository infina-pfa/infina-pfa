import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  ChatSession, 
  ChatMessage, 
  CreateConversationResponse,
  ChatError 
} from "@/lib/types/chat.types";

interface UseChatSessionReturn {
  // State
  session: ChatSession | null;
  isLoading: boolean;
  error: ChatError | null;
  
  // Actions
  createSession: () => Promise<void>;
  clearSession: () => void;
  clearError: () => void;
}

export const useChatSession = (): UseChatSessionReturn => {
  const { user } = useAuth();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);

  const createSession = useCallback(async () => {
    if (!user) {
      setError({
        code: "UNAUTHORIZED",
        message: "User must be authenticated to create a chat session"
      });
      return;
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

      // Create welcome message
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
        conversation_id: data.data.id,
        content: `Hi, ${user.user_metadata?.name || user.email}! I'm your AI financial advisor. How can I help you today?`,
        sender: "ai",
        type: "text",
        metadata: null,
        isStreaming: false
      };

      // Create new session
      const newSession: ChatSession = {
        conversationId: data.data.id,
        messages: [welcomeMessage],
        isAiTyping: false,
        componentState: {
          isOpen: false,
          history: []
        }
      };

      setSession(newSession);

    } catch (err) {
      console.error("Error creating chat session:", err);
      setError({
        code: "SESSION_CREATE_FAILED",
        message: err instanceof Error ? err.message : "Failed to create chat session"
      });
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