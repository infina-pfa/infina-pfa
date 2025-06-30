import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Conversation ID is required"
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

    // Get conversation
    const { data: conversation, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: "Conversation not found or access denied"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: conversation
    });

  } catch (error) {
    console.error("Error in conversations GET:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Conversation ID is required"
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

    // Delete messages first (due to foreign key constraint)
    await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", id)
      .eq("user_id", user.id);

    // Delete conversation
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting conversation:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to delete conversation"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true }
    });

  } catch (error) {
    console.error("Error in conversations DELETE:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 