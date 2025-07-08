import { ConversationMessage } from "@/lib/types/ai-streaming.types";

interface FinancialContext {
  totalIncome?: number;
  totalExpenses?: number;
  currentBudgets?: number;
  hasCompletedOnboarding?: boolean;
}

interface LearningContext {
  currentLevel?: number;
  xp?: number;
  currentGoal?: string;
}

export interface UserContext {
  financial?: FinancialContext;
  learning?: LearningContext;
}

/**
 * Service for preparing user context information for AI tools
 */
export const userContextService = {
  /**
   * Format user financial information for AI context
   * @param userId User ID
   * @param userContext User context data
   * @returns Formatted context string
   */
  formatUserContext(userId: string, userContext?: UserContext): string {
    if (!userContext) {
      return `
Thông tin người dùng:
- User ID: ${userId}
- Chưa có thông tin context người dùng
`;
    }

    return `
Thông tin người dùng:
- User ID: ${userId}
- Thông tin tài chính người dùng:
- Tổng thu nhập: ${
      userContext.financial?.totalIncome
        ? new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(userContext.financial.totalIncome)
        : "Chưa có dữ liệu"
    }
- Tổng chi tiêu: ${
      userContext.financial?.totalExpenses
        ? new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(userContext.financial.totalExpenses)
        : "Chưa có dữ liệu"
    }
- Số lượng ngân sách: ${userContext.financial?.currentBudgets || 0}
- Đã hoàn thành onboarding: ${
      userContext.financial?.hasCompletedOnboarding ? "Có" : "Không"
    }

Thông tin học tập:
- Level hiện tại: ${userContext.learning?.currentLevel || 1}
- Điểm kinh nghiệm: ${userContext.learning?.xp || 0}
- Mục tiêu hiện tại: ${userContext.learning?.currentGoal || "Chưa có mục tiêu"}
`;
  },

  /**
   * Format conversation history for AI context
   * @param conversationHistory Array of conversation messages
   * @returns Formatted history string
   */
  formatConversationHistory(
    conversationHistory?: ConversationMessage[]
  ): string {
    if (!conversationHistory || conversationHistory.length === 0) {
      return "Đây là cuộc trò chuyện đầu tiên.";
    }

    return conversationHistory
      .slice(-15)
      .map((msg: ConversationMessage, index: number) => {
        return `${index + 1}. ${msg.sender === "user" ? "Người dùng" : "AI"}: ${
          msg.content
        }`;
      })
      .join("\n");
  },
};
