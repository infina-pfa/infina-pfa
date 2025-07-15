import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export class FinancialOverviewService {
  async getFinancialOverview(
    userId: string,
    options?: { month?: number; year?: number }
  ) {
    const startTime = Date.now(); // Start time
    try {
      const supabase = await createClient();

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required",
          },
          { status: 401 }
        );
      }

      // Get query parameters for filtering
      const month = options?.month || new Date().getMonth() + 1;
      const year = options?.year || new Date().getFullYear();

      if ((month && (month < 1 || month > 12)) || (year && year < 2020)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid month or year parameter",
          },
          { status: 400 }
        );
      }

      // Calculate date range for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // ========== CURRENT MONTH DATA ==========
      
      // 1. Get income data for the current month
      const { data: currentMonthIncomeData, error: currentMonthIncomeError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "income")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (currentMonthIncomeError) {
        console.error("Error fetching current month income data:", currentMonthIncomeError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch current month income data",
          },
          { status: 500 }
        );
      }

      // Calculate current month income
      const currentMonthIncome =
        currentMonthIncomeData?.reduce((sum, income) => sum + (income.amount || 0), 0) || 0;

      // 2. Get expense data for the current month
      const { data: currentMonthExpenseData, error: currentMonthExpenseError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "outcome")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (currentMonthExpenseError) {
        console.error("Error fetching current month expense data:", currentMonthExpenseError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch current month expense data",
          },
          { status: 500 }
        );
      }

      // Calculate current month expenses
      const currentMonthExpense =
        currentMonthExpenseData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

      // ========== ALL-TIME DATA ==========
      
      // 3. Get all-time income data
      const { data: allTimeIncomeData, error: allTimeIncomeError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "income");

      if (allTimeIncomeError) {
        console.error("Error fetching all-time income data:", allTimeIncomeError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch all-time income data",
          },
          { status: 500 }
        );
      }

      // Calculate all-time income
      const allTimeIncome =
        allTimeIncomeData?.reduce((sum, income) => sum + (income.amount || 0), 0) || 0;

      // 4. Get all-time expense data
      const { data: allTimeExpenseData, error: allTimeExpenseError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "outcome");

      if (allTimeExpenseError) {
        console.error("Error fetching all-time expense data:", allTimeExpenseError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch all-time expense data",
          },
          { status: 500 }
        );
      }

      // Calculate all-time expenses
      const allTimeExpense =
        allTimeExpenseData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

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
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year);

      if (budgetError) {
        console.error("Error fetching budget data:", budgetError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch budget data",
          },
          { status: 500 }
        );
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (goalsError) {
        console.error("Error fetching goals data:", goalsError);
        // Don't fail the entire request if goals fetch fails
      }

      // Process goals data
      const goals = goalsData?.map((goal) => {
        const progressPercentage = goal.target_amount > 0 
          ? Math.round((goal.current_amount / goal.target_amount) * 100)
          : 0;

        // Check if goal is completed
        const isCompleted = goal.target_amount > 0 && goal.current_amount >= goal.target_amount;

        // Check if goal is due soon (within 30 days)
        const isDueSoon = goal.due_date 
          ? new Date(goal.due_date).getTime() - new Date().getTime() <= 30 * 24 * 60 * 60 * 1000
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
        completedGoals: goals.filter(g => g.isCompleted).length,
        upcomingGoals: goals.filter(g => g.isDueSoon && !g.isCompleted).length,
        totalSaved: goals.reduce((sum, goal) => sum + goal.currentAmount, 0),
        totalTarget: goals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0),
        averageCompletion: goals.length > 0 
          ? Math.round(goals.reduce((sum, goal) => sum + goal.progressPercentage, 0) / goals.length)
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
}

export const financialOverviewService = new FinancialOverviewService();
