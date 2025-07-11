import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json();

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile data is required",
        },
        { status: 400 }
      );
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

    // Update or create user profile in the main users table
    const userUpdateData = {
      name:
        profile.name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User",
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    let userResult;
    if (existingUser) {
      // Update existing user
      userResult = await supabase
        .from("users")
        .update(userUpdateData)
        .eq("user_id", user.id);
    } else {
      // Create new user record
      userResult = await supabase.from("users").insert({
        user_id: user.id,
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
          profile_data: profile,
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
        profile: profile,
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
