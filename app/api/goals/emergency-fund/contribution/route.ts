import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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
    const { amount, status, date } = body;

    // Validate input
    if (typeof amount !== 'number' || !['completed', 'postponed'].includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid input data" 
        },
        { status: 400 }
      );
    }

    // For now, just log the contribution - this would normally update database
    // TODO: Implement real emergency fund contribution tracking
    console.log("Emergency fund contribution:", {
      userId: user.id,
      amount,
      status,
      date,
    });

    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error) {
    console.error("Emergency fund contribution API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update emergency fund contribution" 
      },
      { status: 500 }
    );
  }
} 