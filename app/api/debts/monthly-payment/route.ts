import { withAuth } from "@/lib/api/auth-wrapper";
import { MonthlyPaymentResponse } from "@/lib/types/debt.types";
import { NextResponse } from "next/server";

export const GET = withAuth(async (_req, context) => {
  const { apiClient } = context;

  const response = await apiClient.get<MonthlyPaymentResponse>(
    "/debts/monthly-payment"
  );
  
  return NextResponse.json(response.data);
});