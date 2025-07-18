import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface BudgetExpense {
  id?: string;
  name?: string;
  amount?: number;
  description?: string | null;
  date?: string;
}

export interface BudgetWithSpending {
  id: string;
  name: string;
  category: string;
  color: string;
  icon: string;
  amount: number;
  spent: number;
  remaining: number;
  expenses: BudgetExpense[];
}

export interface BudgetSummary {
  items: BudgetWithSpending[];
  total: number;
  spent: number;
  remaining: number;
}

export interface GoalItem {
  id: string;
  title: string;
  description: string | null;
  currentAmount: number;
  targetAmount: number;
  dueDate: string | null;
  progressPercentage: number;
  isCompleted: boolean;
  isDueSoon: boolean;
  createdAt: string;
}

export interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  upcomingGoals: number;
  totalSaved: number;
  totalTarget: number;
  averageCompletion: number;
}

export interface GoalsSummary {
  items: GoalItem[];
  stats: GoalStats;
}

export interface FinancialOverviewData {
  month: number;
  year: number;
  // Current month data
  currentMonth: FinancialSummary;
  // All-time data
  allTime: FinancialSummary;
  // Legacy fields for backward compatibility (using current month data)
  totalIncome: number;
  totalExpense: number;
  balance: number;
  // Budget data
  budgets: BudgetSummary;
  // Goals data
  goals: GoalsSummary;
}

