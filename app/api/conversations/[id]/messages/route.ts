import { withAuth } from "@/lib/api/auth-wrapper";
import { NextResponse } from "next/server";

export const POST = withAuth<{ id: string }>(async (request, context) => {
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
});
