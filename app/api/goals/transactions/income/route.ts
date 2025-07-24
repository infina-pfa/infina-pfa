import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Define interface for query result
interface GoalTransactionWithDetails {
  id: string;
  goal_id: string;
  transaction_id: string;
  created_at: string;
  goals: {
    id: string;
    title: string;
    description: string | null;
    current_amount: number;
    target_amount: number | null;
  } | null;
  transactions: {
    id: string;
    name: string;
    amount: number;
    description: string | null;
    type: string;
    created_at: string;
    recurring: number;
  } | null;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
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
    const goalId = searchParams.get("goalId"); // Optional filter by specific goal

    // Validate month and year parameters
    if (!month || !year) {
      return NextResponse.json(
        {
          success: false,
          error: "Both month and year parameters are required",
        },
        { status: 400 }
      );
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12 || yearNum < 2020) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid month (1-12) or year (>=2020) parameter",
        },
        { status: 400 }
      );
    }

    // Calculate date range for the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    // Build query to get goal income transactions
    let query = supabase
      .from("goal_transactions")
      .select(
        `
        id,
        goal_id,
        transaction_id,
        created_at,
        goals (
          id,
          title,
          description,
          current_amount,
          target_amount
        ),
        transactions (
          id,
          name,
          amount,
          description,
          type,
          created_at,
          recurring
        )
      `
      )
      .eq("user_id", user.id)
      .eq("transactions.type", "income")
      .gte("transactions.created_at", startDate.toISOString())
      .lte("transactions.created_at", endDate.toISOString())
      .order("transactions.created_at", { ascending: false });

    // Apply goal filter if provided
    if (goalId) {
      query = query.eq("goal_id", goalId);
    }

    const { data: goalTransactions, error } = await query;

    if (error) {
      console.error("Error fetching goal income transactions:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch goal income transactions",
        },
        { status: 500 }
      );
    }

    // Transform data to include goal information and transaction details
    const transformedData =
      (goalTransactions as unknown as GoalTransactionWithDetails[])?.map(
        (gt) => ({
          id: gt.id,
          goalTransactionId: gt.id,
          transactionId: gt.transactions?.id,
          goalId: gt.goals?.id,
          // Transaction details
          name: gt.transactions?.name,
          amount: gt.transactions?.amount,
          description: gt.transactions?.description,
          type: gt.transactions?.type,
          recurring: gt.transactions?.recurring,
          date: gt.transactions?.created_at,
          createdAt: gt.transactions?.created_at,
          // Goal details
          goalTitle: gt.goals?.title,
          goalDescription: gt.goals?.description,
          goalCurrentAmount: gt.goals?.current_amount,
          goalTargetAmount: gt.goals?.target_amount,
        })
      ) || [];

    // Calculate summary statistics
    const totalAmount = transformedData.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      0
    );
    const transactionCount = transformedData.length;
    const uniqueGoals = new Set(transformedData.map((t) => t.goalId)).size;

    return NextResponse.json({
      success: true,
      data: {
        transactions: transformedData,
        summary: {
          month: monthNum,
          year: yearNum,
          totalAmount,
          transactionCount,
          uniqueGoals,
        },
      },
    });
  } catch (error) {
    console.error("Error in goal income transactions GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime;
    console.log(`GET /api/goals/transactions/income duration: ${duration}ms`);
  }
}
