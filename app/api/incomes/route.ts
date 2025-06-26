import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateIncomeRequest } from "@/lib/types/income.types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

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

    // Build query
    let query = supabase
      .from("incomes")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    // Apply filters
    const fromDate = searchParams.get("from_date");
    if (fromDate) {
      query = query.gte("date", fromDate);
    }

    const toDate = searchParams.get("to_date");
    if (toDate) {
      query = query.lte("date", toDate);
    }

    const isRecurring = searchParams.get("is_recurring");
    if (isRecurring) {
      query = query.eq("is_recurring", isRecurring === "true");
    }

    const limit = searchParams.get("limit");
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const offset = searchParams.get("offset");
    if (offset) {
      const offsetNum = parseInt(offset);
      const limitNum = limit ? parseInt(limit) : 50;
      query = query.range(offsetNum, offsetNum + limitNum - 1);
    }

    const { data: incomes, error } = await query;

    if (error) {
      console.error("Error fetching incomes:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch incomes" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: incomes,
      total: incomes?.length || 0,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    const body: CreateIncomeRequest = await request.json();

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { success: false, error: "Income date is required" },
        { status: 400 }
      );
    }

    if (!body.description?.trim()) {
      return NextResponse.json(
        { success: false, error: "Description is required" },
        { status: 400 }
      );
    }

    // Validate description length
    if (body.description.length > 500) {
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

    // Create income
    const { data: income, error } = await supabase
      .from("incomes")
      .insert({
        user_id: user.id,
        amount: body.amount,
        date: body.date,
        description: body.description,
        is_recurring: body.is_recurring,
        pay_yourself_percent: body.pay_yourself_percent,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating income:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create income" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: income,
      message: "Income created successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 