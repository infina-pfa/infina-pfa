import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth-wrapper";
import { CreateGoalRequest, GoalResponseDto } from "@/lib/types/goal.types";

export const GET = withAuth(async (req: NextRequest, context) => {
  const { apiClient } = context;
  
  const response = await apiClient.get<GoalResponseDto[]>("/goals");
  return NextResponse.json(response.data || []);
});

export const POST = withAuth(async (req: NextRequest, context) => {
  const { apiClient } = context;
  const body: CreateGoalRequest = await req.json();

  const response = await apiClient.post<GoalResponseDto>("/goals", body);
  return NextResponse.json(response.data, { status: 201 });
});