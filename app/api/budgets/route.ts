import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const startTime = Date.now(); // Start time
  try {
      const supabase = await createClient()
      
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const category = searchParams.get('category');
    const withSpending = searchParams.get('withSpending') === 'true';

    // Build query - include spending data if requested
    let selectClause = "*";
    if (withSpending) {
      selectClause = `
        *,
        budget_transactions (
          transaction_id,
          transactions (
            amount,
            type
          )
        )
      `;
    }

    let query = supabase
      .from("budgets")
      .select(selectClause)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (month) {
      const monthNum = parseInt(month);
      if (monthNum >= 1 && monthNum <= 12) {
        query = query.eq("month", monthNum);
      }
    }

    if (year) {
      const yearNum = parseInt(year);
      if (yearNum >= 2020) {
        query = query.eq("year", yearNum);
      }
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data: budgets, error } = await query;

    if (error) {
      console.error("Error fetching budgets:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to fetch budgets"
      }, { status: 500 });
    }

    // If withSpending is requested, calculate spending data and totals
    if (withSpending && budgets) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const budgetsWithSpending = budgets.map((budget: any) => {
        const spent = budget.budget_transactions?.reduce((total: number, bt: { transactions: { amount: number; type: string } | null }) => {
          if (bt.transactions && bt.transactions.type === 'outcome') {
            return total + bt.transactions.amount;
          }
          return total;
        }, 0) || 0;

        return {
          ...budget,
          spent,
          remaining: budget.amount - spent
        };
      });

      // Calculate totals
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalBudget = budgetsWithSpending.reduce((sum: number, budget: any) => sum + budget.amount, 0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalSpent = budgetsWithSpending.reduce((sum: number, budget: any) => sum + budget.spent, 0);

      return NextResponse.json({
        success: true,
        data: {
          budgets: budgetsWithSpending,
          totalBudget,
          totalSpent
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: budgets || []
    });

  } catch (error) {
    console.error("Error in budgets GET:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  } finally {
    const duration = Date.now() - startTime; // Calculate duration
    console.log(`GET /api/budgets duration: ${duration}ms`); // Log duration
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now(); // Start time
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, month, year, color, icon, category, amount } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({
        success: false,
        error: "Budget name is required"
      }, { status: 400 });
    }

    if (!month || month < 1 || month > 12) {
      return NextResponse.json({
        success: false,
        error: "Valid month is required (1-12)"
      }, { status: 400 });
    }

    if (!year || year < 2020) {
      return NextResponse.json({
        success: false,
        error: "Valid year is required"
      }, { status: 400 });
    }

    // Check for duplicate budget name in the same month/year
    const { data: existingBudget } = await supabase
      .from("budgets")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", name.trim())
      .eq("month", month)
      .eq("year", year)
      .single();

    if (existingBudget) {
      return NextResponse.json({
        success: false,
        error: "Budget with this name already exists for this month"
      }, { status: 409 });
    }

    // Create budget
    const { data: budget, error } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        name: name.trim(),
        month,
        year,
        color: color || "#0055FF",
        icon: icon || "wallet",
        category: category || "general",
        amount: amount || 0,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating budget:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to create budget"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: budget
    }, { status: 201 });

  } catch (error) {
    console.error("Error in budgets POST:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  } finally {
    const duration = Date.now() - startTime; // Calculate duration
    console.log(`POST /api/budgets duration: ${duration}ms`); // Log duration
  }
} 