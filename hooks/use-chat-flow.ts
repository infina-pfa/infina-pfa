import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSimpleChatSession } from "@/hooks/use-chat-session-v2";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useAIStreaming } from "@/hooks/use-ai-streaming";
import { 
  ChatMessage, 
  AdvisorStreamRequest, 
  ComponentData, 
  UIAction,
  DEFAULT_CHAT_SUGGESTIONS 
} from "@/lib/types/chat.types";

interface UseChatFlowReturn {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isAiTyping: boolean;
  showSuggestions: boolean;
  conversationId: string | null;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  createNewSession: () => Promise<void>;
  clearError: () => void;
  
  // Component actions (placeholder for future implementation)
  openComponent: (component: ComponentData) => void;
  closeComponent: () => void;
  
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
  const session = useSimpleChatSession();
  const messages = useChatMessages();
  
  // Input state
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  // AI Streaming
  const aiStreaming = useAIStreaming({
    conversationId: session.conversation?.id || "",
    userId: user?.id || "",
    onMessageComplete: async (message) => {
      console.log("✅ AI message complete, saving to database:", message.id);
      
      // Save the completed AI message to database
      if (session.conversation) {
        await messages.saveAIMessage(
          message.content, 
          session.conversation.id, 
          message.metadata ? message.metadata as Record<string, unknown> : undefined
        );
      }
      
      // Update the message in local state to mark as final
      messages.updateMessage(message.id, { isStreaming: false });
    },
    onMessageStreaming: (message) => {
      console.log("🌊 AI message streaming:", message.id, "content length:", message.content.length);
      
      // Add streaming message to local state if it doesn't exist
      const existingMessage = messages.messages.find(m => m.id === message.id);
      if (!existingMessage) {
        console.log("➕ Adding new streaming message:", message.id);
        messages.addMessage(message);
      } else {
        console.log("📝 Updating existing streaming message:", message.id);
        // Update existing streaming message with new content
        messages.updateMessage(message.id, {
          content: message.content,
          streamingContent: message.streamingContent,
          isStreaming: message.isStreaming,
          metadata: message.metadata,
          updated_at: message.updated_at
        });
      }
    },
    onMessageUpdate: (messageId, message) => {
      console.log("🔄 Updating message in state:", messageId, "content length:", message.content.length);
      
      // Update the message in messages state with the new content
      messages.updateMessage(messageId, {
        content: message.content,
        streamingContent: message.streamingContent,
        isStreaming: message.isStreaming,
        metadata: message.metadata,
        updated_at: message.updated_at
      });
    },
    onFunctionToolComplete: (action) => {
      console.log("🔧 Function tool complete:", action.type);
      handleUIAction(action);
    },
  });

  // Combined error state
  const error = session.error || messages.error || aiStreaming.error;
  
  // Combined loading state
  const isLoading = session.isCreating;
  
  // AI typing state
  const isAiTyping = aiStreaming.isStreaming;

  // Submitting state
  const isSubmitting = messages.isSending || aiStreaming.isStreaming;

  const handleUIAction = useCallback((action: UIAction) => {
    console.log("Handling UI action:", action);
    
    // TODO: Implement component panel logic
    if (action.type === "show_component") {
      console.log("Show component:", action.payload.componentId);
    } else if (action.type === "open_tool") {
      console.log("Open tool:", action.payload.toolId);
    }
  }, []);

  const createNewSession = useCallback(async () => {
    await session.createConversation();
    messages.clearMessages();
    setShowSuggestions(true);
    setInputValue("");
    clearError();
  }, [session, messages]);

  /**
   * Main flow: User message → Create session → Update state → Save to DB → Stream AI
   */
  const sendMessage = useCallback(async (content: string) => {
    console.log("🚀 Starting chat flow with message:", content);
    
    if (!user) {
      console.log("❌ No user authenticated");
      return;
    }

    // Hide suggestions after first message
    setShowSuggestions(false);

    try {
      let conversationId = session.conversation?.id;

             // Step 1: Create session if it doesn't exist
       if (!conversationId) {
         console.log("🆕 Creating new conversation...");
         conversationId = await session.createConversation() || undefined;
         
         if (!conversationId) {
           console.error("❌ Failed to create conversation");
           return;
         }
         console.log("✅ Conversation created:", conversationId);
       }

      // Step 2: Send user message and update state
      console.log("📤 Sending user message...");
      const userMessage = await messages.sendUserMessage(content, conversationId);
      
      if (!userMessage) {
        console.log("❌ Failed to send user message");
        return;
      }
      console.log("✅ User message sent and added to state:", userMessage.id);

      // Step 3: Prepare conversation history for AI
      const conversationHistory = messages.messages
        .slice(-10) // Last 10 messages for context
        .map((msg) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender === "user" ? "user" as const : "ai" as const,
          timestamp: msg.created_at,
        }));

      // Add the current user message to history
      conversationHistory.push({
        id: userMessage.id,
        content: userMessage.content,
        sender: "user" as const,
        timestamp: userMessage.created_at,
      });

      console.log("📚 Conversation history prepared:", conversationHistory.length, "messages");

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
        message: content,
        conversationHistory,
        userContext,
      };

      console.log("🤖 Starting AI advisor stream...");
      await aiStreaming.startStreaming(advisorRequest);

    } catch (error) {
      console.error("💥 Error in chat flow:", error);
    }
  }, [user, session, messages, aiStreaming]);

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || isSubmitting) return;
    
    const messageContent = inputValue.trim();
    setInputValue("");
    
    await sendMessage(messageContent);
  }, [inputValue, isSubmitting, sendMessage]);

  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    setInputValue(suggestion);
    await sendMessage(suggestion);
  }, [sendMessage]);

  const clearError = useCallback(() => {
    session.clearError();
    messages.clearError();
    aiStreaming.clearError();
  }, [session, messages, aiStreaming]);

  const openComponent = useCallback((component: ComponentData) => {
    console.log("Opening component:", component);
    // TODO: Implement component panel functionality
  }, []);

  const closeComponent = useCallback(() => {
    console.log("Closing component");
    // TODO: Implement component panel functionality  
  }, []);

  return {
    // State
    messages: messages.messages,
    isLoading,
    error,
    isAiTyping,
    showSuggestions,
    conversationId: session.conversation?.id || null,
    
    // Actions
    sendMessage,
    createNewSession,
    clearError,
    
    // Component actions
    openComponent,
    closeComponent,
    
    // Input handling
    inputValue,
    setInputValue,
    handleSubmit,
    isSubmitting,
    
    // Suggestion handling
    suggestions: DEFAULT_CHAT_SUGGESTIONS,
    onSuggestionClick: handleSuggestionClick,
  };
}; 