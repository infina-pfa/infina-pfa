import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "User ID is required"
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

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    // Check if user already has profile
    const { data: existingProfile } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .single();

    let userProfile = {
      name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || ""
    };

    if (existingProfile) {
      userProfile = {
        name: existingProfile.name || userProfile.name,
        ...existingProfile
      };
    }

    // Create or get conversation for onboarding
    let conversationId = null;
    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .eq("name", "Onboarding Session")
      .single();

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const { data: newConversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          name: "Onboarding Session"
        })
        .select("id")
        .single();

      if (conversationError) {
        console.error("Error creating conversation:", conversationError);
        return NextResponse.json({
          success: false,
          error: "Failed to initialize onboarding session"
        }, { status: 500 });
      }

      conversationId = newConversation.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        userProfile
      }
    });

  } catch (error) {
    console.error("Error in onboarding initialize:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 