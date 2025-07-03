import { UserContext, ConversationMessage } from '../types/index';

/**
 * Prepare user context information for the AI prompt
 */
export function prepareUserContext(
  userContext: UserContext,
  userId: string,
  additionalInfo: string = ""
): string {
  const contextInfo = userContext
    ? `
Thông tin người dùng:
- User ID: ${userId}
- Thông tin tài chính người dùng:
- Tổng thu nhập: ${userContext.financial?.totalIncome ? new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(userContext.financial.totalIncome) : "Chưa có dữ liệu"}
- Tổng chi tiêu: ${userContext.financial?.totalExpenses ? new Intl.NumberFormat("vi-VN", {
      style: "currency", 
      currency: "VND",
    }).format(userContext.financial.totalExpenses) : "Chưa có dữ liệu"}
- Thu nhập tháng hiện tại: ${userContext.financial?.totalCurrentMonthIncome ? new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(userContext.financial.totalCurrentMonthIncome) : "Chưa có dữ liệu"}
- Chi tiêu tháng hiện tại: ${userContext.financial?.totalCurrentMonthExpenses ? new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(userContext.financial.totalCurrentMonthExpenses) : "Chưa có dữ liệu"}
- Số lượng ngân sách: ${userContext.financial?.currentBudgets || 0}
- Danh mục ngân sách: ${userContext.financial?.budgetCategories?.join(', ') || 'Chưa có'}
- Đã hoàn thành onboarding: ${userContext.financial?.hasCompletedOnboarding ? "Có" : "Không"}

Thông tin học tập:
- Level hiện tại: ${userContext.learning?.currentLevel || 1}
- Điểm kinh nghiệm: ${userContext.learning?.xp || 0}
- Mục tiêu hiện tại: ${userContext.learning?.currentGoal || "Chưa có mục tiêu"}
- Tiến độ: ${userContext.learning?.progress || "Chưa có tiến độ"}

${additionalInfo}
`
    : `
Thông tin người dùng:
- User ID: ${userId}
- Chưa có thông tin context người dùng
${additionalInfo}
`;

  return contextInfo;
}

/**
 * Prepare conversation history for context
 */
export function prepareConversationHistory(
  conversationHistory: ConversationMessage[],
  maxMessages: number = 15
): string {
  if (!conversationHistory || conversationHistory.length === 0) {
    return "Đây là cuộc trò chuyện đầu tiên.";
  }

  return conversationHistory
    .slice(-maxMessages)
    .map((msg: ConversationMessage, index: number) => {
      return `${index + 1}. ${msg.sender === "user" ? "Người dùng" : "AI"}: ${msg.content}`;
    })
    .join("\n");
} 