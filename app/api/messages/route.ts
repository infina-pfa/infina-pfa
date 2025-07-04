import { createClient } from "@/lib/supabase/server";
import { MessageInsert } from "@/lib/types/chat.types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversation_id");

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: "Conversation ID is required"
      }, { status: 400 });
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    // Get messages for conversation
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to fetch messages"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: messages || []
    });

  } catch (error) {
    console.error("Error in messages GET:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, conversation_id, sender_type, type = "text", metadata } = await request.json();

    if (!content || !conversation_id || !sender_type) {
      return NextResponse.json({
        success: false,
        error: "Content, conversation_id, and sender_type are required"
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

    // Map sender_type to database sender field
    const senderMap: Record<string, "ai" | "user" | "system"> = {
      "BOT": "ai",
      "USER": "user",
      "SYSTEM": "system"
    };

    const sender = senderMap[sender_type] || "user";

    // Create message
    const messageData: MessageInsert = {
      user_id: user.id,
      conversation_id,
      content: content.trim(),
      sender,
      type,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
    };

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert(messageData)
      .select()
      .single();

    if (messageError || !message) {
      console.error("Error creating message:", messageError);
      return NextResponse.json({
        success: false,
        error: "Failed to create message"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error("Error in messages POST:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 