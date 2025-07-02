import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get all budgets for the user
    const { data: allBudgets, error } = await supabase
      .from("budgets")
      .select("id, category, month, year")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching budget stats:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to fetch budget statistics"
      }, { status: 500 });
    }

    // Calculate statistics
    const stats = {
      totalBudgets: allBudgets?.length || 0,
      categoriesCount: new Set(allBudgets?.map(b => b.category)).size,
      monthlyBudgets: allBudgets?.filter(b => b.month === currentMonth && b.year === currentYear).length || 0,
      yearlyBudgets: allBudgets?.filter(b => b.year === currentYear).length || 0,
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error in budget stats GET:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 