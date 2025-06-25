import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Tables, TablesInsert, Enums } from "@/lib/supabase/database";

type Budget = Tables<"budgets">;
type BudgetInsert = TablesInsert<"budgets">;
type BudgetCategory = Enums<"budget_category">;

interface CreateBudgetRequest {
  name: string;
  amount: number;
  category?: BudgetCategory;
  color: string;
  icon: string;
  started_at?: string;
  ended_at: string;
}

interface BudgetResponse {
  success: boolean;
  data?: Budget | Budget[];
  error?: string;
  message?: string;
}

/**
 * GET /api/budgets
 * Fetches all budgets for the authenticated user
 */
export async function GET(request: NextRequest): Promise<NextResponse<BudgetResponse>> {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get search params for filtering and pagination
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as BudgetCategory | null;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined;

    // Build query
    let query = supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq("category", category);
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data: budgets, error } = await query;

    if (error) {
      console.error("Error fetching budgets:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch budgets" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: budgets,
      message: `Retrieved ${budgets.length} budgets`
    });

  } catch (error) {
    console.error("Unexpected error in GET /api/budgets:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/budgets
 * Creates a new budget for the authenticated user
 */
export async function POST(request: NextRequest): Promise<NextResponse<BudgetResponse>> {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let requestBody: CreateBudgetRequest;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    const { name, amount, color, icon, ended_at } = requestBody;
    
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount is required and must be a positive number" },
        { status: 400 }
      );
    }

    if (!color || typeof color !== "string") {
      return NextResponse.json(
        { success: false, error: "Color is required and must be a string" },
        { status: 400 }
      );
    }

    if (!icon || typeof icon !== "string") {
      return NextResponse.json(
        { success: false, error: "Icon is required and must be a string" },
        { status: 400 }
      );
    }

    if (!ended_at || typeof ended_at !== "string") {
      return NextResponse.json(
        { success: false, error: "Ended_at is required and must be a valid date string" },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (requestBody.category) {
      const validCategories: BudgetCategory[] = ["fixed", "flexible", "planed"];
      if (!validCategories.includes(requestBody.category)) {
        return NextResponse.json(
          { success: false, error: "Invalid budget category. Must be 'fixed', 'flexible', or 'planed'" },
          { status: 400 }
        );
      }
    }

    // Validate dates
    const startedAt = requestBody.started_at ? new Date(requestBody.started_at) : new Date();
    const endedAt = new Date(ended_at);
    
    if (isNaN(endedAt.getTime())) {
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

    // Prepare budget data for insertion
    const budgetData: BudgetInsert = {
      name: name.trim(),
      amount,
      category: requestBody.category || "flexible",
      color,
      icon,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      user_id: user.id,
    };

    // Insert budget
    const { data: budget, error } = await supabase
      .from("budgets")
      .insert(budgetData)
      .select()
      .single();

    if (error) {
      console.error("Error creating budget:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create budget" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: budget,
      message: "Budget created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Unexpected error in POST /api/budgets:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 