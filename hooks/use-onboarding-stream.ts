import { useState, useCallback, useRef, useEffect } from "react";
import { StreamEvent } from "@/lib/types/streaming.types";
import {
  OnboardingComponent,
  ComponentResponse,
  UserProfile,
  FinancialStage,
  OnboardingComponentType,
} from "@/lib/types/onboarding.types";
import { useTranslation } from "react-i18next";
import { onboardingService } from "@/lib/services/onboarding.service";

interface OnboardingMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  createdAt: string;
  component?: OnboardingComponent;
}

interface UseOnboardingStreamReturn {
  // State
  messages: OnboardingMessage[];
  isLoading: boolean;
  error: string | null;
  isThinking: boolean;
  isStreaming: boolean;
  showSuggestions: boolean;
  isPreparingTool: boolean;
  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  handleComponentResponse: (
    componentId: string,
    response: ComponentResponse
  ) => Promise<void>;

  // Input handling
  handleSubmit: (text: string) => Promise<void>;
  isSubmitting: boolean;
}

export const useOnboarding = (): UseOnboardingStreamReturn => {
  // State management
  const { t } = useTranslation();
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPreparingTool, setIsPreparingTool] = useState(false);
  const [showSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const streamFirstMessagesRef = useRef(false);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Define handleStream as a useCallback to ensure it's stable
  const handleStream = useCallback(async (readable: ReadableStream) => {
    try {
      setIsStreaming(true);
      setIsThinking(true);
      setError(null);

      const reader = readable.getReader();
      if (!reader) {
        throw new Error("No response body reader");
      }

      const decoder = new TextDecoder();
      let currentAIMessageId: string | null = null;
      let fullContent = "";
      let buffer = "";
      const aiMessages: OnboardingMessage[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process line by line instead of splitting by \n\n
        const lines = buffer.split("\n");
        // Keep incomplete line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          // Skip empty lines (they separate SSE events but we don't need to process them)
          if (line === "") continue;

          // Check for SSE data field
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();

            if (data === "[DONE]") {
              setIsStreaming(false);
              setIsThinking(false);
              break;
            }

            try {
              const parsed = JSON.parse(data) as StreamEvent;

              if (
                parsed.type === "status" &&
                parsed.data.status_type === "started"
              ) {
                setIsThinking(false);
                if (!currentAIMessageId) {
                  currentAIMessageId = `ai-${Date.now()}`;
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: currentAIMessageId!,
                      type: "ai",
                      content: fullContent,
                      createdAt: new Date().toISOString(),
                    },
                  ]);
                }
              } else if (parsed.type === "text") {
                fullContent += parsed.content;
                if (!currentAIMessageId) {
                  currentAIMessageId = `ai-${Date.now()}`;
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: currentAIMessageId!,
                      type: "ai",
                      content: fullContent,
                      createdAt: new Date().toISOString(),
                    },
                  ]);
                } else {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === currentAIMessageId
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                }
              } else if (
                parsed.type === "status" &&
                parsed.data.status_type === "preparing_tool"
              ) {
                setIsPreparingTool(true);
              } else if (
                parsed.type === "status" &&
                parsed.data.status_type === "text_completed"
              ) {
                const finalContent =
                  parsed.content || parsed.data.message || "";
                if (currentAIMessageId && finalContent) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === currentAIMessageId
                        ? {
                            ...msg,
                            content: finalContent,
                            isStreaming: false,
                          }
                        : msg
                    )
                  );
                  aiMessages.push({
                    id: currentAIMessageId,
                    type: "ai",
                    content: finalContent,
                    createdAt: new Date().toISOString(),
                  });
                  fullContent = "";
                  currentAIMessageId = null;
                }
              } else if (
                parsed.type === "function_result" &&
                parsed.data.result.component_id
              ) {
                setIsPreparingTool(false);
                const functionCallMessage: OnboardingMessage = {
                  id: `ai-${Date.now()}`,
                  type: "ai",
                  content: parsed.content || "",
                  createdAt: new Date().toISOString(),
                  component: {
                    id: parsed.data.result.component_id,
                    title: parsed.data.result.title,
                    type: parsed.data.result
                      .component_type as OnboardingComponentType,
                    context: parsed.data.result.context,
                    isCompleted: false,
                  },
                };
                setMessages((prev) => [...prev, functionCallMessage]);
                aiMessages.push({ ...functionCallMessage });
              } else if (parsed.type === "error") {
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }

      await saveAiResponses(aiMessages);
    } catch (err) {
      console.error("Streaming error:", err);
      setError(err instanceof Error ? err.message : "Streaming failed");
    } finally {
      setIsStreaming(false);
      setIsThinking(false);
      setIsSubmitting(false);
    }
  }, []);

  // Fetch initial messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      setIsFetchingHistory(true);
      try {
        const data = await onboardingService.getMessages();
        setMessages(
          data.map((message) => ({
            id: message.id,
            type: message.sender as "user" | "ai" | "system",
            content: message.content,
            component: message.metadata as unknown as OnboardingComponent,
            createdAt: message.createdAt,
          }))
        );
      } finally {
        setIsFetchingHistory(false);
      }
    };
    fetchMessages();
  }, []);

  // Stream first messages if no history exists
  useEffect(() => {
    if (
      !isFetchingHistory &&
      messages.length === 0 &&
      !streamFirstMessagesRef.current
    ) {
      streamFirstMessagesRef.current = true;
      // Start streaming default messages
      const streamFirstMessages = async () => {
        try {
          const response = await fetch("/api/onboarding/stream-first-messages");

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          if (!response.body) {
            throw new Error("No response body");
          }

          await handleStream(response.body);
        } catch (error) {
          console.error("Error streaming first messages:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load initial messages"
          );
        }
      };

      streamFirstMessages();
    }
  }, [isFetchingHistory, messages.length, handleStream]);

  // Stream message from API
  const streamMessage = useCallback(
    async (userMessage: string) => {
      try {
        setIsStreaming(true);
        setIsThinking(true);
        setError(null);

        // Add user message
        const userMsg: OnboardingMessage = {
          id: `user-${Date.now()}`,
          type: "user",
          content: userMessage,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);

        // Call streaming API
        const stream = await onboardingService.streamMessage({
          message: userMessage,
        });
        await handleStream(stream);
      } catch (err) {
        console.error("Streaming error:", err);
        setError(err instanceof Error ? err.message : "Streaming failed");
      } finally {
        setIsStreaming(false);
        setIsThinking(false);
        setIsSubmitting(false);
      }
    },
    [handleStream]
  );

  const saveAiResponses = useCallback(
    async (aiMessages: OnboardingMessage[]) => {
      for (const message of aiMessages) {
        await onboardingService.saveMessage({
          message: message.content,
          sender: "ai",
          component_id: message.component?.id,
          metadata: message.component as unknown as Record<string, unknown>,
        });
      }
    },
    []
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isSubmitting) return;

      setIsSubmitting(true);
      await streamMessage(content);
    },
    [isSubmitting, streamMessage]
  );

  // Handle submit
  const handleSubmit = useCallback(
    async (text: string) => {
      if (!text.trim() || isSubmitting) return;

      const message = text.trim();
      await sendMessage(message);
    },
    [isSubmitting, sendMessage]
  );

  const getResponseText = useCallback(
    (response: ComponentResponse): string => {
      // First, check if response has a userMessage (our new detailed responses)
      if (response.userMessage) {
        return response.userMessage;
      }

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
        return `Giai đoạn tài chính: ${t(stageName, { ns: "onboarding" })}`;
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

      // Handle expense breakdown response with detailed breakdown
      if (response.expenseBreakdown) {
        const breakdown = response.expenseBreakdown;
        const details: string[] = [];
        let total = 0;

        // Process all category expenses
        Object.entries(breakdown).forEach(([key, value]) => {
          if (typeof value === "number" && value > 0) {
            total += value;
            const formattedValue = value.toLocaleString("vi-VN");

            // Map common category IDs to display names
            const categoryNames: Record<string, string> = {
              housing: "Nhà ở (thuê nhà/điện/nước)",
              food: "Ăn uống",
              transport: "Di chuyển",
              other: "Chi tiêu khác (giải trí, mua sắm, v.v.)",
            };

            const displayName = categoryNames[key] || key;
            details.push(`${displayName}: ${formattedValue} VND`);
          }
        });

        const formattedTotal = total.toLocaleString("vi-VN");
        const detailsText =
          details.length > 0 ? `\n- ${details.join("\n- ")}` : "";

        return `Chi phí hàng tháng:${detailsText}\n\nTổng cộng: ${formattedTotal} VND`;
      }

      // Handle savings capacity response
      if (response.savingsCapacity) {
        const formattedAmount =
          response.savingsCapacity.toLocaleString("vi-VN");
        return `Monthly savings capacity: ${formattedAmount} VND`;
      }

      // Handle goal confirmation
      if (response.goalConfirmed !== undefined) {
        // Use userMessage if available, otherwise fallback to simple message
        if (response.userMessage) {
          return response.userMessage;
        }
        return response.goalConfirmed
          ? "Goal confirmed"
          : "Goal needs adjustment";
      }

      // Handle education content completion
      if (response.educationCompleted) {
        return response.textValue || "Đã hoàn thành nội dung giáo dục";
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
        // Use unit from response if available, otherwise fallback to no unit
        const unit = response.sliderUnit || "";
        return unit
          ? `${response.sliderValue} ${unit}`
          : `${response.sliderValue}`;
      }
      return "Completed"; // More descriptive than "ok"
    },
    [t]
  );

  // Handle component response
  const handleComponentResponse = useCallback(
    async (componentId: string, response: ComponentResponse) => {
      // Mark component as completed
      setMessages((prev) =>
        prev.map((msg) => {
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
        })
      );

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
        const aimessage: OnboardingMessage = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: response.reasoning || "",
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aimessage]);

        await saveAiResponses([aimessage]);
      }

      // Handle expense categories response
      if (response.expenseBreakdown) {
        profileUpdates.expenseBreakdown = response.expenseBreakdown;

        // Calculate total monthly expenses from all categories
        const breakdown = response.expenseBreakdown;
        let total = 0;

        // Sum all numeric values
        Object.values(breakdown).forEach((value) => {
          if (typeof value === "number") {
            total += value;
          }
        });

        profileUpdates.expenses = total;
      }

      // Handle savings capacity response
      if (response.savingsCapacity) {
        profileUpdates.monthlySavingsCapacity = response.savingsCapacity;
      }

      if (response.monetaryValues) {
        profileUpdates.emergencyFundGoal =
          response.monetaryValues.emergencyFund;
        profileUpdates.expenses = response.monetaryValues.livingExpenses;
      }

      if (response.selectedPhilosophy) {
        profileUpdates.budgetingStyle = response.selectedPhilosophy;
      }

      if (response.goalDetails) {
        profileUpdates.goalDetails = response.goalDetails;
      }

      console.log("🚀 ~ profileUpdates:", profileUpdates);
      console.log("🚀 ~ response:", response);

      // Update profile
      await fetch("/api/onboarding/profile-v2", {
        method: "PUT",
        body: JSON.stringify(profileUpdates),
      });

      await streamMessage(getResponseText(response));
    },
    []
  );

  return {
    // State
    messages,
    isLoading,
    error,
    isThinking,
    isStreaming,
    showSuggestions,
    isPreparingTool,
    // Actions
    sendMessage,
    clearError,
    handleComponentResponse,
    // Input handling
    handleSubmit,
    isSubmitting,
  };
};
