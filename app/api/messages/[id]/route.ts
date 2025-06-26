import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Tables, TablesUpdate } from "@/lib/supabase/database";

type Message = Tables<"user_messages">;
type MessageUpdate = TablesUpdate<"user_messages">;

interface UpdateMessageRequest {
  content?: string;
  meta_data?: any;
}

interface MessageResponse {
  success: boolean;
  data?: Message;
  error?: string;
  message?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<MessageResponse>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: message, error } = await supabase
      .from("user_messages")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching message:", error);
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: message,
    });

  } catch (error) {
    console.error("Unexpected error in GET /api/messages/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<MessageResponse>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let requestBody: UpdateMessageRequest;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (requestBody.content !== undefined) {
      if (typeof requestBody.content !== "string" || requestBody.content.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "Content must be a non-empty string" },
          { status: 400 }
        );
      }
      if (requestBody.content.length > 10000) {
        return NextResponse.json(
          { success: false, error: "Content cannot exceed 10,000 characters" },
          { status: 400 }
        );
      }
    }

    const updateData: MessageUpdate = {};
    if (requestBody.content !== undefined) {
      updateData.content = requestBody.content.trim();
    }

    const { data: message, error } = await supabase
      .from("user_messages")
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating message:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update message" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: message,
      message: "Message updated successfully"
    });

  } catch (error) {
    console.error("Unexpected error in PUT /api/messages/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<MessageResponse>> {
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
      .from("user_messages")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting message:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete message" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully"
    });

  } catch (error) {
    console.error("Unexpected error in DELETE /api/messages/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 