import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/budgets/allocation - Create budgets from onboarding allocation data
 * This endpoint implements the exact database operations required by the user's flow:
 * - Branch A (Simplicity): living_expenses + free_to_spend + emergency_fund
 * - Branch B (Detail): individual categories + free_to_spend + emergency_fund
 */
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
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      allocationData, 
      monthlyIncome, 
      budgetingStyle, 
      expenseBreakdown 
    } = body;

    // Validate required fields
    if (!allocationData || !monthlyIncome) {
      return NextResponse.json(
        {
          success: false,
          error: "Allocation data and monthly income are required",
        },
        { status: 400 }
      );
    }

    // Get current month and year
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Calculate monetary values from percentages
    const emergencyFundAmount = (monthlyIncome * allocationData.emergencyFund) / 100;
    const livingExpensesAmount = (monthlyIncome * allocationData.livingExpenses) / 100;
    const freeToSpendAmount = (monthlyIncome * allocationData.freeToSpend) / 100;

    console.log("💰 Creating budgets from allocation:", {
      style: budgetingStyle,
      income: monthlyIncome,
      allocation: allocationData,
      expenseBreakdown,
      monetary: {
        emergencyFund: emergencyFundAmount,
        livingExpenses: livingExpensesAmount,
        freeToSpend: freeToSpendAmount
      }
    });

    // Delete existing budgets for this month/year to avoid duplicates
    const { error: deleteError } = await supabase
      .from("budgets")
      .delete()
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year);

    if (deleteError) {
      console.error("Error deleting existing budgets:", deleteError);
    }

    const budgetRecords = [];


    if (budgetingStyle === "goal_focused" || budgetingStyle === "simplicity") {
      // Branch A: Simplicity-Focused Flow
      console.log("📊 Creating simplified budget structure (goal_focused)");
      
      // Single consolidated Living Expenses budget (Priority 2)
      budgetRecords.push({
        user_id: user.id,
        month,
        year,
        name: "Living Expenses",
        category: "essential",
        icon: "home",
        color: "#2ECC71",
        amount: livingExpensesAmount,
      });

    } else if (budgetingStyle === "detail_tracker" && expenseBreakdown) {
      // Branch B: Detail-Oriented Flow
      console.log("📊 Creating detailed budget structure (detail_tracker)");
      
      // Create individual category budgets for living expenses
      const categoryMapping: Record<string, { name: string; icon: string; color: string }> = {
        house_rent: { name: "Housing & Rent", icon: "home", color: "#0055FF" },
        food: { name: "Food & Dining", icon: "utensils", color: "#FF9800" },
        transportation: { name: "Transportation", icon: "car", color: "#2ECC71" },
        utilities: { name: "Utilities", icon: "zap", color: "#FFC107" },
        others: { name: "Other Living Expenses", icon: "shopping-cart", color: "#F44336" },
        other_essentials: { name: "Other Essentials", icon: "shopping-cart", color: "#F44336" },
      };

      Object.entries(expenseBreakdown).forEach(([categoryId, amount]) => {
        const numericAmount = typeof amount === 'number' ? amount : Number(amount);
        console.log(`🔍 Processing category: ${categoryId}, amount: ${amount}, numericAmount: ${numericAmount}, hasMapping: ${!!categoryMapping[categoryId]}`);
        
        if (numericAmount > 0 && categoryMapping[categoryId]) {
          const mapping = categoryMapping[categoryId];
          console.log(`✅ Creating budget for ${categoryId}: ${mapping.name} - ${numericAmount}`);
          budgetRecords.push({
            user_id: user.id,
            month,
            year,
            name: mapping.name,
            category: "essential",
            icon: mapping.icon,
            color: mapping.color,
            amount: numericAmount,
          });
        } else {
          console.log(`❌ Skipping category ${categoryId}: amount=${numericAmount}, hasMapping=${!!categoryMapping[categoryId]}`);
        }
      });
    }

    // Always create Free to Spend budget (Priority 3)
    budgetRecords.push({
      user_id: user.id,
      month,
      year,
      name: "Free to Spend",
      category: "discretionary", 
      icon: "credit-card",
      color: "#FF9800",
      amount: freeToSpendAmount,
    });

    // Insert all budget records
    const { data: createdBudgets, error: insertError } = await supabase
      .from("budgets")
      .insert(budgetRecords)
      .select("*");

    if (insertError) {
      console.error("Error creating budgets:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create budget records",
        },
        { status: 500 }
      );
    }

    console.log("✅ Successfully created budgets:", createdBudgets);

    return NextResponse.json({
      success: true,
      data: {
        budgets: createdBudgets,
        budgetingStyle,
        allocation: allocationData,
        totalBudgets: createdBudgets.length,
      },
    });

  } catch (error) {
    console.error("Error in budgets allocation POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
} 