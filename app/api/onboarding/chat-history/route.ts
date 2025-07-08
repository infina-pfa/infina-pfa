import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface SaveChatMessageRequest {
  conversationId: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  componentId?: string;
  metadata?: Record<string, unknown>;
  customTimestamp?: string;
}



// Save a chat message
export async function POST(request: NextRequest) {
  try {
    const { conversationId, sender, content, componentId, metadata, customTimestamp }: SaveChatMessageRequest = await request.json();

    if (!conversationId || !sender || !content) {
      return NextResponse.json({
        success: false,
        error: "Conversation ID, sender, and content are required"
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

    // Verify user owns the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, user_id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json({
        success: false,
        error: "Invalid conversation ID or access denied"
      }, { status: 403 });
    }

    // Save the chat message
    const { data: savedMessage, error: saveError } = await supabase
      .from("onboarding_chat")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        sender,
        content,
        component_id: componentId || null,
        metadata: metadata || null,
        created_at: customTimestamp || new Date().toISOString(), // Use custom timestamp if provided
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving chat message:", saveError);
      return NextResponse.json({
        success: false,
        error: "Failed to save chat message"
      }, { status: 500 });
    }

    console.log(`✅ Saved ${sender} message for conversation ${conversationId} at ${savedMessage.created_at}`);

    return NextResponse.json({
      success: true,
      data: savedMessage
    });

  } catch (error) {
    console.error("Error in POST /api/onboarding/chat-history:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

// Load chat history for a conversation
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversationId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!conversationId) {
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

    // Verify user owns the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, user_id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json({
        success: false,
        error: "Invalid conversation ID or access denied"
      }, { status: 403 });
    }

    // Load chat history
    const { data: messages, error: loadError } = await supabase
      .from("onboarding_chat")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (loadError) {
      console.error("Error loading chat history:", loadError);
      return NextResponse.json({
        success: false,
        error: "Failed to load chat history"
      }, { status: 500 });
    }

    console.log(`📖 Loaded ${messages?.length || 0} messages for conversation ${conversationId}`);
    
    // Debug: Log the order of messages
    if (messages && messages.length > 0) {
      console.log("📋 Message order:");
      messages.forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.sender}] ${msg.created_at}: "${msg.content.substring(0, 50)}..."`);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: messages || [],
        conversation_id: conversationId,
        total: messages?.length || 0
      }
    });

  } catch (error) {
    console.error("Error in GET /api/onboarding/chat-history:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 