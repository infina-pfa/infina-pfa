import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useChatSession } from "@/hooks/use-chat-session";
import { useMessageSender } from "@/hooks/use-message-sender";
import { useStreamingChat } from "@/hooks/use-streaming-chat";
import { useAIAdvisorStreamProcessor } from "@/hooks/use-ai-advisor-stream";
import { 
  UseChatReturn,
  ComponentData,
  UIAction,
  AdvisorStreamRequest,
  DEFAULT_CHAT_SUGGESTIONS
} from "@/lib/types/chat.types";

export const useChat = (): UseChatReturn => {
  const { user } = useAuth();
  const { session, isLoading: sessionLoading, error: sessionError, createSession, clearError: clearSessionError } = useChatSession();
  const { sendMessage: sendUserMessage, isSubmitting, error: sendError, clearError: clearSendError } = useMessageSender();
  const { streamingMessage, isStreaming } = useStreamingChat();
  
  // Input state
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Component panel state - placeholder for future implementation
  // const [componentPanel, setComponentPanel] = useState({
  //   isOpen: false,
  //   currentComponent: null as ComponentData | null,
  //   isMobile: false
  // });

  // AI Advisor stream processor
  const aiAdvisorProcessor = useAIAdvisorStreamProcessor({
    conversationId: session?.conversationId || "",
    userId: user?.id || "",
    onMessageComplete: (message) => {
      console.log("AI message complete:", message);
      // Add completed message to session
      if (session) {
        session.messages.push(message);
        session.isAiTyping = false;
      }
    },
    onFunctionToolComplete: (action) => {
      console.log("Function tool complete:", action);
      handleUIAction(action);
    },
    onMessageStreaming: (message) => {
      console.log("AI message streaming:", message);
      // Update session with streaming message
      if (session) {
        session.isAiTyping = true;
        // Replace or add streaming message
        const existingIndex = session.messages.findIndex(m => m.id === message.id);
        if (existingIndex >= 0) {
          session.messages[existingIndex] = message;
        } else {
          session.messages.push(message);
        }
      }
    },
    onMessageUpdate: (messageId, message) => {
      console.log("AI message update:", messageId, message);
      // Update specific message in session
      if (session) {
        const messageIndex = session.messages.findIndex(m => m.id === messageId);
        if (messageIndex >= 0) {
          session.messages[messageIndex] = message;
        }
      }
    },
  });

  // Combine all errors
  const error = sessionError || sendError;

  // Combine all loading states
  const isLoading = sessionLoading;

  // Get all messages including streaming
  const messages = session ? [...session.messages] : [];
  if (streamingMessage && !messages.find(m => m.id === streamingMessage.id)) {
    messages.push(streamingMessage);
  }

  // Check if AI is typing
  const isAiTyping = session?.isAiTyping || isStreaming || aiAdvisorProcessor.isStreaming;

  const handleUIAction = useCallback((action: UIAction) => {
    console.log("Handling UI action:", action);
    
    // TODO: Implement component panel logic
    // This is a placeholder for future component integration
    if (action.type === "show_component") {
      console.log("Show component:", action.payload.componentId);
      // setComponentPanel({
      //   isOpen: true,
      //   currentComponent: createComponentFromAction(action),
      //   isMobile: window.innerWidth < 768
      // });
    } else if (action.type === "open_tool") {
      console.log("Open tool:", action.payload.toolId);
      // Handle tool opening logic
    }
  }, []);

  const createNewSession = useCallback(async () => {
    await createSession();
    setShowSuggestions(true);
    setInputValue("");
    clearError();
  }, [createSession]);

  const sendMessage = useCallback(async (content: string) => {
    if (!session || !user) return;

    // Hide suggestions after first message
    setShowSuggestions(false);

    try {
      // Send user message first
      const userMessage = await sendUserMessage(content, session.conversationId);
      if (!userMessage) return;

      // Add user message to session
      session.messages.push(userMessage);
      session.isAiTyping = true;

      // Prepare conversation history for AI advisor
      const conversationHistory = session.messages.slice(-10).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender === "user" ? "user" as const : "ai" as const,
        timestamp: msg.created_at,
      }));

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

      // Prepare AI advisor request
      const advisorRequest: AdvisorStreamRequest = {
        message: content,
        conversationHistory,
        userContext,
      };

      // Call AI advisor stream API
      const response = await fetch("/api/chat/advisor-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(advisorRequest),
      });

      if (!response.ok) {
        throw new Error(`AI advisor request failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body from AI advisor");
      }

      // Process the stream
      await aiAdvisorProcessor.processStreamData(response.body);

    } catch (error) {
      console.error("Error in sendMessage:", error);
      session.isAiTyping = false;
      // TODO: Show error message to user
    }
  }, [session, user, sendUserMessage, aiAdvisorProcessor]);

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
    clearSessionError();
    clearSendError();
  }, [clearSessionError, clearSendError]);

  const openComponent = useCallback((component: ComponentData) => {
    // TODO: Implement component panel functionality
    console.log("Opening component:", component);
  }, []);

  const closeComponent = useCallback(() => {
    // TODO: Implement component panel functionality  
    console.log("Closing component");
  }, []);

  // Auto-create session on mount if user is available
  useEffect(() => {
    if (user && !session && !sessionLoading) {
      createNewSession();
    }
  }, [user, session, sessionLoading, createNewSession]);

  return {
    // State
    session,
    messages,
    isLoading,
    error,
    isAiTyping,
    showSuggestions,
    
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