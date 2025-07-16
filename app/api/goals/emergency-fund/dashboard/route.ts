import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current date for calculations
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Fetch emergency fund goal from database
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .or('title.ilike.%emergency%,title.ilike.%dự phòng%,title.ilike.%khẩn cấp%,title.ilike.%fund%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (goalsError) {
      console.error("Error fetching goals:", goalsError);
      return NextResponse.json(
        { error: "Failed to fetch goals" },
        { status: 500 }
      );
    }

    // If no emergency fund goal found, try to get the first goal
    let emergencyFundGoal = goals?.[0];
    
    if (!emergencyFundGoal) {
      const { data: allGoals, error: allGoalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (allGoalsError) {
        console.error("Error fetching all goals:", allGoalsError);
      }
      
      emergencyFundGoal = allGoals?.[0];
    }

    if (!emergencyFundGoal) {
      // No goals found, return default values
      return NextResponse.json({
        success: true,
        data: {
          currentAmount: 0,
          targetAmount: 0,
          monthsOfCoverage: 0,
          progressPercentage: 0,
          projectedCompletionDate: "",
          monthlySavingsRate: 0,
        },
      });
    }

    // Fetch monthly budget data to calculate expenses
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select(`
        *,
        budget_transactions (
          transaction_id,
          transactions (
            amount,
            type
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .eq('year', currentYear);

    if (budgetsError) {
      console.error("Error fetching budgets:", budgetsError);
    }

    // Calculate total monthly expenses from budget data
    let totalMonthlyExpenses = 0;
    if (budgets && budgets.length > 0) {
      budgets.forEach(budget => {
        if (budget.budget_transactions) {
          budget.budget_transactions.forEach((bt: {
            transaction_id: string;
            transactions: {
              amount: number;
              type: string;
            };
          }) => {
            if (bt.transactions && bt.transactions.type === 'expense') {
              totalMonthlyExpenses += Math.abs(bt.transactions.amount || 0);
            }
          });
        }
      });
    }

    // Fallback to budget limits if no transactions
    if (totalMonthlyExpenses === 0 && budgets && budgets.length > 0) {
      totalMonthlyExpenses = budgets.reduce((sum, budget) => sum + (budget.limit || 0), 0);
    }

    // If still no data, use a conservative estimate
    if (totalMonthlyExpenses === 0) {
      totalMonthlyExpenses = 10000000; // 10M VND default
    }

    // Calculate emergency fund metrics
    const currentAmount = emergencyFundGoal.current_amount || 0;
    const targetAmount = emergencyFundGoal.target_amount || (totalMonthlyExpenses * 3); // 3 months of expenses
    const remainingAmount = Math.max(0, targetAmount - currentAmount);
    const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    
    // Calculate months of coverage
    const monthsOfCoverage = totalMonthlyExpenses > 0 ? currentAmount / totalMonthlyExpenses : 0;

    // Calculate monthly savings rate and projected completion
    let monthlySavingsRate = 0;
    let projectedCompletionDate = "";

    if (emergencyFundGoal.due_date && targetAmount > 0 && remainingAmount > 0) {
      // Calculate based on due date
      const dueDate = new Date(emergencyFundGoal.due_date);
      const monthsUntilDue = Math.max(1, 
        (dueDate.getFullYear() - currentDate.getFullYear()) * 12 + 
        (dueDate.getMonth() - currentDate.getMonth())
      );
      monthlySavingsRate = remainingAmount / monthsUntilDue;
      projectedCompletionDate = dueDate.toISOString();
    } else {
      // Conservative estimate: 20% of monthly expenses as savings rate
      monthlySavingsRate = Math.max(500000, totalMonthlyExpenses * 0.2); // At least 500k VND
      const monthsToComplete = monthlySavingsRate > 0 ? Math.ceil(remainingAmount / monthlySavingsRate) : 36;
      
      if (remainingAmount > 0) {
        const projectedDate = new Date(currentDate);
        projectedDate.setMonth(projectedDate.getMonth() + monthsToComplete);
        projectedCompletionDate = projectedDate.toISOString();
      }
    }

    const dashboardData = {
      currentAmount,
      targetAmount,
      monthsOfCoverage: Math.round(monthsOfCoverage * 10) / 10, // Round to 1 decimal
      progressPercentage: Math.round(progressPercentage * 10) / 10, // Round to 1 decimal
      projectedCompletionDate,
      monthlySavingsRate,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Emergency fund dashboard API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch emergency fund dashboard data" 
      },
      { status: 500 }
    );
  }
} 