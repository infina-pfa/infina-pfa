import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Tables, TablesInsert } from "@/lib/supabase/database";

type Conversation = Tables<"user_conversations">;
type ConversationInsert = TablesInsert<"user_conversations">;

interface CreateConversationRequest {
  title: string;
  latest_response_id?: string | null;
}

interface ConversationResponse {
  success: boolean;
  data?: Conversation | Conversation[];
  error?: string;
  message?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<ConversationResponse>> {
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
    const includeDeleted = searchParams.get("include_deleted") === "true";
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined;

    // Build query
    let query = supabase
      .from("user_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (!includeDeleted) {
      query = query.is("deleted_at", null);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data: conversations, error } = await query;

    if (error) {
      console.error("Error fetching conversations:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch conversations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversations,
      message: `Retrieved ${conversations?.length || 0} conversations`
    });

  } catch (error) {
    console.error("Unexpected error in GET /api/conversations:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ConversationResponse>> {
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
    let requestBody: CreateConversationRequest;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    const { title, latest_response_id } = requestBody;
    
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (title.length > 255) {
      return NextResponse.json(
        { success: false, error: "Title cannot exceed 255 characters" },
        { status: 400 }
      );
    }

    // Prepare conversation data for insertion
    const conversationData: ConversationInsert = {
      title: title.trim(),
      latest_response_id: latest_response_id || null,
      user_id: user.id,
    };

    const { data: conversation, error } = await supabase
      .from("user_conversations")
      .insert(conversationData)
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
      message: "Conversation created successfully"
    });

  } catch (error) {
    console.error("Unexpected error in POST /api/conversations:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 