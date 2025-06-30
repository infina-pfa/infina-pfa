import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ConversationInsert } from "@/lib/types/chat.types";

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json({
        success: false,
        error: "Title is required and must be a string"
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

    // Create conversation
    const conversationData: ConversationInsert = {
      user_id: user.id,
      name: title
    };

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert(conversationData)
      .select()
      .single();

    if (conversationError || !conversation) {
      console.error("Error creating conversation:", conversationError);
      return NextResponse.json({
        success: false,
        error: "Failed to create conversation"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: conversation
    });

  } catch (error) {
    console.error("Error in conversations POST:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 