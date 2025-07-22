import { Database } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import { FinancialMetadata } from "@/lib/types/user.types";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create Supabase client
    const supabase = await createClient<Database>();

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

    const goal = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .single();
    let payYourselfFirstAmount = 0;
    let income = 0;
    if (goal.data?.target_amount) {
      const numberOfMonth = Math.floor(
        (new Date(goal.data.due_date || "").getTime() -
          new Date(goal.data.created_at || "").getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      );
      payYourselfFirstAmount = goal.data.target_amount / numberOfMonth;
      income = goal.data.target_amount / 3;
    }

    // Update or create user profile in the main users table

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const financialMetadata =
      existingUser?.financial_metadata as unknown as FinancialMetadata;

    const weekSpending = Array.from(
      { length: 4 },
      () => (income - payYourselfFirstAmount) / 4
    );

    const userUpdateData = {
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      financial_metadata: {
        payYourselfFirstAmount,
        monthlyIncome: income,
        weekSpending: weekSpending,
        dateGetSalary: financialMetadata?.dateGetSalary || null,
      },
    };

    let userResult;
    if (existingUser) {
      // Update existing user
      userResult = await supabase
        .from("users")
        .update({
          ...userUpdateData,
        })
        .eq("user_id", user.id);
    } else {
      // Create new user record
      userResult = await supabase.from("users").insert({
        user_id: user.id,
        name: user.user_metadata.name,
        ...userUpdateData,
      });
    }

    if (userResult.error) {
      console.error("Error updating user profile:", userResult.error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to complete onboarding",
        },
        { status: 500 }
      );
    }

    // Store complete onboarding profile data
    const { error: profileError } = await supabase
      .from("onboarding_profiles")
      .upsert(
        {
          user_id: user.id,
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (profileError) {
      console.error("Error saving final onboarding profile:", profileError);
      // Don't fail the request if this fails, as the main user update succeeded
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      data: {
        user_id: user.id,
        completed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in onboarding complete:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
