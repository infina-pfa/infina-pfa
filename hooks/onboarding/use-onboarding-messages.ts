import { useAppTranslation } from "@/hooks/use-translation";
import { chatMessageManager } from "@/lib/services-v2/chat-message-manager.service";
import { ComponentResponse } from "@/lib/types/onboarding.types";
import { useCallback } from "react";

interface UseOnboardingMessagesProps {
  conversationId: string | null;
  hasInitialHistorySaved: boolean;
  setHasInitialHistorySaved: (value: boolean) => void;
}

interface UseOnboardingMessagesReturn {
  saveChatMessage: (
    sender: "user" | "ai" | "system",
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>,
    critical?: boolean
  ) => Promise<void>;
  saveInitialConversationHistory: () => Promise<void>;
  getResponseText: (response: ComponentResponse) => string;
}

export const useOnboardingMessages = ({
  conversationId,
  hasInitialHistorySaved,
  setHasInitialHistorySaved,
}: UseOnboardingMessagesProps): UseOnboardingMessagesReturn => {
  const { t, i18n } = useAppTranslation(["onboarding", "common"]);

  const saveChatMessage = useCallback(
    async (
      sender: "user" | "ai" | "system",
      content: string,
      componentId?: string,
      metadata?: Record<string, unknown>,
      critical: boolean = false
    ) => {
      try {
        if (!conversationId) {
          console.warn("No conversation ID available for saving message");
          return;
        }

        // Use the chat message manager for proper ordering
        await chatMessageManager.saveChatMessage(
          conversationId,
          sender,
          content,
          componentId,
          metadata,
          undefined, // customTimestamp
          critical
        );
      } catch (error) {
        console.error("Failed to save chat message:", error);
        // Don't throw error - continue with the flow even if saving fails
      }
    },
    [conversationId]
  );

  const saveInitialConversationHistory = useCallback(async () => {
    try {
      if (!conversationId) {
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
      await chatMessageManager.saveChatMessage(
        conversationId,
        "ai",
        fullWelcomeContent,
        undefined,
        undefined,
        welcomeTimestamp,
        true // critical: initial setup message
      );

      // 2. Save decision tree component (2nd timestamp)
      const decisionTreeComponentId = `decision_tree_${Date.now()}`;
      const decisionTreeContent = isVietnamese
        ? "Tôi sẽ hỏi bạn 2 câu hỏi ngắn để xác định chính xác ưu tiên tài chính của bạn:"
        : "I'll ask you 2 quick questions to accurately determine your financial priority:";

      await chatMessageManager.saveChatMessage(
        conversationId,
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
        stageSelectorTimestamp,
        true // critical: initial setup message
      );

      console.log(
        "✅ Successfully saved new stage-first conversation history in correct order"
      );
      setHasInitialHistorySaved(true);
    } catch (error) {
      console.error("❌ Failed to save initial conversation history:", error);
    }
  }, [
    conversationId,
    hasInitialHistorySaved,
    setHasInitialHistorySaved,
    i18n.language,
  ]);

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

  return {
    saveChatMessage,
    saveInitialConversationHistory,
    getResponseText,
  };
};
