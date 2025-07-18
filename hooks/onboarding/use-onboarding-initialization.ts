import { useEffect, useCallback } from "react";
import { useAppTranslation } from "@/hooks/use-translation";
import { onboardingService } from "@/lib/services/onboarding.service";
import { OnboardingMessage, OnboardingState } from "@/lib/types/onboarding.types";

interface UseOnboardingInitializationProps {
  userId: string;
  hasInitialized: React.MutableRefObject<boolean>;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  setMessages: React.Dispatch<React.SetStateAction<OnboardingMessage[]>>;
  setIsLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setIsAIThinking: (value: boolean) => void;
  setIsStreaming: (value: boolean) => void;
  saveInitialConversationHistory: () => Promise<void>;
}

interface UseOnboardingInitializationReturn {
  initializeOnboarding: () => Promise<void>;
  showInitialWelcomeFlow: () => void;
}

export const useOnboardingInitialization = ({
  userId,
  hasInitialized,
  setState,
  setMessages,
  setIsLoading,
  setError,
  setIsAIThinking,
  setIsStreaming,
  saveInitialConversationHistory,
}: UseOnboardingInitializationProps): UseOnboardingInitializationReturn => {
  const { t, i18n } = useAppTranslation(["onboarding", "common"]);

  const showInitialWelcomeFlow = useCallback(() => {
    // Use Vietnamese as default for now
    const isVietnamese = i18n.language === "vi" || true; // Force Vietnamese for testing

    // Start with empty messages to show chat interface immediately
    setMessages([]);

    // Simulate AI thinking before first message
    setIsAIThinking(true);

    // Stream welcome message after a delay
    setTimeout(() => {
      setIsAIThinking(false);
      setIsStreaming(true);

      const welcomeMessage: OnboardingMessage = {
        id: `welcome-${Date.now()}`,
        type: "ai",
        content: "",
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);

      // NEW STAGE-FIRST WELCOME MESSAGE
      const fullWelcomeContent = isVietnamese
        ? "Xin chào! Tôi là Fina, cố vấn tài chính AI của bạn 🤝\n\nTôi ở đây để giúp bạn kiểm soát tương lai tài chính của mình và cung cấp hướng dẫn cụ thể phù hợp với tình hình tài chính hiện tại của bạn.\n\n✨ Để tôi có thể hỗ trợ bạn tốt nhất, hãy cho tôi biết bạn đang ở giai đoạn nào trong hành trình tài chính:"
        : "Hello! I'm Fina, your AI financial advisor 🤝\n\nI'm here to help you take control of your financial future and provide specific guidance that fits your current financial situation.\n\n✨ To help you best, let me know what stage you're at in your financial journey:";

      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < fullWelcomeContent.length) {
          const chunkSize = Math.floor(Math.random() * 4) + 2; // Random chunk size 2-5 characters
          currentIndex += chunkSize;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === welcomeMessage.id
                ? { ...msg, content: fullWelcomeContent.slice(0, currentIndex) }
                : msg
            )
          );
        } else {
          clearInterval(streamInterval);
          setIsStreaming(false);

          // After welcome message completes, show stage selector component immediately
          setTimeout(() => {
            setIsAIThinking(true);

            setTimeout(() => {
              setIsAIThinking(false);

              // Add decision tree component directly without more text
              const decisionTreeMessage: OnboardingMessage = {
                id: `decision-tree-${Date.now()}`,
                type: "ai",
                content: isVietnamese
                  ? "Tôi sẽ hỏi bạn 2 câu hỏi ngắn để xác định chính xác ưu tiên tài chính của bạn:"
                  : "I'll ask you 2 quick questions to accurately determine your financial priority:",
                timestamp: new Date(),
                component: {
                  id: `decision_tree_${Date.now()}`,
                  type: "decision_tree",
                  title: isVietnamese
                    ? "Hãy xác định ưu tiên tài chính của bạn"
                    : "Let's determine your financial priority",
                  context: {
                    questions: [
                      {
                        id: "high_interest_debt",
                        question: isVietnamese
                          ? "Bạn có bất kỳ khoản nợ nào, chẳng hạn như dư nợ thẻ tín dụng hoặc các khoản vay cá nhân, với lãi suất cao hơn 8% không?"
                          : "Do you have any debt, such as credit card balances or personal loans, with an interest rate higher than 8%?",
                        explanation: isVietnamese
                          ? "Vui lòng loại trừ khoản thế chấp chính hoặc các khoản vay sinh viên lãi suất thấp."
                          : "Please exclude your primary mortgage or low-interest student loans from this.",
                        yesLabel: isVietnamese ? "Có" : "Yes",
                        noLabel: isVietnamese ? "Không" : "No",
                      },
                      {
                        id: "emergency_fund",
                        question: isVietnamese
                          ? "Nếu bạn mất nguồn thu nhập chính ngày hôm nay, bạn có đủ tiền mặt trong tài khoản tiết kiệm dễ tiếp cận để trang trải tất cả các chi phí sinh hoạt thiết yếu trong ít nhất ba tháng không?"
                          : "If you were to lose your primary source of income today, do you have enough cash in a readily accessible savings account to cover all of your essential living expenses for at least three months?",
                        explanation: isVietnamese
                          ? "Chi phí thiết yếu bao gồm nhà ở, thực phẩm, tiện ích, giao thông và các nhu cầu thiết yếu khác."
                          : "Essential expenses include housing, food, utilities, transportation, and other necessities.",
                        yesLabel: isVietnamese ? "Có" : "Yes",
                        noLabel: isVietnamese ? "Không" : "No",
                      },
                    ],
                  },
                  isCompleted: false,
                },
              };

              setMessages((prev) => [...prev, decisionTreeMessage]);
            }, 1000); // Short delay before showing component
          }, 800); // Brief pause after welcome message
        }
      }, 30); // Faster streaming for better UX
    }, 1200); // Initial delay before starting

    // Save the new initial flow to chat history
    saveInitialConversationHistory();
  }, [
    i18n.language,
    setMessages,
    setIsAIThinking,
    setIsStreaming,
    saveInitialConversationHistory,
  ]);

  const loadChatHistory = useCallback(
    async (conversationId: string) => {
      try {
        const { messages: chatHistory } = await onboardingService.loadChatHistory(
          conversationId
        );

        // Convert chat history to OnboardingMessage format - simplified version
        const onboardingMessages: OnboardingMessage[] = chatHistory.map((msg) => {
          const chatMsg = msg as {
            id: string;
            sender: "user" | "ai" | "system";
            content: string;
            created_at: string;
            component_id?: string;
            metadata?: Record<string, unknown>;
          };

          // Note: Component reconstruction will be handled by the conversation flow
          // For now, just preserve the basic message structure
          const component = undefined;

          return {
            id: chatMsg.id,
            type: chatMsg.sender === "user" ? "user" : "ai",
            content: chatMsg.content,
            timestamp: new Date(chatMsg.created_at),
            component,
            metadata: chatMsg.metadata,
          };
        });

        setMessages(onboardingMessages);

        // If we have chat history, user can continue from where they left off
        console.log(
          `✅ Loaded ${onboardingMessages.length} messages from chat history`
        );

        // Check if there are any component messages that might need user interaction
        const componentMessages = onboardingMessages.filter(
          (msg) => msg.metadata?.component
        );

        if (componentMessages.length > 0) {
          console.log(
            `🔧 Found ${componentMessages.length} component messages in history`
          );
        }

        // If the last message is from AI and user hasn't responded, they can continue
        const lastMessage = onboardingMessages[onboardingMessages.length - 1];
        if (lastMessage?.type === "ai") {
          console.log("💬 User can continue conversation from where they left off");
        }
      } catch (err) {
        console.error("❌ Failed to load chat history:", err);
        // If loading fails, show initial welcome flow
        showInitialWelcomeFlow();
      }
    },
    [setMessages, showInitialWelcomeFlow]
  );

  const initializeOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const initialState = await onboardingService.initializeOnboarding(userId);
      setState(initialState);

      // Check if there's existing chat history
      if (initialState.conversationId) {
        const hasHistory = await onboardingService.hasExistingChatHistory(
          initialState.conversationId
        );

        if (hasHistory) {
          // Load existing chat history
          await loadChatHistory(initialState.conversationId);
        } else {
          // Show initial welcome message and introduction template WITHOUT calling AI
          showInitialWelcomeFlow();
        }
      } else {
        // Show initial welcome message if no conversation ID
        showInitialWelcomeFlow();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("initializationFailed");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    userId,
    setState,
    setIsLoading,
    setError,
    showInitialWelcomeFlow,
    loadChatHistory,
    t,
  ]);

  // Initialize onboarding on mount
  useEffect(() => {
    if (userId && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeOnboarding();
    }
  }, [userId, hasInitialized, initializeOnboarding]);

  return {
    initializeOnboarding,
    showInitialWelcomeFlow,
  };
};