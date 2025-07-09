import { ConversationMessage } from "@/lib/types/ai-streaming.types";
import { apiClient } from "@/lib/api-client";
import { handleError } from "@/lib/error-handler";
import { SupabaseClient } from "@supabase/supabase-js";

// Type for translation function
type TranslationFunction = (
  key: string,
  options?: { ns?: string | string[] }
) => string;

// Financial overview types
export interface FinancialOverview {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  budgets: {
    items: Array<{
      id: string;
      name: string;
      category: string;
      color: string;
      icon: string;
      amount: number;
      spent: number;
      remaining: number;
      expenses: Array<{
        id?: string;
        name?: string;
        amount?: number;
        description?: string | null;
        date?: string;
      }>;
    }>;
    total: number;
    spent: number;
    remaining: number;
  };
}

interface FinancialContext {
  totalIncome?: number;
  totalExpenses?: number;
  currentBudgets?: number;
  hasCompletedOnboarding?: boolean;
  budgetTotal?: number;
  budgetSpent?: number;
  budgetRemaining?: number;
  budgets?: Array<{
    id: string;
    name: string;
    category: string;
    color: string;
    icon: string;
    amount: number;
    spent: number;
    remaining: number;
  }>;
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
 * Fetches user financial context data directly from the database
 * @param supabase Initialized Supabase client
 * @param userId User ID to fetch data for
 * @returns User context object with financial data
 */
export async function fetchUserFinancialContext(
  supabase: SupabaseClient,
  userId: string
): Promise<UserContext> {
  try {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
    const currentYear = now.getFullYear();

    // Calculate date range for the month
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // 1. Get income data for the month
    const { data: incomeData, error: incomeError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "income")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (incomeError) {
      console.error("Error fetching income data:", incomeError);
      throw new Error("Failed to fetch income data");
    }

    // Calculate total income
    const totalIncome =
      incomeData?.reduce((sum, income) => sum + (income.amount || 0), 0) || 0;

    // 2. Get expense data for the month
    const { data: expenseData, error: expenseError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "outcome")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (expenseError) {
      console.error("Error fetching expense data:", expenseError);
      throw new Error("Failed to fetch expense data");
    }

    // Calculate total expenses
    const totalExpense =
      expenseData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) ||
      0;

    // 3. Get budget data with spending information for the month
    const { data: budgets, error: budgetError } = await supabase
      .from("budgets")
      .select(
        `
        *,
        budget_transactions (
          transaction_id,
          transactions (
            id,
            name,
            amount,
            description,
            type,
            created_at
          )
        )
      `
      )
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .eq("year", currentYear);

    if (budgetError) {
      console.error("Error fetching budget data:", budgetError);
      throw new Error("Failed to fetch budget data");
    }

    // Process budget data to include spending information
    const budgetsWithSpending =
      budgets?.map((budget) => {
        type BudgetTransaction = {
          transaction_id: string;
          transactions: {
            id: string;
            name: string;
            amount: number;
            description: string | null;
            type: string;
            created_at: string;
          } | null;
        };

        type Transaction = {
          id: string;
          name: string;
          amount: number;
          description: string | null;
          type: string;
          created_at: string;
        };

        const expenses =
          budget.budget_transactions
            ?.filter(
              (bt: BudgetTransaction) =>
                bt.transactions && bt.transactions.type === "outcome"
            )
            .map((bt: BudgetTransaction) => bt.transactions) || [];

        const spent = expenses.reduce(
          (total: number, transaction: Transaction | null) =>
            total + (transaction?.amount || 0),
          0
        );

        return {
          id: budget.id,
          name: budget.name,
          category: budget.category,
          color: budget.color,
          icon: budget.icon,
          amount: budget.amount,
          spent,
          remaining: budget.amount - spent,
        };
      }) || [];

    // Calculate budget totals
    const totalBudget = budgetsWithSpending.reduce(
      (sum, budget) => sum + budget.amount,
      0
    );
    const totalBudgetSpent = budgetsWithSpending.reduce(
      (sum, budget) => sum + budget.spent,
      0
    );

    // 4. Check if user has completed onboarding
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .single();

    return {
      financial: {
        totalIncome,
        totalExpenses: totalExpense,
        currentBudgets: budgets?.length || 0,
        hasCompletedOnboarding: userProfile?.onboarding_completed || false,
        budgetTotal: totalBudget,
        budgetSpent: totalBudgetSpent,
        budgetRemaining: totalBudget - totalBudgetSpent,
        budgets: budgetsWithSpending,
      },
    };
  } catch (error) {
    console.error("Error fetching user financial context:", error);
    // Return empty context on error
    return {
      financial: {
        totalIncome: 0,
        totalExpenses: 0,
        currentBudgets: 0,
        hasCompletedOnboarding: false,
        budgetTotal: 0,
        budgetSpent: 0,
        budgetRemaining: 0,
        budgets: [],
      },
    };
  }
}

