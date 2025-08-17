import { useAIStreaming } from "@/hooks/use-ai-streaming";
import { useAuth } from "@/hooks/auth/use-auth";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useSimpleChatSession } from "@/hooks/use-chat-session";
import { ChatToolId } from "@/lib/types/ai-streaming.types";
import {
  AdvisorStreamRequest,
  ChatMessage,
  DEFAULT_CHAT_SUGGESTIONS,
  MessageSender,
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
  isMCPLoading: boolean;
  mcpLoadingMessage: string;
  showSuggestions: boolean;
  conversationId: string | null;

  // Actions
  sendMessage: (
    content: string,
    options?: {
      isToolMessage?: boolean;
      sender?: MessageSender;
      imageUrls?: string[];
    }
  ) => Promise<void>;
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
      messages.updateMessage(message.id, {
        isStreaming: false,
        metadata: message.metadata,
        type: message.type,
      });
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
  const sendMessage = async (
    content: string,
    options?: {
      isToolMessage?: boolean;
      sender?: MessageSender;
      imageUrls?: string[];
    }
  ) => {
    // Hide suggestions after first message
    setShowSuggestions(false);

    try {
      let conversationId = conversation?.id;

      // Step 1: Create session if it doesn't exist
      if (!conversationId) {
        conversationId = (await createConversation()) || undefined;

        if (!conversationId) {
          return;
        }
      }

      // // Add the current user message to history
      messages.addMessage({
        id: `user-${Date.now()}`,
        content,
        conversation_id: conversationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: options?.sender || "user",
        type: "text",
        metadata: {
          imageUrls: options?.imageUrls || [],
        },
        user_id: user?.id || "",
      });

      // Step 4: Prepare AI advisor request and start streaming
      const advisorRequest: AdvisorStreamRequest = {
        conversationId: conversationId,
        message: content,
        sender: options?.sender || "user",
        imageUrls: options?.imageUrls || [],
      };

      if (options?.isToolMessage) {
        await aiStreaming.startToolStreaming(advisorRequest);
      } else {
        await aiStreaming.startStreaming(advisorRequest);
      }
    } catch {
      // Error handling will be done by individual hooks
    } finally {
      setInputValue("");
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return;

    const messageContent = inputValue.trim();

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
    isMCPLoading: aiStreaming.isMCPLoading,
    mcpLoadingMessage: aiStreaming.mcpLoadingMessage,
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
