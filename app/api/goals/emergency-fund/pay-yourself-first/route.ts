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

    // For now, return mock data - this would normally fetch from database
    // TODO: Implement real pay yourself first calculation logic
    const mockPayYourselfFirstData = {
      recommendedAmount: 5000000, // 5M VND recommended monthly savings
      userInput: 0, // User hasn't input anything yet
      status: 'pending' as const,
      dueDate: new Date().toISOString().split('T')[0], // Today's date
    };

    return NextResponse.json({
      success: true,
      data: mockPayYourselfFirstData,
    });
  } catch (error) {
    console.error("Pay yourself first API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch pay yourself first data" 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { amount, status } = body;

    // TODO: Implement real logic to update emergency fund
    // For now, just return success
    console.log(`User confirmed ${status} with amount: ${amount}`);

    return NextResponse.json({
      success: true,
      data: {
        message: "Pay yourself first action recorded successfully",
        amount,
        status,
      },
    });
  } catch (error) {
    console.error("Pay yourself first POST API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to record pay yourself first action" 
      },
      { status: 500 }
    );
  }
} 