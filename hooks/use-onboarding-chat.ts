import { useCallback } from "react";
import {
  OnboardingMessage,
  ComponentResponse,
  UseOnboardingChatReturn,
} from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { useOnboardingState } from "./onboarding/use-onboarding-state";
import { useOnboardingMessages } from "./onboarding/use-onboarding-messages";
import { useOnboardingAI } from "./onboarding/use-onboarding-ai";
import { useOnboardingProfile } from "./onboarding/use-onboarding-profile";
import { useOnboardingInitialization } from "./onboarding/use-onboarding-initialization";
// Import onboarding service (to avoid circular dependencies)
import { onboardingService } from "@/lib/services/onboarding.service";

/**
 * Onboarding chat hook that follows SOLID principles
 * Breaks down the monolithic hook into smaller, focused hooks
 */
export const useOnboardingChat = (
  userId: string,
  onComplete: () => void
): UseOnboardingChatReturn => {
  const { t } = useAppTranslation(["onboarding", "common"]);

  // State management
  const {
    state,
    setState,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    isAIThinking,
    setIsAIThinking,
    isStreaming,
    setIsStreaming,
    error,
    setError,
    hasStartedAI,
    setHasStartedAI,
    hasInitialHistorySaved,
    setHasInitialHistorySaved,
    hasInitialized,
  } = useOnboardingState(userId);

  // Message handling
  const { saveChatMessage, saveInitialConversationHistory, getResponseText } =
    useOnboardingMessages({
      conversationId: state.conversationId,
      hasInitialHistorySaved,
      setHasInitialHistorySaved,
    });

  // AI streaming
  const { streamOnboardingAI } = useOnboardingAI({
    setIsAIThinking,
    setIsStreaming,
    setError,
    setMessages,
    saveChatMessage,
    onComplete,
  });

  // Profile management
  const { updateProfileFromResponse } = useOnboardingProfile({
    setState,
  });

  // Initialization
  useOnboardingInitialization({
    userId,
    hasInitialized,
    setState,
    setMessages,
    setIsLoading,
    setError,
    setIsAIThinking,
    setIsStreaming,
    saveInitialConversationHistory,
  });

  // Build conversation history for AI
  const buildConversationHistory = useCallback(
    (currentMessages: OnboardingMessage[]) => {
      return currentMessages.map((msg) => {
        let content = msg.content || "";

        // For AI messages with components, include component context
        if (msg.type === "ai" && msg.component) {
          const component = msg.component;

          // Add component title and context to content
          content = `${content}${content ? "\n\n" : ""}[Component: ${
            component.type
          }]`;
          if (component.title) {
            content += `\nTitle: ${component.title}`;
          }

          // If component is completed, include the user's response
          if (component.isCompleted && component.response) {
            const responseText = getResponseText(component.response);
            content += `\nUser Response: ${responseText}`;

            // Also include structured data for components that provide it
            if (component.response.expenseBreakdown) {
              content += `\nExpense Breakdown Data: ${JSON.stringify(
                component.response.expenseBreakdown
              )}`;
            }
            if (component.response.budgetingStyle) {
              content += `\nBudgeting Style: ${component.response.budgetingStyle}`;
            }
          }
        }

        return {
          id: msg.id,
          content: content,
          sender: msg.type === "user" ? ("user" as const) : ("ai" as const),
          timestamp: msg.timestamp.toISOString(),
        };
      });
    },
    [getResponseText]
  );

  // Start onboarding conversation
  const startOnboardingConversation = useCallback(
    async (initialMessage: string) => {
      console.log("Starting onboarding conversation with user input:", initialMessage);

      const conversationHistory = buildConversationHistory(messages);

      // 🔍 DEBUG: Log conversation history at start
      console.log(
        `🔍 Starting with full conversation history: ${conversationHistory.length} messages`
      );
      console.log("📋 Starting conversation history:");
      conversationHistory.forEach((msg, index) => {
        console.log(
          `${index + 1}. [${msg.sender}] (${msg.id}): "${msg.content}" (${
            msg.content.length
          } chars)`
        );
      });

      // Start AI conversation with the user's introduction
      await streamOnboardingAI({
        message: initialMessage,
        conversationHistory,
        userProfile: state.userProfile,
      });

      setHasStartedAI(true);
    },
    [messages, state.userProfile, buildConversationHistory, streamOnboardingAI, setHasStartedAI]
  );

  // Process user message
  const processUserMessage = useCallback(
    async (message: string) => {
      const conversationHistory = buildConversationHistory(messages);

      // Add current message
      conversationHistory.push({
        id: `current-${Date.now()}`,
        content: message,
        sender: "user" as const,
        timestamp: new Date().toISOString(),
      });

      // 🔍 DEBUG: Log detailed conversation history to identify issues
      console.log(
        `🔍 Sending full conversation history: ${conversationHistory.length} messages`
      );
      console.log("📋 Detailed conversation history:");
      conversationHistory.forEach((msg, index) => {
        console.log(
          `${index + 1}. [${msg.sender}] (${msg.id}): "${msg.content}" (${
            msg.content.length
          } chars)`
        );
      });

      // 🔍 DEBUG: Check for empty or short messages that might be causing issues
      const emptyMessages = conversationHistory.filter(
        (msg) => !msg.content || msg.content.length < 5
      );
      if (emptyMessages.length > 0) {
        console.warn(
          `⚠️ Found ${emptyMessages.length} messages with empty/short content:`,
          emptyMessages
        );
      }

      await streamOnboardingAI({
        message,
        conversationHistory,
        userProfile: state.userProfile,
      });
    },
    [messages, state.userProfile, buildConversationHistory, streamOnboardingAI]
  );

  // Send message
  const sendMessage = useCallback(
    async (message: string) => {
      try {
        // Add user message
        const userMessage: OnboardingMessage = {
          id: `user-${Date.now()}`,
          type: "user",
          content: message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Save user message to database
        await saveChatMessage("user", message);

        // If this is the first user message, start AI conversation
        if (!hasStartedAI) {
          await startOnboardingConversation(message);
        } else {
          // Process the message normally
          await processUserMessage(message);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t("messageFailed");
        setError(errorMessage);
      }
    },
    [
      hasStartedAI,
      saveChatMessage,
      startOnboardingConversation,
      processUserMessage,
      setMessages,
      setError,
      t,
    ]
  );

  // Handle component response
  const handleComponentResponse = useCallback(
    async (componentId: string, response: ComponentResponse) => {
      try {
        // Save the response to backend
        await onboardingService.saveUserResponse(componentId, response);

        // 🔧 BUILD UPDATED MESSAGES MANUALLY to avoid async state timing issues
        let updatedMessages = [...messages];

        // Update component as completed in our manual array
        updatedMessages = updatedMessages.map((msg) => {
          if (msg.component?.id === componentId) {
            return {
              ...msg,
              component: {
                ...msg.component,
                isCompleted: true,
                response,
              },
            };
          }
          return msg;
        });

        // Update user profile based on response
        await updateProfileFromResponse(response);

        // Get response text for the message
        const responseText = getResponseText(response);

        // Add user message to our manual array
        const userMessage: OnboardingMessage = {
          id: `user-${Date.now()}`,
          type: "user",
          content: responseText,
          timestamp: new Date(),
        };

        updatedMessages = [...updatedMessages, userMessage];

        // Save user response to database
        await saveChatMessage("user", responseText, componentId, {
          componentResponse: response,
        });

        // 🔧 UPDATE STATE with complete messages array
        setMessages(updatedMessages);

        // 🔧 BUILD CONVERSATION HISTORY from our updated array (not from state)
        const conversationHistory = buildConversationHistory(updatedMessages);

        // 🔍 DEBUG: Log the manually built conversation history
        console.log(
          `🔧 Manually built conversation history: ${conversationHistory.length} messages`
        );
        console.log("📋 Manual conversation history (with completed components):");
        conversationHistory.forEach((msg, index) => {
          console.log(
            `${index + 1}. [${msg.sender}] (${msg.id}): "${msg.content}" (${
              msg.content.length
            } chars)`
          );
        });

        // If this is the first component response (introduction), start AI conversation
        if (!hasStartedAI && componentId.includes("introduction_template")) {
          // Save the initial conversation history first (welcome + suggestion + component)
          await saveInitialConversationHistory();

          // For introduction, use manual conversation history
          await streamOnboardingAI({
            message: responseText,
            conversationHistory,
            userProfile: state.userProfile,
          });
          setHasStartedAI(true);
        } else {
          console.log("🚀 ~ state:", state);
          // Continue conversation with AI for subsequent responses using manual history
          await streamOnboardingAI({
            message: responseText,
            conversationHistory,
            userProfile: state.userProfile,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t("responseFailed");
        setError(errorMessage);
      }
    },
    [
      messages,
      state,
      hasStartedAI,
      updateProfileFromResponse,
      getResponseText,
      saveChatMessage,
      setMessages,
      buildConversationHistory,
      saveInitialConversationHistory,
      streamOnboardingAI,
      setHasStartedAI,
      setError,
      t,
    ]
  );

  return {
    state,
    messages,
    isLoading,
    isAIThinking,
    isStreaming,
    error,
    sendMessage,
    handleComponentResponse,
  };
};
