import { ConversationMessage, UserContext } from "../types/index.ts";

export function prepareUserContext(userContext: UserContext | undefined, user_id: string, memoryContext: string): string {
  if (!userContext) {
    return `
Thông tin người dùng:
- User ID: ${user_id || 'Unknown'}
- Chưa có thông tin context người dùng
${memoryContext ? `\n${memoryContext}` : ''}
`;
  }

  return `
Thông tin người dùng:
- User ID: ${user_id || 'Unknown'}
- Thông tin tài chính người dùng:
- Tổng thu nhập: ${userContext.financial?.totalIncome ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(userContext.financial.totalIncome) : 'Chưa có dữ liệu'}
- Tổng chi tiêu: ${userContext.financial?.totalExpenses ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(userContext.financial.totalExpenses) : 'Chưa có dữ liệu'}
- Thu nhập tháng này: ${userContext.financial?.totalCurrentMonthIncome ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(userContext.financial.totalCurrentMonthIncome) : 'Chưa có dữ liệu'}
- Chi tiêu tháng này: ${userContext.financial?.totalCurrentMonthExpenses ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(userContext.financial.totalCurrentMonthExpenses) : 'Chưa có dữ liệu'}
- Số lượng ngân sách: ${userContext.financial?.currentBudgets || 0}
- Các hạng mục ngân sách: ${userContext.financial?.budgetCategories && userContext.financial.budgetCategories.length > 0 ? userContext.financial.budgetCategories.join(', ') : 'Chưa có'}
- Chi tiết ngân sách: ${userContext.financial?.budgets && userContext.financial.budgets.length > 0 ? 
  userContext.financial.budgets.map(budget => `${budget.name}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(budget.budgeted)} (đã chi: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(budget.spent)})`).join('; ') : 'Chưa thiết lập'}
- Đã hoàn thành onboarding: ${userContext.financial?.hasCompletedOnboarding ? 'Có' : 'Không'}

Thông tin học tập:
- Level hiện tại: ${userContext.learning?.currentLevel || 1}
- Điểm kinh nghiệm: ${userContext.learning?.xp || 0}
- Mục tiêu hiện tại: ${userContext.learning?.currentGoal || 'Chưa có mục tiêu'}
- Tiến độ học tập: ${userContext.learning?.progress || 'Chưa có dữ liệu'}

${memoryContext ? `\n${memoryContext}` : ''}
`;
}

export function prepareHistoryContext(conversationHistory: ConversationMessage[]): string {
  if (!conversationHistory || conversationHistory.length === 0) {
    return 'Đây là cuộc trò chuyện đầu tiên.';
  }

  return conversationHistory.slice(-15).map((msg: ConversationMessage, index: number) => {
    return `${index + 1}. ${msg.sender === 'user' ? 'Người dùng' : 'AI'}: ${msg.content}`;
  }).join('\n');
} 