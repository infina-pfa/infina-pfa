import { AuthenticatedContext, withAuth } from "@/lib/api/auth-wrapper";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAuth(
  async (
    request: NextRequest,
    context: AuthenticatedContext<{ id: string }>
  ): Promise<NextResponse> => {
    const { id } = context.params!;
    const { apiClient } = context;
    const { content, type, sender, metadata } = await request.json();
    const response = await apiClient.post(
      `/ai-advisor/conversations/${id}/messages`,
      {
        content,
        type,
        sender,
        metadata,
      }
    );

    return NextResponse.json(response.data);
  }
);
