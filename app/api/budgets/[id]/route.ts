import { withAuth } from "@/lib/api/auth-wrapper";
import {
  UpdateBudgetRequest,
  BudgetDetailResponse,
  BudgetResponse,
} from "@/lib/types/budget.types";
import { NextResponse } from "next/server";

export const GET = withAuth<{ id: string }>(async (_req, context) => {
  const { apiClient, params } = context;

  if (!params) {
    return NextResponse.json(
      { error: "Missing route parameters" },
      { status: 400 }
    );
  }

  const response = await apiClient.get<BudgetDetailResponse>(
    `/budgets/${params.id}`
  );

  return NextResponse.json(response.data);
});

export const PATCH = withAuth<{ id: string }>(async (req, context) => {
  const { apiClient, params } = context;

  if (!params) {
    return NextResponse.json(
      { error: "Missing route parameters" },
      { status: 400 }
    );
  }

  const body: UpdateBudgetRequest = await req.json();

  const response = await apiClient.patch<BudgetResponse>(
    `/budgets/${params.id}`,
    body
  );

  return NextResponse.json(response.data);
});

export const DELETE = withAuth<{ id: string }>(async (_req, context) => {
  const { apiClient, params } = context;

  if (!params) {
    return NextResponse.json(
      { error: "Missing route parameters" },
      { status: 400 }
    );
  }

  await apiClient.delete(`/budgets/${params.id}`);

  return NextResponse.json({ message: "Budget deleted successfully" });
});
