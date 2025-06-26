import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UpdateIncomeRequest } from "@/lib/types/income.types";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get income
    const { data: income, error } = await supabase
      .from("incomes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Income not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching income:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch income" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: income,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: UpdateIncomeRequest = await request.json();

    // Validate fields if provided
    if (body.amount !== undefined && body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (body.description !== undefined && !body.description.trim()) {
      return NextResponse.json(
        { success: false, error: "Description cannot be empty" },
        { status: 400 }
      );
    }

    // Validate description length if provided
    if (body.description && body.description.length > 500) {
      return NextResponse.json(
        { success: false, error: "Description cannot exceed 500 characters" },
        { status: 400 }
      );
    }

    // Validate pay yourself percent if provided
    if (
      body.pay_yourself_percent !== undefined &&
      body.pay_yourself_percent !== null
    ) {
      if (body.pay_yourself_percent < 0 || body.pay_yourself_percent > 100) {
        return NextResponse.json(
          {
            success: false,
            error: "Pay yourself percent must be between 0 and 100",
          },
          { status: 400 }
        );
      }
    }

    // Update income
    const { data: income, error } = await supabase
      .from("incomes")
      .update({
        amount: body.amount,
        date: body.date,
        description: body.description,
        is_recurring: body.is_recurring,
        pay_yourself_percent: body.pay_yourself_percent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Income not found" },
          { status: 404 }
        );
      }
      console.error("Error updating income:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update income" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: income,
      message: "Income updated successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete income
    const { error } = await supabase
      .from("incomes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting income:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete income" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 