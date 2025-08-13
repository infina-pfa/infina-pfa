import { withAuth } from "@/lib/api/auth-wrapper";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req, context) => {
  const { apiClient } = context;

  const response = await apiClient.get<string>("/ai-advisor/start-message");

  return NextResponse.json(response.data);
});
