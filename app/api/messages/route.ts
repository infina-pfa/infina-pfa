import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Tables, TablesInsert, Enums } from "@/lib/supabase/database";

type Message = Tables<"user_messages">;
type MessageInsert = TablesInsert<"user_messages">;
type MessageSenderType = Enums<"message_sender_type">;

interface CreateMessageRequest {
  content: string;
  conversation_id: string;
  sender_type: MessageSenderType;
  meta_data?: null;
}

interface MessageResponse {
  success: boolean;
  data?: Message | Message[];
  error?: string;
  message?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<MessageResponse>> {
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

    // Get search params for filtering and pagination
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversation_id");
    const senderType = searchParams.get("sender_type") as MessageSenderType | null;
    const fromDate = searchParams.get("from_date");
    const toDate = searchParams.get("to_date");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined;
    // Build query
    let query = supabase
      .from("user_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (conversationId) {
      query = query.eq("conversation_id", conversationId);
    }

    if (senderType) {
      query = query.eq("sender_type", senderType);
    }

    if (fromDate) {
      query = query.gte("created_at", fromDate);
    }

    if (toDate) {
      query = query.lte("created_at", toDate);
    }

    if (search) {
      query = query.ilike("content", `%${search}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: messages,
      message: `Retrieved ${messages?.length || 0} messages`
    });

  } catch (error) {
    console.error("Unexpected error in GET /api/messages:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<MessageResponse>> {
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
    let requestBody: CreateMessageRequest;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    const { content, conversation_id, sender_type } = requestBody;
    
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

    if (!conversation_id || typeof conversation_id !== "string") {
      return NextResponse.json(
        { success: false, error: "Conversation ID is required and must be a string" },
        { status: 400 }
      );
    }

    if (!sender_type || !["BOT", "USER"].includes(sender_type)) {
      return NextResponse.json(
        { success: false, error: "Sender type is required and must be either BOT or USER" },
        { status: 400 }
      );
    }

    // Verify conversation exists and belongs to user
    const { data: conversation, error: conversationError } = await supabase
      .from("user_conversations")
      .select("id")
      .eq("id", conversation_id)
      .eq("user_id", user.id)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Prepare message data for insertion
    const messageData: MessageInsert = {
      content: content.trim(),
      conversation_id,
      sender_type,
      user_id: user.id,
    };

    const { data: message, error } = await supabase
      .from("user_messages")
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error("Error creating message:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create message" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: message,
      message: "Message created successfully"
    });

  } catch (error) {
    console.error("Unexpected error in POST /api/messages:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 