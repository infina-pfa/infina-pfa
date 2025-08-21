import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth-wrapper";
import { PayDebtRequest, DebtDetailResponse } from "@/lib/types/debt.types";

export const POST = withAuth<{ id: string }>(async (req: NextRequest, context) => {
  const { apiClient, params } = context;

  if (!params) {
    return NextResponse.json(
      { error: "Missing route parameters" },
      { status: 400 }
    );
  }

  const body: PayDebtRequest = await req.json();

  const response = await apiClient.post<DebtDetailResponse>(
    `/debts/${params.id}/payments`,
    body
  );
  
  return NextResponse.json(response.data, { status: 201 });
});