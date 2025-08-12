import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth-wrapper";
import { UpdateGoalRequest, GoalResponseDto } from "@/lib/types/goal.types";

export const PATCH = withAuth(async (req: NextRequest, context) => {
  const { apiClient } = context;
  const { id } = context.params as unknown as { id: string };
  const body: UpdateGoalRequest = await req.json();

  const response = await apiClient.patch<GoalResponseDto>(
    `/goals/${id}`,
    body
  );
  return NextResponse.json(response.data);
});

export const DELETE = withAuth(async (req: NextRequest, context) => {
  const { apiClient } = context;
  const { id } = context.params as unknown as { id: string };

  await apiClient.delete(`/goals/${id}`);
  return NextResponse.json({ success: true });
});