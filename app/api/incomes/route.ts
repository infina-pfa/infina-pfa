import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { incomeValidator } from "@/lib/validation/financial-validators";

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
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const category = searchParams.get("category");
    const recurring = searchParams.get("recurring");

    // Build query for income transactions
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "income")
      .order("created_at", { ascending: false });

    // Apply date filters
    if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (monthNum >= 1 && monthNum <= 12 && yearNum >= 2020) {
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

        query = query
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      }
    } else if (year) {
      const yearNum = parseInt(year);
      if (yearNum >= 2020) {
        const startDate = new Date(yearNum, 0, 1);
        const endDate = new Date(yearNum, 11, 31, 23, 59, 59);

        query = query
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      }
    }

    // Apply category filter (search in description)
    if (category) {
      query = query.ilike("description", `%${category}%`);
    }

    // Apply recurring filter
    if (recurring === "true") {
      query = query.gt("recurring", 0);
    } else if (recurring === "false") {
      query = query.eq("recurring", 0);
    }

    const { data: incomes, error } = await query;

    if (error) {
      console.error("Error fetching incomes:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch incomes",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: incomes || [],
    });
  } catch (error) {
    console.error("Error in incomes GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime; // Calculate duration
    console.log(`GET /api/incomes duration: ${duration}ms`); // Log duration
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
    const { amount, description, recurring } = body;

    // Validate input data
    try {
      incomeValidator.validateCreate({
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

    // Create income transaction
    const { data: income, error } = await supabase
      .from("transactions")
      .insert({
        name: "user income",
        user_id: user.id,
        amount,
        description: description,
        type: "income",
        recurring: recurring || 0,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating income:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create income",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: income,
    });
  } catch (error) {
    console.error("Error in incomes POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime; // Calculate duration
    console.log(`POST /api/incomes duration: ${duration}ms`); // Log duration
  }
}