export class FinancialOverviewService {
  async getFinancialOverview(
    userId: string,
    options?: { month?: number; year?: number },
    _supabase?: SupabaseClient
  ): Promise<FinancialOverviewData | null> {
    const startTime = Date.now(); // Start time
    try {
      const supabase = _supabase || (await createClient());

      // Get query parameters for filtering
      const month = options?.month || new Date().getMonth() + 1;
      const year = options?.year || new Date().getFullYear();

      if ((month && (month < 1 || month > 12)) || (year && year < 2020)) {
        return null;
      }

      // Calculate date range for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // ========== CURRENT MONTH DATA ==========

      // 1. Get income data for the current month
      const { data: currentMonthIncomeData, error: currentMonthIncomeError } =
        await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", userId)
          .eq("type", "income")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

      if (currentMonthIncomeError) {
        console.error(
          "Error fetching current month income data:",
          currentMonthIncomeError
        );
        return null;
      }

      // Calculate current month income
      const currentMonthIncome =
        currentMonthIncomeData?.reduce(
          (sum, income) => sum + (income.amount || 0),
          0
        ) || 0;

      // 2. Get expense data for the current month
      const { data: currentMonthExpenseData, error: currentMonthExpenseError } =
        await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", userId)
          .eq("type", "outcome")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

      if (currentMonthExpenseError) {
        console.error(
          "Error fetching current month expense data:",
          currentMonthExpenseError
        );
        return null;
      }

      // Calculate current month expenses
      const currentMonthExpense =
        currentMonthExpenseData?.reduce(
          (sum, expense) => sum + (expense.amount || 0),
          0
        ) || 0;

      // ========== ALL-TIME DATA ==========

      // 3. Get all-time income data
      const { data: allTimeIncomeData, error: allTimeIncomeError } =
        await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", userId)
          .eq("type", "income");

      if (allTimeIncomeError) {
        console.error(
          "Error fetching all-time income data:",
          allTimeIncomeError
        );
        return null;
      }

      // Calculate all-time income
      const allTimeIncome =
        allTimeIncomeData?.reduce(
          (sum, income) => sum + (income.amount || 0),
          0
        ) || 0;

      // 4. Get all-time expense data
      const { data: allTimeExpenseData, error: allTimeExpenseError } =
        await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", userId)
          .eq("type", "outcome");

      if (allTimeExpenseError) {
        console.error(
          "Error fetching all-time expense data:",
          allTimeExpenseError
        );
        return null;
      }

      // Calculate all-time expenses
      const allTimeExpense =
        allTimeExpenseData?.reduce(
          (sum, expense) => sum + (expense.amount || 0),
          0
        ) || 0;

      // ========== BUDGET DATA (CURRENT MONTH) ==========

      // 5. Get budget data with spending information for the month
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
        .eq("month", month)
        .eq("year", year);

      if (budgetError) {
        console.error("Error fetching budget data:", budgetError);
        return null;
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
            expenses: expenses.map((expense: Transaction | null) => ({
              id: expense?.id,
              name: expense?.name,
              amount: expense?.amount,
              description: expense?.description,
              date: expense?.created_at,
            })),
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

      // ========== GOALS DATA ==========

      // 6. Get user goals data
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (goalsError) {
        console.error("Error fetching goals data:", goalsError);
        // Don't fail the entire request if goals fetch fails
      }

      // Process goals data
      const goals =
        goalsData?.map((goal) => {
          const progressPercentage =
            goal.target_amount > 0
              ? Math.round((goal.current_amount / goal.target_amount) * 100)
              : 0;

          // Check if goal is completed
          const isCompleted =
            goal.target_amount > 0 && goal.current_amount >= goal.target_amount;

          // Check if goal is due soon (within 30 days)
          const isDueSoon = goal.due_date
            ? new Date(goal.due_date).getTime() - new Date().getTime() <=
              30 * 24 * 60 * 60 * 1000
            : false;

          return {
            id: goal.id,
            title: goal.title,
            description: goal.description,
            currentAmount: goal.current_amount,
            targetAmount: goal.target_amount,
            dueDate: goal.due_date,
            progressPercentage,
            isCompleted,
            isDueSoon,
            createdAt: goal.created_at,
          };
        }) || [];

      // Calculate goals statistics
      const goalsStats = {
        totalGoals: goals.length,
        completedGoals: goals.filter((g) => g.isCompleted).length,
        upcomingGoals: goals.filter((g) => g.isDueSoon && !g.isCompleted)
          .length,
        totalSaved: goals.reduce((sum, goal) => sum + goal.currentAmount, 0),
        totalTarget: goals.reduce(
          (sum, goal) => sum + (goal.targetAmount || 0),
          0
        ),
        averageCompletion:
          goals.length > 0
            ? Math.round(
                goals.reduce((sum, goal) => sum + goal.progressPercentage, 0) /
                  goals.length
              )
            : 0,
      };

      // Prepare and return the updated response structure
      return {
        month: month,
        year: year,
        // Current month data
        currentMonth: {
          totalIncome: currentMonthIncome,
          totalExpense: currentMonthExpense,
          balance: currentMonthIncome - currentMonthExpense,
        },
        // All-time data
        allTime: {
          totalIncome: allTimeIncome,
          totalExpense: allTimeExpense,
          balance: allTimeIncome - allTimeExpense,
        },
        // Legacy fields for backward compatibility (using current month data)
        totalIncome: currentMonthIncome,
        totalExpense: currentMonthExpense,
        balance: currentMonthIncome - currentMonthExpense,
        // Budget data
        budgets: {
          items: budgetsWithSpending,
          total: totalBudget,
          spent: totalBudgetSpent,
          remaining: totalBudget - totalBudgetSpent,
        },
        // Goals data
        goals: {
          items: goals,
          stats: goalsStats,
        },
      };
    } catch (error) {
      console.error("Error in financial overview GET:", error);
      return null;
    } finally {
      const duration = Date.now() - startTime; // Calculate duration
      console.log(`GET /api/financial-overview duration: ${duration}ms`); // Log duration
    }
  }

  convertFinancialOverviewToText(
    financialOverview: FinancialOverviewData
  ): string {
    const { month, year, currentMonth, allTime, budgets, goals } =
      financialOverview;

    let text = `=== FINANCIAL OVERVIEW ===\n`;
    text += `Month: ${month.toString().padStart(2, "0")}\n`;
    text += `Year: ${year}\n\n`;

    // Current Month Summary
    text += `=== CURRENT MONTH SUMMARY ===\n`;
    text += `Total income this month: ${formatCurrency(
      currentMonth.totalIncome
    )}\n`;
    text += `Total expense this month: ${formatCurrency(
      currentMonth.totalExpense
    )}\n`;
    text += `Balance this month: ${formatCurrency(currentMonth.balance)}\n\n`;

    // All-Time Summary
    text += `=== ALL-TIME SUMMARY ===\n`;
    text += `Total income all-time: ${formatCurrency(allTime.totalIncome)}\n`;
    text += `Total expense all-time: ${formatCurrency(allTime.totalExpense)}\n`;
    text += `Balance all-time: ${formatCurrency(allTime.balance)}\n\n`;

    // Budget Summary
    text += `=== BUDGET SUMMARY ===\n`;
    text += `Total budget allocated: ${formatCurrency(budgets.total)}\n`;
    text += `Total budget spent: ${formatCurrency(budgets.spent)}\n`;
    text += `Total budget remaining: ${formatCurrency(budgets.remaining)}\n`;
    text += `Budget utilization: ${
      budgets.total > 0 ? Math.round((budgets.spent / budgets.total) * 100) : 0
    }%\n\n`;

    // Individual Budgets
    if (budgets.items.length > 0) {
      text += `=== BUDGET DETAILS ===\n`;
      budgets.items.forEach((budget, index) => {
        const utilizationPercentage =
          budget.amount > 0
            ? Math.round((budget.spent / budget.amount) * 100)
            : 0;
        text += `${index + 1}. ${budget.name} (${budget.category})\n`;
        text += `   - Allocated: ${formatCurrency(budget.amount)}\n`;
        text += `   - Spent: ${formatCurrency(budget.spent)}\n`;
        text += `   - Remaining: ${formatCurrency(budget.remaining)}\n`;
        text += `   - Utilization: ${utilizationPercentage}%\n`;

        if (budget.expenses.length > 0) {
          text += `   - Recent expenses:\n`;
          budget.expenses.slice(0, 3).forEach((expense) => {
            text += `     • ${expense.name}: ${formatCurrency(
              expense.amount || 0
            )}\n`;
          });
          if (budget.expenses.length > 3) {
            text += `     • ... and ${
              budget.expenses.length - 3
            } more expenses\n`;
          }
        }
        text += `\n`;
      });
    }

    // Goals Summary
    text += `=== GOALS SUMMARY ===\n`;
    text += `Total goals: ${goals.stats.totalGoals}\n`;
    text += `Completed goals: ${goals.stats.completedGoals}\n`;
    text += `Upcoming goals (due soon): ${goals.stats.upcomingGoals}\n`;
    text += `Total saved towards goals: ${formatCurrency(
      goals.stats.totalSaved
    )}\n`;
    text += `Total target amount: ${formatCurrency(goals.stats.totalTarget)}\n`;
    text += `Average completion rate: ${goals.stats.averageCompletion}%\n\n`;

    // Individual Goals
    if (goals.items.length > 0) {
      text += `=== GOAL DETAILS ===\n`;
      goals.items.forEach((goal, index) => {
        text += `${index + 1}. ${goal.title}\n`;
        text += `   - Current: ${formatCurrency(goal.currentAmount)}\n`;
        text += `   - Target: ${formatCurrency(goal.targetAmount)}\n`;
        text += `   - Progress: ${goal.progressPercentage}%\n`;
        text += `   - Status: ${
          goal.isCompleted ? "Completed" : "In Progress"
        }\n`;
        if (goal.dueDate) {
          text += `   - Due date: ${new Date(goal.dueDate).toLocaleDateString(
            "vi-VN"
          )}\n`;
        }
        if (goal.isDueSoon && !goal.isCompleted) {
          text += `   - ⚠️ Due soon!\n`;
        }
        if (goal.description) {
          text += `   - Description: ${goal.description}\n`;
        }
        text += `\n`;
      });
    }

    // Financial Health Indicators
    text += `=== FINANCIAL HEALTH INDICATORS ===\n`;

    // Savings Rate
    const savingsRate =
      currentMonth.totalIncome > 0
        ? Math.round((currentMonth.balance / currentMonth.totalIncome) * 100)
        : 0;
    text += `Monthly savings rate: ${savingsRate}%\n`;

    // Budget adherence
    const budgetAdherence =
      budgets.total > 0
        ? Math.round(((budgets.total - budgets.spent) / budgets.total) * 100)
        : 0;
    text += `Budget adherence: ${budgetAdherence}%\n`;

    // Goal completion rate
    text += `Goal completion rate: ${goals.stats.averageCompletion}%\n`;

    // Financial warnings
    text += `\n=== FINANCIAL ALERTS ===\n`;

    if (currentMonth.balance < 0) {
      text += `⚠️ WARNING: Monthly expenses exceed income by ${formatCurrency(
        Math.abs(currentMonth.balance)
      )}\n`;
    }

    if (budgets.remaining < 0) {
      text += `⚠️ WARNING: Budget overspent by ${formatCurrency(
        Math.abs(budgets.remaining)
      )}\n`;
    }

    const overbudgetItems = budgets.items.filter((b) => b.remaining < 0);
    if (overbudgetItems.length > 0) {
      text += `⚠️ WARNING: ${overbudgetItems.length} budget(s) exceeded:\n`;
      overbudgetItems.forEach((budget) => {
        text += `   - ${budget.name}: overspent by ${formatCurrency(
          Math.abs(budget.remaining)
        )}\n`;
      });
    }

    const upcomingGoals = goals.items.filter(
      (g) => g.isDueSoon && !g.isCompleted
    );
    if (upcomingGoals.length > 0) {
      text += `⏰ REMINDER: ${upcomingGoals.length} goal(s) due soon:\n`;
      upcomingGoals.forEach((goal) => {
        text += `   - ${goal.title}: ${formatCurrency(
          goal.targetAmount - goal.currentAmount
        )} needed\n`;
      });
    }

    return text;
  }
}

export const financialOverviewService = new FinancialOverviewService();