/**
 * Service for preparing user context information for AI tools
 */
export const userContextService = {
  /**
   * Get user profile information
   */
  async getProfile(t?: TranslationFunction): Promise<{
    profile: {
      id: string;
      email: string;
      full_name: string | null;
      avatar_url: string | null;
      created_at: string;
    } | null;
    error: string | null;
  }> {
    try {
      const response = await apiClient.get<{
        id: string;
        email: string;
        full_name: string | null;
        avatar_url: string | null;
        created_at: string;
      }>("/users/profile");

      if (response.success && response.data) {
        return {
          profile: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch user profile");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        profile: null,
        error: appError.message,
      };
    }
  },

  /**
   * Get financial overview for a specific month and year
   */
  async getFinancialOverview(
    month?: number,
    year?: number,
    t?: TranslationFunction
  ): Promise<{
    overview: FinancialOverview | null;
    error: string | null;
  }> {
    try {
      const params: Record<string, string | number> = {};

      if (month) params.month = month;
      if (year) params.year = year;

      const response = await apiClient.get<FinancialOverview>(
        "/financial-overview",
        params
      );

      if (response.success && response.data) {
        return {
          overview: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch financial overview");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        overview: null,
        error: appError.message,
      };
    }
  },

  /**
   * Format user financial information for AI context
   * @param userId User ID
   * @param userContext User context data
   * @returns Formatted context string
   */
  formatUserContext(userId: string, userContext?: UserContext): string {
    console.log("🚀 ~ formatUserContext ~ userContext:", userContext);
    if (!userContext) {
      return `
Thông tin người dùng:
- User ID: ${userId}
- Chưa có thông tin context người dùng
`;
    }

    // Format budget information if available
    let budgetInfo = "";
    if (
      userContext.financial?.budgets &&
      userContext.financial.budgets.length > 0
    ) {
      const budgetCount = userContext.financial.budgets.length;
      const totalBudget = userContext.financial.budgetTotal || 0;
      const totalSpent = userContext.financial.budgetSpent || 0;
      const remaining = userContext.financial.budgetRemaining || 0;

      // Format overall budget information
      budgetInfo = `
- Thông tin ngân sách:
  - Số lượng ngân sách: ${budgetCount}
  - Tổng ngân sách: ${new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(totalBudget)}
  - Đã chi tiêu: ${new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(totalSpent)}
  - Còn lại: ${new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(remaining)}
  - Chi tiết từng ngân sách:`;

      // Add details for each budget
      userContext.financial.budgets.forEach((budget, index) => {
        const percentSpent =
          budget.amount > 0
            ? Math.round((budget.spent / budget.amount) * 100)
            : 0;

        budgetInfo += `
    ${index + 1}. ${budget.name} (${budget.category}):
       - Mức ngân sách: ${new Intl.NumberFormat("vi-VN", {
         style: "currency",
         currency: "VND",
       }).format(budget.amount)}
       - Đã chi tiêu: ${new Intl.NumberFormat("vi-VN", {
         style: "currency",
         currency: "VND",
       }).format(budget.spent)} (${percentSpent}%)
       - Còn lại: ${new Intl.NumberFormat("vi-VN", {
         style: "currency",
         currency: "VND",
       }).format(budget.remaining)}
       - Màu sắc: ${budget.color}
       - Icon: ${budget.icon}`;
      });
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
    }${budgetInfo}
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
