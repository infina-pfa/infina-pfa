import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  try {
    const { id: goalId } = await params;

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
    const { name, amount, description, date } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction name is required",
        },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount must be greater than 0",
        },
        { status: 400 }
      );
    }

    // Verify goal exists and belongs to user
    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .select("id, title, current_amount")
      .eq("id", goalId)
      .eq("user_id", user.id)
      .single();

    if (goalError || !goal) {
      return NextResponse.json(
        {
          success: false,
          error: "Goal not found",
        },
        { status: 404 }
      );
    }

    // Create deposit transaction
    const depositAmount = parseFloat(amount.toString());
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        name: name.trim(),
        amount: depositAmount,
        description: description?.trim() || null,
        type: "income",
        recurring: 0,
        ...(date && { created_at: new Date(date).toISOString() }),
      })
      .select("*")
      .single();

    if (transactionError) {
      console.error("Error creating deposit transaction:", transactionError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create deposit transaction",
        },
        { status: 500 }
      );
    }

    // Create goal_transaction link
    const { data: goalTransaction, error: goalTransactionError } =
      await supabase
        .from("goal_transactions")
        .insert({
          user_id: user.id,
          goal_id: goalId,
          transaction_id: transaction.id,
        })
        .select("*")
        .single();

    if (goalTransactionError) {
      // If linking fails, delete the transaction to maintain consistency
      await supabase.from("transactions").delete().eq("id", transaction.id);

      console.error(
        "Error linking deposit transaction to goal:",
        goalTransactionError
      );
      return NextResponse.json(
        {
          success: false,
          error: "Failed to link deposit transaction to goal",
        },
        { status: 500 }
      );
    }

    // Update goal's current amount (add deposit)
    const newCurrentAmount = goal.current_amount + depositAmount;
    const { error: updateGoalError } = await supabase
      .from("goals")
      .update({
        current_amount: newCurrentAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId)
      .eq("user_id", user.id);

    if (updateGoalError) {
      console.error(
        "Error updating goal current amount after deposit:",
        updateGoalError
      );
      // We continue even if this fails, as the main transaction is complete
    }

    // Return success response with updated goal data
    return NextResponse.json(
      {
        success: true,
        data: {
          transaction,
          goalTransaction,
          updatedCurrentAmount: newCurrentAmount,
          goal: {
            id: goal.id,
            title: goal.title,
            currentAmount: newCurrentAmount,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in goal deposit POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime;
    console.log(
      `POST /api/goals/[id]/transactions/deposit duration: ${duration}ms`
    );
  }
}
