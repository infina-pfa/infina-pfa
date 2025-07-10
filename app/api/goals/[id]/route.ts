import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface GoalTransaction {
  transaction_id: string;
  transactions: {
    id: string;
    name: string;
    amount: number;
    created_at: string;
    type: string;
    description: string | null;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Create Supabase client
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

    // Get goal by ID with transactions
    const { data: goal, error } = await supabase
      .from("goals")
      .select(
        `
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
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Goal not found",
          },
          { status: 404 }
        );
      }

      console.error("Error fetching goal:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch goal",
        },
        { status: 500 }
      );
    }

    // Format transactions and calculate progress
    const transactions =
      goal.goal_transactions?.map((gt: GoalTransaction) => ({
        id: gt.transactions.id,
        name: gt.transactions.name,
        amount: gt.transactions.amount,
        date: gt.transactions.created_at,
        type: gt.transactions.type,
        description: gt.transactions.description,
      })) || [];

    const progress = goal.target_amount
      ? Math.min(
          100,
          Math.round((goal.current_amount / goal.target_amount) * 100)
        )
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...goal,
        transactions,
        progress,
      },
    });
  } catch (error) {
    console.error("Error in goal GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Create Supabase client
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

    // Check if goal exists and belongs to user
    const { data: existingGoal, error: checkError } = await supabase
      .from("goals")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingGoal) {
      return NextResponse.json(
        {
          success: false,
          error: "Goal not found",
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, target_amount, current_amount, description, due_date } =
      body;

    // Validate title if provided
    if (title !== undefined && !title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Goal title cannot be empty",
        },
        { status: 400 }
      );
    }

    // Check for duplicate title if title is being updated
    if (title && title.trim() !== existingGoal.title) {
      const { data: duplicateGoal } = await supabase
        .from("goals")
        .select("id")
        .eq("user_id", user.id)
        .eq("title", title.trim())
        .neq("id", id)
        .single();

      if (duplicateGoal) {
        return NextResponse.json(
          {
            success: false,
            error: "Goal with this title already exists",
          },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, string | number | null> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (target_amount !== undefined) updateData.target_amount = target_amount;
    if (current_amount !== undefined)
      updateData.current_amount = current_amount;
    if (description !== undefined) updateData.description = description;
    if (due_date !== undefined) updateData.due_date = due_date;

    // Update goal
    const { data: goal, error } = await supabase
      .from("goals")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating goal:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update goal",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error("Error in goal PUT:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Create Supabase client
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

    // Check if goal exists and belongs to user
    const { data: existingGoal, error: checkError } = await supabase
      .from("goals")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingGoal) {
      return NextResponse.json(
        {
          success: false,
          error: "Goal not found",
        },
        { status: 404 }
      );
    }

    // First delete associated goal_transactions
    const { error: deleteTransactionsError } = await supabase
      .from("goal_transactions")
      .delete()
      .eq("goal_id", id);

    if (deleteTransactionsError) {
      console.error(
        "Error deleting goal transactions:",
        deleteTransactionsError
      );
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete goal transactions",
        },
        { status: 500 }
      );
    }

    // Then delete the goal
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting goal:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete goal",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error) {
    console.error("Error in goal DELETE:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
