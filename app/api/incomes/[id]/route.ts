import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { incomeValidator } from "@/lib/validation/financial-validators";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Get single income transaction
    const { data: income, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("type", "income")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Income not found",
          },
          { status: 404 }
        );
      }

      console.error("Error fetching income:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch income",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: income,
    });
  } catch (error) {
    console.error("Error in income GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime;
    console.log(`GET /api/incomes/${params.id} duration: ${duration}ms`);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Parse request body
    const body = await request.json();
    const { amount, description, recurring } = body;

    // Validate input data
    try {
      incomeValidator.validateUpdate({
        amount,
        description,
        recurring,
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

    // Build update object with only provided fields
    const updateData: Record<string, string | number | null> = {};

    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (recurring !== undefined) updateData.recurring = recurring;

    // Update income transaction
    const { data: income, error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("type", "income")
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Income not found",
          },
          { status: 404 }
        );
      }

      console.error("Error updating income:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update income",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: income,
    });
  } catch (error) {
    console.error("Error in income PUT:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime;
    console.log(`PUT /api/incomes/${params.id} duration: ${duration}ms`);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Delete income transaction
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("type", "income");

    if (error) {
      console.error("Error deleting income:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete income",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in income DELETE:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime;
    console.log(`DELETE /api/incomes/${params.id} duration: ${duration}ms`);
  }
}
