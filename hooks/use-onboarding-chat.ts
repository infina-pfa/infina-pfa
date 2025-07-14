import { useState, useEffect, useCallback, useRef } from "react";
import {
  OnboardingState,
  OnboardingMessage,
  ComponentResponse,
  UseOnboardingChatReturn,
  UserProfile,
  FinancialStage,
} from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { onboardingService } from "@/lib/services/onboarding.service";

export const useOnboardingChat = (
  userId: string,
  onComplete: () => void
): UseOnboardingChatReturn => {
  const { t, i18n } = useAppTranslation(["onboarding", "common"]);

  // Core state
  const [state, setState] = useState<OnboardingState>({
    step: "ai_welcome",
    userProfile: { name: "" },
    chatMessages: [],
    currentQuestion: null,
    isComplete: false,
    conversationId: null,
    userId,
  });

  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStartedAI, setHasStartedAI] = useState(false);
  const [hasInitialHistorySaved, setHasInitialHistorySaved] = useState(false);

  // Ref to prevent double initialization in Strict Mode
  const hasInitialized = useRef(false);

  // Initialize onboarding
  useEffect(() => {
    if (userId && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeOnboarding();
    }
  }, [userId]);

  const initializeOnboarding = async () => {
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
  };

  const loadChatHistory = async (conversationId: string) => {
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

      // Mark that initial history is already saved (since we loaded it from DB)
      if (onboardingMessages.length > 0) {
        setHasInitialHistorySaved(true);
      }

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
        console.log(
          "💬 User can continue conversation from where they left off"
        );
      }
    } catch (err) {
      console.error("❌ Failed to load chat history:", err);
      // If loading fails, show initial welcome flow
      showInitialWelcomeFlow();
    }
  };

  const saveChatMessage = async (
    sender: "user" | "ai" | "system",
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      if (!state.conversationId) {
        console.warn("No conversation ID available for saving message");
        return;
      }

      // Use async save for better UX - doesn't block the UI
      await onboardingService.saveChatMessageAsync(
        state.conversationId,
        sender,
        content,
        componentId,
        metadata
      );

      console.log(`Queued ${sender} message for background processing`);
    } catch (error) {
      console.error("Failed to queue chat message:", error);
      // Don't throw error - continue with the flow even if saving fails
    }
  };

  const saveInitialConversationHistory = async () => {
    try {
      if (!state.conversationId) {
        console.warn("No conversation ID available for saving initial history");
        return;
      }

      if (hasInitialHistorySaved) {
        console.log(
          "📋 Initial conversation history already saved, skipping..."
        );
        return;
      }

      console.log(
        "💾 Saving initial conversation history with proper timestamps..."
      );

      // Use Vietnamese as default for now (same as showInitialWelcomeFlow)
      const isVietnamese = i18n.language === "vi" || true;

      // Create timestamps with clear separation (5 seconds apart) to ensure correct order
      const baseTime = Date.now() - 60000; // Start 1 minute ago
      const welcomeTimestamp = new Date(baseTime).toISOString();
      const stageSelectorTimestamp = new Date(baseTime + 5000).toISOString(); // +5 seconds

      console.log("🕐 Using timestamps:", {
        welcome: welcomeTimestamp,
        stageSelector: stageSelectorTimestamp,
      });

      // 1. Save welcome message (earliest timestamp) - NEW STAGE-FIRST VERSION
      const fullWelcomeContent = isVietnamese
        ? "Xin chào! Tôi là Fina, cố vấn tài chính AI của bạn 🤝\n\nTôi ở đây để giúp bạn kiểm soát tương lai tài chính của mình và cung cấp hướng dẫn cụ thể phù hợp với tình hình tài chính hiện tại của bạn.\n\n✨ Để tôi có thể hỗ trợ bạn tốt nhất, hãy cho tôi biết bạn đang ở giai đoạn nào trong hành trình tài chính:"
        : "Hello! I'm Fina, your AI financial advisor 🤝\n\nI'm here to help you take control of your financial future and provide specific guidance that fits your current financial situation.\n\n✨ To help you best, let me know what stage you're at in your financial journey:";

      // Use synchronous save for initial history to ensure correct order
      await onboardingService.saveChatMessage(
        state.conversationId,
        "ai",
        fullWelcomeContent,
        undefined,
        undefined,
        welcomeTimestamp
      );

      // 2. Save decision tree component (2nd timestamp)
      const decisionTreeComponentId = `decision_tree_${Date.now()}`;
      const decisionTreeContent = isVietnamese
        ? "Tôi sẽ hỏi bạn 2 câu hỏi ngắn để xác định chính xác ưu tiên tài chính của bạn:"
        : "I'll ask you 2 quick questions to accurately determine your financial priority:";

      await onboardingService.saveChatMessage(
        state.conversationId,
        "ai",
        decisionTreeContent,
        decisionTreeComponentId,
        {
          component: {
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
        },
        stageSelectorTimestamp
      );

      console.log(
        "✅ Successfully saved new stage-first conversation history in correct order"
      );
      setHasInitialHistorySaved(true);
    } catch (error) {
      console.error("❌ Failed to save initial conversation history:", error);
    }
  };

  const showInitialWelcomeFlow = () => {
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
  };

  const startOnboardingConversation = async (
    initialMessage: string,
    initialState: OnboardingState
  ) => {
    console.log(
      "Starting onboarding conversation with user input:",
      initialMessage
    );

    // ✨ IMPROVED: Use same conversation history mapping as processUserMessage
    const conversationHistory = messages.map((msg) => {
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
        }
      }

      return {
        id: msg.id,
        content: content,
        sender: msg.type === "user" ? ("user" as const) : ("ai" as const),
        timestamp: msg.timestamp.toISOString(),
      };
    });

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
      userProfile: initialState.userProfile,
      currentStep: initialState.step,
    });

    setHasStartedAI(true);
  };

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
          await startOnboardingConversation(message, state);
        } else {
          // Process the message normally
          await processUserMessage(message);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("messageFailed");
        setError(errorMessage);
      }
    },
    [state, messages, hasStartedAI, t, saveChatMessage]
  );

  const processUserMessage = async (message: string) => {
    // Prepare conversation history - include ALL AI and user messages for full context
    // ✨ IMPROVED: Include component details and response information
    const conversationHistory = messages.map((msg) => {
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
        }
      }

      return {
        id: msg.id,
        content: content,
        sender: msg.type === "user" ? ("user" as const) : ("ai" as const),
        timestamp: msg.timestamp.toISOString(),
      };
    });

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
      currentStep: state.step,
    });
  };

  const streamOnboardingAI = async (request: {
    message: string;
    conversationHistory: Array<{
      id: string;
      content: string;
      sender: "user" | "ai";
      timestamp: string;
    }>;
    userProfile: UserProfile;
    currentStep: string;
  }) => {
    try {
      setIsAIThinking(true);
      setIsStreaming(true);
      setError(null);

      const response = await fetch("/api/onboarding/ai-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader");
      }

      const decoder = new TextDecoder();
      let currentAIMessage: OnboardingMessage | null = null;
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setIsStreaming(false);
              setIsAIThinking(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "response_created") {
                // Initialize new AI message
                currentAIMessage = {
                  id: parsed.response_id || `ai-${Date.now()}`,
                  type: "ai",
                  content: "",
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, currentAIMessage!]);
                fullContent = "";
              } else if (parsed.type === "response_output_text_streaming") {
                // Update streaming content
                if (
                  currentAIMessage &&
                  parsed.response_id === currentAIMessage.id
                ) {
                  fullContent += parsed.content;
                  currentAIMessage.content = fullContent;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === currentAIMessage!.id
                        ? { ...currentAIMessage! }
                        : msg
                    )
                  );
                }
              } else if (parsed.type === "response_output_text_done") {
                // Finalize text content
                if (currentAIMessage) {
                  currentAIMessage.content = parsed.content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === currentAIMessage!.id
                        ? { ...currentAIMessage! }
                        : msg
                    )
                  );

                  // Save AI message to database
                  await saveChatMessage("ai", parsed.content);
                }
              } else if (parsed.type === "show_component") {
                const { payload } = parsed;
                const componentMessage: OnboardingMessage = {
                  id: payload.componentId,
                  type: "ai",
                  content: payload.title,
                  timestamp: new Date(),
                  component: {
                    id: payload.componentId,
                    type: payload.componentType,
                    title: payload.title,
                    context: payload.context,
                    isCompleted: false,
                  },
                };
                setMessages((prev) => [...prev, componentMessage]);

                // Save component message to database
                await saveChatMessage(
                  "ai",
                  payload.title,
                  payload.componentId,
                  {
                    component: {
                      type: payload.componentType,
                      title: payload.title,
                      context: payload.context,
                      isCompleted: false,
                    },
                  }
                );
              } else if (parsed.type === "tool_error") {
                console.error("Tool error from server:", parsed);

                // Show more detailed error information
                const errorMessage =
                  parsed.error || "Unknown tool error occurred";
                const toolName = parsed.tool_name || "unknown tool";

                console.error(`❌ Tool Error - ${toolName}: ${errorMessage}`);

                // Optionally show details if available
                if (parsed.details) {
                  console.error("Error details:", parsed.details);
                }

                // Don't set error or show retry messages - just log it
                // The AI will continue with text instead of showing component
              } else if (parsed.type === "onboarding_complete") {
                console.log("Onboarding complete signal received from server.");
                onComplete();
                setIsStreaming(false);
                setIsAIThinking(false);
              } else if (parsed.type === "error") {
                setError(parsed.error);
                const errorMessage: OnboardingMessage = {
                  id: `error-${Date.now()}`,
                  type: "ai",
                  content: `An unexpected error occurred: ${parsed.error}`,
                  timestamp: new Date(),
                  isError: true,
                };
                setMessages((prev) => [...prev, errorMessage]);
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
      setError(err instanceof Error ? err.message : "Streaming failed");
    } finally {
      setIsStreaming(false);
      setIsAIThinking(false);
    }
  };

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
        const conversationHistory = updatedMessages.map((msg) => {
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
              const completedResponseText = getResponseText(component.response);
              content += `\nUser Response: ${completedResponseText}`;
            }
          }

          return {
            id: msg.id,
            content: content,
            sender: msg.type === "user" ? ("user" as const) : ("ai" as const),
            timestamp: msg.timestamp.toISOString(),
          };
        });

        // 🔍 DEBUG: Log the manually built conversation history
        console.log(
          `🔧 Manually built conversation history: ${conversationHistory.length} messages`
        );
        console.log(
          "📋 Manual conversation history (with completed components):"
        );
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
            currentStep: state.step,
          });
          setHasStartedAI(true);
        } else {
          console.log("🚀 ~ state:", state);
          // Continue conversation with AI for subsequent responses using manual history
          await streamOnboardingAI({
            message: responseText,
            conversationHistory,
            userProfile: state.userProfile,
            currentStep: state.step,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("responseFailed");
        setError(errorMessage);
      }
    },
    [state, hasStartedAI, t, messages]
  );

  const updateProfileFromResponse = async (response: ComponentResponse) => {
    const profileUpdates: Partial<UserProfile> = {};

    // Handle decision tree response
    if (response.determinedStage && response.answers) {
      profileUpdates.identifiedStage =
        response.determinedStage as FinancialStage;
      profileUpdates.stageConfirmed = true;

      console.log(
        `✅ Decision tree determined stage: ${response.determinedStage}`
      );
      console.log(`📋 User answers:`, response.answers);
      console.log(`🧠 Reasoning:`, response.reasoning);
    }

    // Handle stage selector response (legacy)
    if (response.selectedStage) {
      profileUpdates.identifiedStage = response.selectedStage;
      profileUpdates.stageConfirmed = true;
    }

    // Handle expense categories response
    if (response.expenseBreakdown) {
      profileUpdates.expenseBreakdown = response.expenseBreakdown;

      // Calculate total monthly expenses
      const breakdown = response.expenseBreakdown;
      let total = 0;

      // Add basic expense categories
      if (breakdown.housing) total += breakdown.housing;
      if (breakdown.food) total += breakdown.food;
      if (breakdown.transportation) total += breakdown.transportation;
      if (breakdown.other) total += breakdown.other;

      // Add additional expenses if any
      if (breakdown.additional && Array.isArray(breakdown.additional)) {
        total += breakdown.additional.reduce(
          (sum, item) => sum + (item.amount || 0),
          0
        );
      }

      profileUpdates.expenses = total;
    }

    // Handle savings capacity response
    if (response.savingsCapacity) {
      profileUpdates.monthlySavingsCapacity = response.savingsCapacity;
    }

    // Handle goal confirmation response
    if (response.goalConfirmed) {
      // Goal confirmation usually comes with goalDetails
      // This will be handled in the component context
    }

    // Parse different types of responses
    if (response.textValue) {
      // Extract information from text responses
      const text = response.textValue.toLowerCase();

      // Extract name
      if (text.includes("tên") || text.includes("name")) {
        const namePatterns = [
          /(?:tên|name)(?:\s+(?:là|is))?(?:\s+tôi)?(?:\s+)?(?:là)?(?:\s+)?([^,.\n,]+)/i,
          /tôi\s+là\s+([^,.\n]+)/i,
          /mình\s+là\s+([^,.\n]+)/i,
        ];

        for (const pattern of namePatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            profileUpdates.name = match[1].trim();
            break;
          }
        }
      }

      // Extract age
      const ageMatch = text.match(
        /(\d+)\s*tuổi|age.*?(\d+)|(\d+).*?(?:years?\s+old)/i
      );
      if (ageMatch) {
        const age = parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3]);
        if (age && age >= 15 && age <= 100) {
          profileUpdates.age = age;
        }
      }

      // Extract income
      const incomeMatch = text.match(
        /thu\s*nhập.*?(\d+(?:\.\d+)?)\s*(?:triệu|tr)|income.*?(\d+(?:\.\d+)?)\s*(?:million|mil)/i
      );
      if (incomeMatch) {
        const income = parseFloat(incomeMatch[1] || incomeMatch[2]) * 1000000;
        profileUpdates.income = income;
      }

      // Extract expenses
      const expenseMatch = text.match(
        /tiêu.*?(\d+(?:\.\d+)?)\s*(?:triệu|tr)|spend.*?(\d+(?:\.\d+)?)\s*(?:million|mil)/i
      );
      if (expenseMatch) {
        const expenses =
          parseFloat(expenseMatch[1] || expenseMatch[2]) * 1000000;
        profileUpdates.expenses = expenses;
      }
    }

    // Handle other response types
    if (response.financialValue) {
      // This would need context about what type of financial input it was
      // For now, we'll need the component to specify the field
    }

    if (response.selectedOption) {
      // Handle goal selection, risk tolerance, etc.
      // This would need component context to know which field to update
    }

    if (Object.keys(profileUpdates).length > 0) {
      await onboardingService.updateUserProfile(profileUpdates);

      setState((prev) => ({
        ...prev,
        userProfile: { ...prev.userProfile, ...profileUpdates },
      }));
    }
  };

  const getResponseText = (response: ComponentResponse): string => {
    // Handle decision tree response
    if (response.determinedStage && response.answers) {
      const stageNames = {
        debt: "Get Out of Debt",
        start_saving: "Start Saving",
        start_investing: "Start Investing",
      };

      const stageName =
        stageNames[response.determinedStage as keyof typeof stageNames] ||
        response.determinedStage;
      return `Determined financial stage: ${stageName}`;
    }

    // Handle stage selector response (legacy)
    if (response.selectedStage) {
      const stageNames = {
        debt: "Get Out of Debt",
        start_saving: "Start Saving",
        start_investing: "Start Investing",
      };

      const stageName =
        stageNames[response.selectedStage as keyof typeof stageNames] ||
        response.selectedStage;
      return `Selected stage: ${stageName}`;
    }

    // Handle expense breakdown response
    if (response.expenseBreakdown) {
      const breakdown = response.expenseBreakdown;
      let total = 0;

      if (breakdown.housing) total += breakdown.housing;
      if (breakdown.food) total += breakdown.food;
      if (breakdown.transportation) total += breakdown.transportation;
      if (breakdown.other) total += breakdown.other;
      if (breakdown.additional && Array.isArray(breakdown.additional)) {
        total += breakdown.additional.reduce(
          (sum, item) => sum + (item.amount || 0),
          0
        );
      }

      const formattedTotal = total.toLocaleString("vi-VN");
      return `Monthly expenses: ${formattedTotal} VND`;
    }

    // Handle savings capacity response
    if (response.savingsCapacity) {
      const formattedAmount = response.savingsCapacity.toLocaleString("vi-VN");
      return `Monthly savings capacity: ${formattedAmount} VND`;
    }

    // Handle goal confirmation
    if (response.goalConfirmed !== undefined) {
      return response.goalConfirmed
        ? "Goal confirmed"
        : "Goal needs adjustment";
    }

    if (response.textValue) {
      return response.textValue;
    } else if (response.selectedOption) {
      return response.selectedOption;
    } else if (
      response.financialValue !== undefined &&
      response.financialValue !== null
    ) {
      // ✨ IMPROVED: More descriptive financial value formatting
      const formattedValue = response.financialValue.toLocaleString("vi-VN");
      return `${formattedValue} VND`;
    } else if (response.rating !== undefined && response.rating !== null) {
      return `Rated ${response.rating}/5`;
    } else if (
      response.sliderValue !== undefined &&
      response.sliderValue !== null
    ) {
      return `${response.sliderValue}%`;
    }
    return "Completed"; // More descriptive than "ok"
  };

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
