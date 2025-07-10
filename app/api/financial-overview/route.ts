import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Validate month and year parameters
    const monthNum = month ? parseInt(month) : new Date().getMonth() + 1;
    const yearNum = year ? parseInt(year) : new Date().getFullYear();

    if (monthNum < 1 || monthNum > 12 || yearNum < 2020) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid month or year parameter",
        },
        { status: 400 }
      );
    }

    // Calculate date range for the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    // 1. Get income data for the month
    const { data: incomeData, error: incomeError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", "income")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (incomeError) {
      console.error("Error fetching income data:", incomeError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch income data",
        },
        { status: 500 }
      );
    }

    // Calculate total income
    const totalIncome =
      incomeData?.reduce((sum, income) => sum + (income.amount || 0), 0) || 0;

    // 2. Get expense data for the month
    const { data: expenseData, error: expenseError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", "outcome")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (expenseError) {
      console.error("Error fetching expense data:", expenseError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch expense data",
        },
        { status: 500 }
      );
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
      .eq("user_id", user.id)
      .eq("month", monthNum)
      .eq("year", yearNum);

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

    // Prepare and return the response
    return NextResponse.json({
      success: true,
      data: {
        month: monthNum,
        year: yearNum,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        budgets: {
          items: budgetsWithSpending,
          total: totalBudget,
          spent: totalBudgetSpent,
          remaining: totalBudget - totalBudgetSpent,
        },
      },
    });
  } catch (error) {
    console.error("Error in financial overview GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime; // Calculate duration
    console.log(`GET /api/financial-overview duration: ${duration}ms`); // Log duration
  }
}
