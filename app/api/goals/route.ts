import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Define interface for database goal with transactions
interface DbGoalWithTransactions {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  current_amount: number;
  target_amount: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
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

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const withTransactions = searchParams.get("withTransactions") === "1";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    // Calculate pagination offsets
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Select only necessary fields for better performance
    let selectFields =
      "id, user_id, title, description, current_amount, target_amount, due_date, created_at, updated_at";

    // Build query with optimized field selection
    if (withTransactions) {
      // Only fetch a limited number of recent transactions for each goal
      selectFields = `
        ${selectFields},
        goal_transactions (
          transaction_id,
          transactions (
            id, name, amount, created_at, type, description
          )
        )
      `;
    }

    // Use range for pagination
    const query = supabase
      .from("goals")
      .select(selectFields, { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    // Execute the query
    const { data: goals, error, count } = await query;

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

    // If withTransactions is requested, process the transactions data efficiently
    if (withTransactions && goals && goals.length > 0) {
      // Use type assertion since we know the structure
      const typedGoals = goals as unknown as DbGoalWithTransactions[];

      const goalsWithTransactions = typedGoals.map((goal) => {
        // Process only the transactions we need
        const transactions =
          goal.goal_transactions?.slice(0, 10).map((gt) => ({
            id: gt.transactions.id,
            name: gt.transactions.name,
            amount: gt.transactions.amount,
            date: gt.transactions.created_at,
            type: gt.transactions.type,
            description: gt.transactions.description,
            created_at: gt.transactions.created_at,
          })) || [];

        // Calculate progress percentage efficiently
        const progress = goal.target_amount
          ? Math.min(
              100,
              Math.round((goal.current_amount / goal.target_amount) * 100)
            )
          : 0;

        // Return only what we need
        return {
          id: goal.id,
          user_id: goal.user_id,
          title: goal.title,
          description: goal.description,
          current_amount: goal.current_amount,
          target_amount: goal.target_amount,
          due_date: goal.due_date,
          created_at: goal.created_at,
          updated_at: goal.updated_at,
          transactions,
          progress,
        };
      });

      return NextResponse.json({
        success: true,
        data: goalsWithTransactions,
        pagination: {
          page,
          pageSize,
          total: count || goalsWithTransactions.length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: goals || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
      },
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
