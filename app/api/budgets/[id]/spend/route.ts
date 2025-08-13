import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth-wrapper";
import { SpendRequest } from "@/lib/types/budget.types";

export const POST = withAuth(async (req: NextRequest, context) => {
  const { apiClient } = context;
  const { id } = context.params as unknown as { id: string };
  const body: SpendRequest = await req.json();

  const response = await apiClient.post(`/budgets/${id}/spend`, body);
  return NextResponse.json(response.data, { status: 201 });
});
