import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Tables, TablesUpdate } from "@/lib/supabase/database";

type Conversation = Tables<"user_conversations">;
type ConversationUpdate = TablesUpdate<"user_conversations">;

interface UpdateConversationRequest {
  title?: string;
  latest_response_id?: string | null;
  deleted_at?: string | null;
}

interface ConversationResponse {
  success: boolean;
  data?: Conversation;
  error?: string;
  message?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ConversationResponse>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: conversation, error } = await supabase
      .from("user_conversations")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching conversation:", error);
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });

  } catch (error) {
    console.error("Unexpected error in GET /api/conversations/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ConversationResponse>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let requestBody: UpdateConversationRequest;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate fields if provided
    if (requestBody.title !== undefined) {
      if (typeof requestBody.title !== "string" || requestBody.title.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "Title must be a non-empty string" },
          { status: 400 }
        );
      }
      if (requestBody.title.length > 255) {
        return NextResponse.json(
          { success: false, error: "Title cannot exceed 255 characters" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: ConversationUpdate = {};
    if (requestBody.title !== undefined) {
      updateData.title = requestBody.title.trim();
    }
    if (requestBody.latest_response_id !== undefined) {
      updateData.latest_response_id = requestBody.latest_response_id;
    }
    if (requestBody.deleted_at !== undefined) {
      updateData.deleted_at = requestBody.deleted_at;
    }

    const { data: conversation, error } = await supabase
      .from("user_conversations")
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating conversation:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
      message: "Conversation updated successfully"
    });

  } catch (error) {
    console.error("Unexpected error in PUT /api/conversations/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ConversationResponse>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from("user_conversations")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting conversation:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Conversation deleted successfully"
    });

  } catch (error) {
    console.error("Unexpected error in DELETE /api/conversations/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 