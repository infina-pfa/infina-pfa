import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useChatSession } from "@/hooks/use-chat-session";
import { useMessageSender } from "@/hooks/use-message-sender";
import { useAIMessageSaver } from "@/hooks/use-ai-message-saver";
import { useAIAdvisorStreamProcessor } from "@/hooks/use-ai-advisor-stream";
import { 
  UseChatReturn,
  ComponentData,
  UIAction,
  AdvisorStreamRequest,
  DEFAULT_CHAT_SUGGESTIONS,
  ChatMessage
} from "@/lib/types/chat.types";

export const useChat = (): UseChatReturn => {
  const { user } = useAuth();
  const { session, isLoading: sessionLoading, error: sessionError, createSession, clearError: clearSessionError } = useChatSession();
  const { sendMessage: sendUserMessage, isSubmitting, error: sendError, clearError: clearSendError } = useMessageSender();
  const { saveAIMessage } = useAIMessageSaver();
  
  // Input state
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [pendingUserMessage, setPendingUserMessage] = useState<ChatMessage | null>(null);
  const [pendingAiMessages, setPendingAiMessages] = useState<ChatMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
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
        onMessageComplete: async (message) => {
      console.log("✅ AI message complete:", message.id, "final content length:", message.content.length);
      
      if (session) {
        console.log("💾 Saving AI message to database...");
        const metadata = message.metadata ? JSON.parse(JSON.stringify(message.metadata)) : undefined;
        await saveAIMessage(message.content, session.conversationId, metadata);
        console.log("✅ AI message saved to database");
        
        // Update the existing streaming message to be final (don't add a new one)
        const existingIndex = session.messages.findIndex(m => m.id === message.id);
        if (existingIndex >= 0) {
          console.log("📝 Finalizing existing message at index:", existingIndex);
          session.messages[existingIndex] = { ...message, isStreaming: false };
        } else {
          console.log("➕ Adding completed message (no streaming message found)");
          // If no streaming message exists, add the completed one
          session.messages.push({ ...message, isStreaming: false });
        }
        session.isAiTyping = false;
        
        // Clear pending messages now that conversation is complete
        console.log("🧹 Clearing pending messages");
        setPendingUserMessage(null);
        setPendingAiMessages([]);
        
        // Force re-render
        setForceUpdate(prev => prev + 1);
      } else {
        console.log("🆔 No session available, finalizing in pending AI messages");
        // Finalize the message in pending state
        setPendingAiMessages(prev => {
          const existingIndex = prev.findIndex(m => m.id === message.id);
          if (existingIndex >= 0) {
            console.log("📝 Finalizing pending AI message at index:", existingIndex);
            const updated = [...prev];
            updated[existingIndex] = { ...message, isStreaming: false };
            return updated;
          } else {
            console.log("➕ Adding completed pending AI message");
            return [...prev, { ...message, isStreaming: false }];
          }
        });
        
        // Save to database using stored conversation ID
        if (currentConversationId) {
          console.log("💾 Saving AI message to database using stored conversation ID...");
          const metadata = message.metadata ? JSON.parse(JSON.stringify(message.metadata)) : undefined;
          await saveAIMessage(message.content, currentConversationId, metadata);
          console.log("✅ AI message saved to database");
        } else {
          console.log("⚠️ No conversation ID available for saving AI message");
        }
        
        // Clear pending user message
        console.log("🧹 Clearing pending user message");
        setPendingUserMessage(null);
      }
    },
    onFunctionToolComplete: (action) => {
      console.log("🔧 Function tool complete:", action.type, action.payload);
      handleUIAction(action);
    },
    onMessageStreaming: (message) => {
      console.log("🌊 AI message streaming:", message.id, "content length:", message.content.length);
      // Update session with streaming message
      if (session) {
        session.isAiTyping = true;
        // Replace or add streaming message
        const existingIndex = session.messages.findIndex(m => m.id === message.id);
        if (existingIndex >= 0) {
          console.log("📝 Updating existing streaming message at index:", existingIndex);
          session.messages[existingIndex] = message;
        } else {
          console.log("➕ Adding new streaming message to session");
          session.messages.push(message);
        }
        
        // Force re-render for streaming updates
        setForceUpdate(prev => prev + 1);
      } else {
        console.log("🆔 No session available, storing in pending AI messages");
        // Store in pending messages when session isn't ready yet
        setPendingAiMessages(prev => {
          const existingIndex = prev.findIndex(m => m.id === message.id);
          if (existingIndex >= 0) {
            console.log("📝 Updating pending AI message at index:", existingIndex);
            const updated = [...prev];
            updated[existingIndex] = message;
            return updated;
          } else {
            console.log("➕ Adding new pending AI message");
            return [...prev, message];
          }
        });
      }
    },
    onMessageUpdate: (messageId, message) => {
      console.log("🔄 AI message update:", messageId, "content length:", message.content.length);
      // Update specific message in session
      if (session) {
        const messageIndex = session.messages.findIndex(m => m.id === messageId);
        if (messageIndex >= 0) {
          console.log("📝 Updating message at index:", messageIndex);
          session.messages[messageIndex] = message;
          
          // Force re-render for message updates
          setForceUpdate(prev => prev + 1);
        } else {
          console.log("⚠️ Message not found for update:", messageId);
        }
      } else {
        console.log("🆔 No session available, updating in pending AI messages");
        // Update in pending messages when session isn't ready yet
        setPendingAiMessages(prev => {
          const messageIndex = prev.findIndex(m => m.id === messageId);
          if (messageIndex >= 0) {
            console.log("📝 Updating pending AI message at index:", messageIndex);
            const updated = [...prev];
            updated[messageIndex] = message;
            return updated;
          } else {
            console.log("⚠️ Pending message not found for update:", messageId);
            return prev;
          }
        });
      }
    },
  });

  // Combine all errors
  const error = sessionError || sendError;

  // Combine all loading states
  const isLoading = sessionLoading;

  // Get all messages from session (forceUpdate ensures re-render when session is modified directly)
  const sessionMessages = session ? [...session.messages] : [];
  const allPendingMessages = [
    ...(pendingUserMessage ? [pendingUserMessage] : []),
    ...pendingAiMessages
  ];
  const messages = [...sessionMessages, ...allPendingMessages];
  
  // Use forceUpdate to trigger re-renders when needed
  useEffect(() => {
    // This effect runs when forceUpdate changes, ensuring UI updates
  }, [forceUpdate]);

  // Clear pending message when session is created and message is in session
  useEffect(() => {
    if (session && pendingUserMessage) {
      // Check if the pending message is now in the session
      const messageExists = session.messages.some(msg => msg.id === pendingUserMessage.id);
      if (messageExists) {
        setPendingUserMessage(null);
      }
    }
  }, [session, pendingUserMessage]);

  // Transfer pending AI messages to session when session becomes available
  useEffect(() => {
    if (session && pendingAiMessages.length > 0) {
      console.log("🔄 Transferring", pendingAiMessages.length, "pending AI messages to session");
      
      // Add pending AI messages to session
      for (const pendingMessage of pendingAiMessages) {
        const existingIndex = session.messages.findIndex(m => m.id === pendingMessage.id);
        if (existingIndex >= 0) {
          console.log("📝 Updating existing message in session:", pendingMessage.id);
          session.messages[existingIndex] = pendingMessage;
        } else {
          console.log("➕ Adding pending message to session:", pendingMessage.id);
          session.messages.push(pendingMessage);
        }
      }
      
      // Clear pending AI messages
      setPendingAiMessages([]);
      
      // Force re-render
      setForceUpdate(prev => prev + 1);
    }
  }, [session, pendingAiMessages]);

  // Check if AI is typing
  const isAiTyping = session?.isAiTyping || aiAdvisorProcessor.isStreaming;
  console.log("🔍 AI Typing state check:", {
    sessionIsAiTyping: session?.isAiTyping,
    processorIsStreaming: aiAdvisorProcessor.isStreaming,
    finalIsAiTyping: isAiTyping
  });

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
    const conversationId = await createSession();
    if (conversationId) {
      setShowSuggestions(true);
      setInputValue("");
      clearError();
    }
  }, [createSession]);

  const sendMessage = useCallback(async (content: string) => {
    console.log("🚀 sendMessage called with:", content);
    console.log("📄 Current session:", session);
    
    if (!user) {
      console.log("❌ No user, returning");
      return;
    }

    // Hide suggestions after first message
    setShowSuggestions(false);

    try {
      let conversationId = session?.conversationId;
      console.log("🔍 Initial conversationId:", conversationId);

      // Set current conversation ID for callbacks
      if (conversationId) {
        setCurrentConversationId(conversationId);
      }

      // If no session exists, create one first
      if (!conversationId) {
        console.log("🆕 Creating new session...");
        const newConversationId = await createSession();
        console.log("✅ New conversation created:", newConversationId);
        
        if (!newConversationId) {
          console.error("❌ Failed to create conversation");
          return;
        }
        conversationId = newConversationId;
        setCurrentConversationId(newConversationId);
        
        // Wait a bit for session state to update
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log("⏰ Waited for session state update");
      }

      // Send user message first
      console.log("📤 Sending user message to conversationId:", conversationId);
      const userMessage = await sendUserMessage(content, conversationId);
      console.log("✉️ User message sent:", userMessage);
      
      if (!userMessage) {
        console.log("❌ Failed to send user message");
        return;
      }

      // Prepare conversation history for AI advisor (include the current user message)
      const allMessages: ChatMessage[] = session ? [...session.messages, userMessage] : [userMessage];
      console.log("📚 Conversation history prepared:", allMessages.length, "messages");

      // Update UI state after preparing history
      if (!session) {
        console.log("🎯 Setting pending user message for UI");
        setPendingUserMessage(userMessage);
      } else {
        console.log("➕ Adding message to existing session");
        // Add to existing session
        session.messages.push(userMessage);
        session.isAiTyping = true;
        
        // Force re-render to show the user message immediately
        setForceUpdate(prev => prev + 1);
      }
      
      const conversationHistory = allMessages.slice(-10).map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender === "user" ? "user" as const : "ai" as const,
        timestamp: msg.created_at,
      }));
      console.log("🗣️ Conversation history for AI:", conversationHistory);

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
      console.log("🤖 AI advisor request prepared:", advisorRequest);

      // Call AI advisor stream API
      console.log("🔄 Calling AI advisor stream API...");
      const response = await fetch("/api/chat/advisor-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(advisorRequest),
      });

      console.log("📡 AI advisor response status:", response.status, response.statusText);

      if (!response.ok) {
        console.error("❌ AI advisor request failed:", response.status, response.statusText);
        throw new Error(`AI advisor request failed: ${response.status}`);
      }

      if (!response.body) {
        console.error("❌ No response body from AI advisor");
        throw new Error("No response body from AI advisor");
      }

      console.log("🌊 Starting stream processing...");
      // Process the stream
      await aiAdvisorProcessor.processStreamData(response.body);
      console.log("✅ Stream processing completed");
      
      // Set AI typing to false after stream is done
      if (session) {
        session.isAiTyping = false;
        console.log("🛑 Set AI typing to false");
      }

    } catch (error) {
      console.error("💥 Error in sendMessage:", error);
      if (session) {
        session.isAiTyping = false;
      }
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

  // Don't auto-create session - only create when first message is sent

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