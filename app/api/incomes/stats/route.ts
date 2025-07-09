import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Base query for income transactions
    let baseQuery = supabase
      .from("transactions")
      .select("amount, recurring, created_at, description")
      .eq("user_id", user.id)
      .eq("type", "income");

    // Apply filters for specific month/year if provided
    if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (monthNum >= 1 && monthNum <= 12 && yearNum >= 2020) {
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

        baseQuery = baseQuery
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      }
    } else if (year) {
      const yearNum = parseInt(year);
      if (yearNum >= 2020) {
        const startDate = new Date(yearNum, 0, 1);
        const endDate = new Date(yearNum, 11, 31, 23, 59, 59);

        baseQuery = baseQuery
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      }
    }

    const { data: incomes, error } = await baseQuery;

    if (error) {
      console.error("Error fetching income stats:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch income statistics",
        },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalIncomes = incomes?.length || 0;

    const totals = incomes?.reduce(
      (acc, income) => {
        acc.total += income.amount;
        if (income.recurring > 0) {
          acc.recurring += income.amount;
        } else {
          acc.oneTime += income.amount;
        }
        return acc;
      },
      { total: 0, recurring: 0, oneTime: 0 }
    ) || { total: 0, recurring: 0, oneTime: 0 };

    // Get unique categories from descriptions
    const categories = new Set<string>();
    incomes?.forEach((income) => {
      if (income.description) {
        // Extract potential categories from description
        const words = income.description.toLowerCase().split(/[\s,:-]+/);
        words.forEach((word: string) => {
          if (word.length > 2) categories.add(word);
        });
      }
    });

    // Calculate monthly average
    const monthsInYear = month ? 1 : 12;
    const averageMonthly = totals.total / monthsInYear;

    const stats = {
      totalIncomes,
      monthlyTotal: month ? totals.total : 0,
      yearlyTotal: totals.total,
      recurringTotal: totals.recurring,
      oneTimeTotal: totals.oneTime,
      averageMonthly: Math.round(averageMonthly * 100) / 100,
      categoriesCount: categories.size,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in income stats GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime;
    console.log(`GET /api/incomes/stats duration: ${duration}ms`);
  }
}
