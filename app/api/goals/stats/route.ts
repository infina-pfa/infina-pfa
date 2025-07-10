import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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

    // Get all goals for the user
    const { data: goals, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching goals for stats:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch goals statistics",
        },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalGoals = goals?.length || 0;

    // Completed goals (current_amount >= target_amount)
    const completedGoals =
      goals?.filter(
        (goal) =>
          goal.target_amount !== null &&
          goal.current_amount >= goal.target_amount
      ).length || 0;

    // Upcoming goals (due in next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const upcomingGoals =
      goals?.filter((goal) => {
        if (!goal.due_date) return false;
        const dueDate = new Date(goal.due_date);
        return dueDate >= today && dueDate <= thirtyDaysFromNow;
      }).length || 0;

    // Total saved (sum of all current_amounts)
    const totalSaved =
      goals?.reduce((sum, goal) => sum + goal.current_amount, 0) || 0;

    // Average completion percentage
    let averageCompletion = 0;
    if (totalGoals > 0) {
      const totalCompletion =
        goals?.reduce((sum, goal) => {
          if (!goal.target_amount || goal.target_amount === 0) return sum;
          const completion = Math.min(
            100,
            (goal.current_amount / goal.target_amount) * 100
          );
          return sum + completion;
        }, 0) || 0;

      averageCompletion = Math.round(totalCompletion / totalGoals);
    }

    // Return statistics
    return NextResponse.json({
      success: true,
      data: {
        totalGoals,
        completedGoals,
        upcomingGoals,
        totalSaved,
        averageCompletion,
      },
    });
  } catch (error) {
    console.error("Error in goals stats GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime; // Calculate duration
    console.log(`GET /api/goals/stats duration: ${duration}ms`); // Log duration
  }
}
