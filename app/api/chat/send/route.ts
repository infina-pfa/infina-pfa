import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SendMessageRequest, SendMessageResponse } from "@/lib/types/chat.types";

export async function POST(request: NextRequest): Promise<NextResponse<SendMessageResponse>> {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let requestBody: SendMessageRequest;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { content, conversationId, type = "text", metadata } = requestBody;

    // Validate required fields
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Content is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { success: false, error: "Content cannot exceed 10,000 characters" },
        { status: 400 }
      );
    }

    if (!conversationId || typeof conversationId !== "string") {
      return NextResponse.json(
        { success: false, error: "Conversation ID is required and must be a string" },
        { status: 400 }
      );
    }

    // Verify conversation exists and belongs to user
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Create user message
    const { data: userMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        content: content.trim(),
        sender: "user",
        type,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
      })
      .select()
      .single();

    if (messageError || !userMessage) {
      console.error("Error creating message:", messageError);
      return NextResponse.json(
        { success: false, error: "Failed to create message" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userMessage,
        conversationId
      },
      message: "Message sent successfully"
    });

  } catch (error) {
    console.error("Unexpected error in POST /api/chat/send:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 