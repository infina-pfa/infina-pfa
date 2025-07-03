import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function PATCH(request: NextRequest) {
  try {
    const updates = await request.json();

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        error: "Profile updates are required"
      }, { status: 400 });
    }

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
              // Server Component context
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

    // Update user profile in database
    const { error: updateError } = await supabase
      .from("users")
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error("Error updating user profile:", updateError);
      return NextResponse.json({
        success: false,
        error: "Failed to update profile"
      }, { status: 500 });
    }

    console.log("Updated user profile:", {
      userId: user.id,
      updates
    });

    return NextResponse.json({
      success: true,
      data: { updated: true }
    });

  } catch (error) {
    console.error("Error updating onboarding profile:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 