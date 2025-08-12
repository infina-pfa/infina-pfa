import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth-wrapper";
import { WithdrawGoalRequest, GoalResponseDto } from "@/lib/types/goal.types";

export const POST = withAuth(async (req: NextRequest, context) => {
  const { apiClient } = context;
  const { id } = context.params as unknown as { id: string };
  const body: WithdrawGoalRequest = await req.json();

  const response = await apiClient.post<GoalResponseDto>(
    `/goals/${id}/withdraw`,
    body
  );
  return NextResponse.json(response.data);
});