import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Tables, TablesUpdate, Enums } from "@/lib/supabase/database";

type Budget = Tables<"budgets">;
type BudgetUpdate = TablesUpdate<"budgets">;
type BudgetCategory = Enums<"budget_category">;

interface UpdateBudgetRequest {
  name?: string;
  amount?: number;
  category?: BudgetCategory;
  color?: string;
  icon?: string;
  started_at?: string;
  ended_at?: string;
}

interface BudgetResponse {
  success: boolean;
  data?: Budget;
  error?: string;
  message?: string;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/budgets/[id]
 * Fetches a single budget by ID for the authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<BudgetResponse>> {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid budget ID" },
        { status: 400 }
      );
    }

    // Fetch budget
    const { data: budget, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Budget not found" },
          { status: 404 }
        );
      }
      
      console.error("Error fetching budget:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch budget" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: budget,
      message: "Budget retrieved successfully"
    });

  } catch (error) {
    console.error("Unexpected error in GET /api/budgets/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/budgets/[id]
 * Updates a budget by ID for the authenticated user
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<BudgetResponse>> {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid budget ID" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let requestBody: UpdateBudgetRequest;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Check if budget exists and belongs to user
    const { data: existingBudget, error: fetchError } = await supabase
      .from("budgets")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Budget not found" },
          { status: 404 }
        );
      }
      
      console.error("Error fetching budget for update:", fetchError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch budget" },
        { status: 500 }
      );
    }

    // Validate update fields
    const updateData: BudgetUpdate = {};

    if (requestBody.name !== undefined) {
      if (typeof requestBody.name !== "string" || requestBody.name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
      updateData.name = requestBody.name.trim();
    }

    if (requestBody.amount !== undefined) {
      if (typeof requestBody.amount !== "number" || requestBody.amount <= 0) {
        return NextResponse.json(
          { success: false, error: "Amount must be a positive number" },
          { status: 400 }
        );
      }
      updateData.amount = requestBody.amount;
    }

    if (requestBody.category !== undefined) {
      const validCategories: BudgetCategory[] = ["fixed", "flexible", "planed"];
      if (!validCategories.includes(requestBody.category)) {
        return NextResponse.json(
          { success: false, error: "Invalid budget category. Must be 'fixed', 'flexible', or 'planed'" },
          { status: 400 }
        );
      }
      updateData.category = requestBody.category;
    }

    if (requestBody.color !== undefined) {
      if (typeof requestBody.color !== "string") {
        return NextResponse.json(
          { success: false, error: "Color must be a string" },
          { status: 400 }
        );
      }
      updateData.color = requestBody.color;
    }

    if (requestBody.icon !== undefined) {
      if (typeof requestBody.icon !== "string") {
        return NextResponse.json(
          { success: false, error: "Icon must be a string" },
          { status: 400 }
        );
      }
      updateData.icon = requestBody.icon;
    }

    // Validate and set dates
    if (requestBody.started_at !== undefined || requestBody.ended_at !== undefined) {
      const startedAt = requestBody.started_at 
        ? new Date(requestBody.started_at) 
        : new Date(existingBudget.started_at);
      const endedAt = requestBody.ended_at 
        ? new Date(requestBody.ended_at) 
        : new Date(existingBudget.ended_at);

      if (requestBody.started_at !== undefined && isNaN(startedAt.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid started_at date format" },
          { status: 400 }
        );
      }

      if (requestBody.ended_at !== undefined && isNaN(endedAt.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid ended_at date format" },
          { status: 400 }
        );
      }

      if (endedAt <= startedAt) {
        return NextResponse.json(
          { success: false, error: "ended_at must be after started_at" },
          { status: 400 }
        );
      }

      if (requestBody.started_at !== undefined) {
        updateData.started_at = startedAt.toISOString();
      }
      if (requestBody.ended_at !== undefined) {
        updateData.ended_at = endedAt.toISOString();
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update budget
    const { data: updatedBudget, error: updateError } = await supabase
      .from("budgets")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating budget:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update budget" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedBudget,
      message: "Budget updated successfully"
    });

  } catch (error) {
    console.error("Unexpected error in PUT /api/budgets/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/budgets/[id]
 * Deletes a budget by ID for the authenticated user
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<BudgetResponse>> {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid budget ID" },
        { status: 400 }
      );
    }

    // Check if budget exists and belongs to user
    const { error: fetchError } = await supabase
      .from("budgets")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Budget not found" },
          { status: 404 }
        );
      }
      
      console.error("Error fetching budget for deletion:", fetchError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch budget" },
        { status: 500 }
      );
    }

    // Delete budget
    const { error: deleteError } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting budget:", deleteError);
      return NextResponse.json(
        { success: false, error: "Failed to delete budget" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Budget deleted successfully"
    });

  } catch (error) {
    console.error("Unexpected error in DELETE /api/budgets/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 