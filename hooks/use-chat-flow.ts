import { useAIStreaming } from "@/hooks/use-ai-streaming";
import { useAuth } from "@/hooks/use-auth";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useSimpleChatSession } from "@/hooks/use-chat-session";
import { ChatToolId } from "@/lib/types/ai-streaming.types";
import {
  AdvisorStreamRequest,
  ChatMessage,
  DEFAULT_CHAT_SUGGESTIONS,
  UIAction,
} from "@/lib/types/chat.types";
import { useCallback, useState } from "react";

interface UseChatFlowReturn {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isThinking: boolean;
  isStreaming: boolean;
  showSuggestions: boolean;
  conversationId: string | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  createNewSession: () => Promise<void>;
  clearError: () => void;

  // Display tool
  toolId: ChatToolId | null;
  setToolId: (toolId: ChatToolId | null) => void;

  // Input handling
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;

  // Suggestion handling
  suggestions: typeof DEFAULT_CHAT_SUGGESTIONS;
  onSuggestionClick: (suggestion: string) => Promise<void>;
}

export const useChatFlow = (): UseChatFlowReturn => {
  const { user } = useAuth();

  // Composed hooks
  const {
    conversation,
    error: sessionError,
    isCreating,
    createConversation,
  } = useSimpleChatSession();
  const messages = useChatMessages();

  // Input state
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [toolId, setToolId] = useState<ChatToolId | null>(null);

  // AI Streaming
  const aiStreaming = useAIStreaming({
    userId: user?.id || "",
    onMessageComplete: async (message) => {
      // Save the completed AI message to database
      await messages.saveAIMessage(
        message.type,
        message.content,
        message.conversation_id,
        message.metadata
          ? (message.metadata as Record<string, unknown>)
          : undefined
      );

      // Update the message in local state to mark as final
      messages.updateMessage(message.id, { isStreaming: false });
    },
    onMessageStreaming: (message) => {
      // Add streaming message to local state if it doesn't exist
      const existingMessage = messages.messages.find(
        (m) => m.id === message.id
      );
      if (!existingMessage) {
        messages.addMessage(message);
      } else {
        // Update existing streaming message with new content
        messages.updateMessage(message.id, {
          content: message.content,
          streamingContent: message.streamingContent,
          isStreaming: message.isStreaming,
          metadata: message.metadata,
          updated_at: message.updated_at,
        });
      }
    },
    onMessageUpdate: (messageId, message) => {
      // Update the message in messages state with the new content
      messages.updateMessage(messageId, {
        content: message.content,
        streamingContent: message.streamingContent,
        isStreaming: message.isStreaming,
        metadata: message.metadata,
        updated_at: message.updated_at,
      });
    },
    onFunctionToolComplete: (action) => {
      handleUIAction(action);
    },
  });

  // Combined error state
  const error = sessionError || messages.error || aiStreaming.error;

  // Combined loading state
  const isLoading = isCreating;

  // Submitting state
  const isSubmitting = messages.isSending || aiStreaming.isStreaming;

  const handleUIAction = useCallback((action: UIAction) => {
    if (action.type === "show_component" && action.payload.componentId) {
      // TODO: Implement component panel logic
    } else if (action.type === "open_tool" && action.payload.toolId) {
      setToolId(action.payload.toolId as ChatToolId);
    }
  }, []);

  const createNewSession = async () => {
    await createConversation();
    messages.clearMessages();
    setShowSuggestions(true);
    setInputValue("");
    clearError();
  };

  /**
   * Main flow: User message → Create session → Update state → Save to DB → Stream AI
   */
  const sendMessage = async (content: string) => {
    if (!user) {
      return;
    }

    // Hide suggestions after first message
    setShowSuggestions(false);

    try {
      let conversationId = conversation?.id;

      // Step 1: Create session if it doesn't exist
      if (!conversationId) {
        conversationId = (await createConversation()) || undefined;
        console.log("🚀 ~ conversationId:", conversationId);

        if (!conversationId) {
          return;
        }
      }

      // Step 2: Send user message and update state
      const userMessage = await messages.sendUserMessage(
        content,
        conversationId
      );

      if (!userMessage) {
        return;
      }

      // Step 3: Prepare conversation history for AI
      const conversationHistory = messages.messages
        .slice(-10) // Last 10 messages for context
        .map((msg) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender === "user" ? ("user" as const) : ("ai" as const),
          timestamp: msg.created_at,
        }));

      // Add the current user message to history
      conversationHistory.push({
        id: userMessage.id,
        content: userMessage.content,
        sender: "user" as const,
        timestamp: userMessage.created_at,
      });

      // TODO: Get actual user context from API
      const userContext = {
        financial: {
          totalIncome: 0,
          totalExpenses: 0,
          currentBudgets: 0,
          hasCompletedOnboarding: false,
        },
        learning: {
          currentLevel: 1,
          xp: 0,
          currentGoal: "Getting started with financial planning",
        },
      };

      // Step 4: Prepare AI advisor request and start streaming
      const advisorRequest: AdvisorStreamRequest = {
        conversationId: conversationId,
        message: content,
        conversationHistory,
        userContext,
      };

      await aiStreaming.startStreaming(advisorRequest);
    } catch {
      // Error handling will be done by individual hooks
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return;

    const messageContent = inputValue.trim();
    setInputValue("");

    await sendMessage(messageContent);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  const clearError = () => {
    messages.clearError();
    aiStreaming.clearError();
  };

  return {
    // State
    messages: messages.messages,
    isLoading,
    error,
    isThinking: aiStreaming.isThinking,
    isStreaming: aiStreaming.isStreaming,
    showSuggestions,
    conversationId: conversation?.id || null,

    // Actions
    sendMessage,
    createNewSession,
    clearError,

    // Input handling
    inputValue,
    setInputValue,
    handleSubmit,
    isSubmitting,

    // Suggestion handling
    suggestions: DEFAULT_CHAT_SUGGESTIONS,
    onSuggestionClick: handleSuggestionClick,

    // Display component and tool
    toolId,
    setToolId,
  };
};
