import { AuthenticatedContext, withAuth } from "@/lib/api/auth-wrapper";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAuth(
  async (req: NextRequest, context: AuthenticatedContext) => {
    const { apiClient } = context;
    const { title } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Title is required and must be a string",
        },
        { status: 400 }
      );
    }

    // Create conversation using the AI advisor API endpoint
    const response = await apiClient.post("/ai-advisor/conversations", {
      name: title,
    });

    return NextResponse.json(response.data);
  }
);

export const GET = withAuth(
  async (req: NextRequest, context: AuthenticatedContext) => {
    const { apiClient } = context;

    // Get all conversations for the authenticated user
    const response = await apiClient.get("/ai-advisor/conversations");

    return NextResponse.json(response.data);
  }
);
