import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Goal } from "@/lib/types/goal.types";

// Define interface for goal with transactions
interface GoalWithTransactions extends Goal {
  goal_transactions?: Array<{
    transaction_id: string;
    transactions: {
      id: string;
      name: string;
      amount: number;
      created_at: string;
      type: string;
      description: string | null;
    };
  }>;
}

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
    const completed = searchParams.get("completed") === "1";
    const upcoming = searchParams.get("upcoming") === "1";
    const withTransactions = searchParams.get("withTransactions") === "1";

    // Build query - include transactions data if requested
    let selectClause = "*";
    if (withTransactions) {
      selectClause = `
        *,
        goal_transactions (
          transaction_id,
          transactions (
            id,
            name,
            amount,
            created_at,
            type,
            description
          )
        )
      `;
    }

    let query = supabase
      .from("goals")
      .select(selectClause)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (completed) {
      // A goal is completed when current_amount >= target_amount
      query = query.gte(
        "current_amount",
        supabase.rpc("get_column", { column_name: "target_amount" })
      );
    }

    if (upcoming) {
      // Get goals with due dates within the next 30 days
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      query = query
        .lte("due_date", thirtyDaysFromNow.toISOString())
        .gte("due_date", today.toISOString());
    }

    const { data: goals, error } = await query;

    if (error) {
      console.error("Error fetching goals:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch goals",
        },
        { status: 500 }
      );
    }

    // If withTransactions is requested, calculate progress data
    if (withTransactions && goals) {
      // Cast goals to unknown first to avoid TypeScript error
      const goalsWithTransactions = (
        goals as unknown as GoalWithTransactions[]
      ).map((goal) => {
        const transactions =
          goal.goal_transactions?.map((gt) => ({
            id: gt.transactions.id,
            name: gt.transactions.name,
            amount: gt.transactions.amount,
            date: gt.transactions.created_at,
            type: gt.transactions.type,
            description: gt.transactions.description,
          })) || [];

        // Calculate progress percentage
        const progress = goal.target_amount
          ? Math.min(
              100,
              Math.round((goal.current_amount / goal.target_amount) * 100)
            )
          : 0;

        return {
          ...goal,
          transactions,
          progress,
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          goals: goalsWithTransactions,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: goals || [],
    });
  } catch (error) {
    console.error("Error in goals GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime; // Calculate duration
    console.log(`GET /api/goals duration: ${duration}ms`); // Log duration
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { title, target_amount, current_amount, description, due_date } =
      body;

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Goal title is required",
        },
        { status: 400 }
      );
    }

    // Check for duplicate goal title
    const { data: existingGoal } = await supabase
      .from("goals")
      .select("id")
      .eq("user_id", user.id)
      .eq("title", title.trim())
      .single();

    if (existingGoal) {
      return NextResponse.json(
        {
          success: false,
          error: "Goal with this title already exists",
        },
        { status: 409 }
      );
    }

    // Create goal
    const { data: goal, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: title.trim(),
        target_amount: target_amount || null,
        current_amount: current_amount || 0,
        description: description || null,
        due_date: due_date || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating goal:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create goal",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: goal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in goals POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime; // Calculate duration
    console.log(`POST /api/goals duration: ${duration}ms`); // Log duration
  }
}
