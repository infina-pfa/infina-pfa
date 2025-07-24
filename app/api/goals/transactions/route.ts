import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { goalTransactionValidator } from "@/lib/validation/financial-validators";

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { goalId, name, amount, description, date } = body;

    // Validate input data using validator
    try {
      goalTransactionValidator.validateCreateGoalTransactionIncome({
        goalId,
        name,
        amount,
        description,
        date,
      });
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationError instanceof Error
              ? validationError.message
              : "Validation failed",
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

    // Start database transaction for consistency
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        name: name.trim(),
        amount: parseFloat(amount.toString()),
        description: description?.trim() || null,
        type: "income",
        recurring: 0,
        ...(date && { created_at: new Date(date).toISOString() }),
      })
      .select("*")
      .single();

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create transaction",
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

      console.error("Error linking transaction to goal:", goalTransactionError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to link transaction to goal",
        },
        { status: 500 }
      );
    }

    // Update goal's current amount
    const newCurrentAmount =
      goal.current_amount + parseFloat(amount.toString());
    const { error: updateGoalError } = await supabase
      .from("goals")
      .update({
        current_amount: newCurrentAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId)
      .eq("user_id", user.id);

    if (updateGoalError) {
      console.error("Error updating goal current amount:", updateGoalError);
      // We continue even if this fails, as the main transaction is complete
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          transaction,
          goalTransaction,
          updatedCurrentAmount: newCurrentAmount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in goal transaction POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime;
    console.log(`POST /api/goals/transactions duration: ${duration}ms`);
  }
}
