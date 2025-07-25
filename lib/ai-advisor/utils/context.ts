import { UserContext, ConversationMessage } from "../types/index";

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
- Pay Yourself First Amount: ${
        userContext.financial?.pyfAmount
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(userContext.financial.pyfAmount)
          : "Chưa có dữ liệu"
      }

=== THÔNG TIN TÀI CHÍNH ===
Thu nhập & Chi tiêu:

- Tổng thu nhập (tất cả thời gian): ${
        userContext.financial?.totalIncome
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(userContext.financial.totalIncome)
          : "Chưa có dữ liệu"
      }
- Tổng chi tiêu (tất cả thời gian): ${
        userContext.financial?.totalExpenses
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(userContext.financial.totalExpenses)
          : "Chưa có dữ liệu"
      }
- Thu nhập tháng hiện tại: ${
        userContext.financial?.totalCurrentMonthIncome
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(userContext.financial.totalCurrentMonthIncome)
          : "Chưa có dữ liệu"
      }
- Chi tiêu tháng hiện tại: ${
        userContext.financial?.totalCurrentMonthExpenses
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(userContext.financial.totalCurrentMonthExpenses)
          : "Chưa có dữ liệu"
      }

Ngân sách hiện tại (${userContext.financial?.currentBudgets || 0} ngân sách):
${
  userContext.financial?.budgets && userContext.financial.budgets.length > 0
    ? userContext.financial.budgets
        .map(
          (budget, index) =>
            `${index + 1}. ID: ${budget.id}
   - Tên: "${budget.name}"
   - Danh mục: ${budget.category}
   - Ngân sách: ${new Intl.NumberFormat("vi-VN", {
     style: "currency",
     currency: "VND",
   }).format(budget.budgeted)}
   - Đã chi: ${new Intl.NumberFormat("vi-VN", {
     style: "currency",
     currency: "VND",
   }).format(budget.spent)}
   - Còn lại: ${new Intl.NumberFormat("vi-VN", {
     style: "currency",
     currency: "VND",
   }).format(budget.budgeted - budget.spent)}`
        )
        .join("\n")
    : "Chưa có ngân sách nào"
}

=== MỤC TIÊU TÀI CHÍNH ===
Tổng quan:
- Tổng số mục tiêu: ${userContext.financial?.goals?.totalGoals || 0}
- Mục tiêu đã hoàn thành: ${userContext.financial?.goals?.completedGoals || 0}
- Mục tiêu sắp đến hạn: ${userContext.financial?.goals?.upcomingGoals || 0}
- Tổng số tiền đã tiết kiệm: ${
        userContext.financial?.goals?.totalSaved
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(userContext.financial.goals.totalSaved)
          : "Chưa có dữ liệu"
      }
- Tổng mục tiêu cần đạt: ${
        userContext.financial?.goals?.totalTarget
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(userContext.financial.goals.totalTarget)
          : "Chưa có dữ liệu"
      }
- Tiến độ trung bình: ${userContext.financial?.goals?.averageCompletion || 0}%

Chi tiết các mục tiêu:
${
  userContext.financial?.goals?.activeGoals &&
  userContext.financial.goals.activeGoals.length > 0
    ? userContext.financial.goals.activeGoals
        .map((goal, index) => {
          const currentAmount = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(goal.currentAmount);

          const targetAmount = goal.targetAmount
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(goal.targetAmount)
            : "Chưa đặt mục tiêu";

          const status = goal.isCompleted
            ? "✅ Đã hoàn thành"
            : goal.isDueSoon
            ? "⚠️ Sắp đến hạn"
            : "🔄 Đang thực hiện";

          const dueDate = goal.dueDate
            ? ` | Hạn cuối: ${new Date(goal.dueDate).toLocaleDateString(
                "vi-VN"
              )}`
            : "";

          return `${index + 1}. ID: ${goal.id}
   - Tên: "${goal.title}"
   - Số tiền hiện tại: ${currentAmount}
   - Mục tiêu: ${targetAmount}
   - Tiến độ: ${goal.progressPercentage}%
   - Trạng thái: ${status}${dueDate}`;
        })
        .join("\n")
    : "Chưa có mục tiêu nào"
}

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
      return `${index + 1}. ${msg.sender === "user" ? "Người dùng" : "AI"}: ${
        msg.content
      }`;
    })
    .join("\n");
}
