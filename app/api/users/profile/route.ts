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

    // Get user profile from users table
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      // If user profile doesn't exist in users table, return basic info from auth
      return NextResponse.json({
        success: true,
        data: {
          user_id: user.id,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
          email: user.email,
          total_asset_value: 0,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error("Error in users profile GET:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 