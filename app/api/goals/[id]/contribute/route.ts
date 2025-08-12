import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth-wrapper";
import { ContributeGoalRequest, GoalResponseDto } from "@/lib/types/goal.types";

export const POST = withAuth(async (req: NextRequest, context) => {
  const { apiClient } = context;
  const { id } = context.params as unknown as { id: string };
  const body: ContributeGoalRequest = await req.json();

  const response = await apiClient.post<GoalResponseDto>(
    `/goals/${id}/contribute`,
    body
  );
  return NextResponse.json(response.data);
});