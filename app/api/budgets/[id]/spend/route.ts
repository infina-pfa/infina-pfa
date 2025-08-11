import { withAuth } from "@/lib/api/auth-wrapper";
import { SpendRequest, BudgetDetailResponse } from "@/lib/types/budget.types";
import { NextResponse } from "next/server";

export const POST = withAuth<{ id: string }>(async (req, context) => {
  const { apiClient, params } = context;

  if (!params) {
    return NextResponse.json(
      { error: "Missing route parameters" },
      { status: 400 }
    );
  }

  const body: SpendRequest = await req.json();

  const response = await apiClient.post<BudgetDetailResponse>(
    `/budgets/${params.id}/spend`,
    body
  );

  return NextResponse.json(response.data, { status: 201 });
});
