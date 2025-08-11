import { withAuth } from "@/lib/api/auth-wrapper";
import { TransactionResponse } from "@/lib/types/budget.types";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req, context) => {
  const { apiClient } = context;

  const searchParams = req.nextUrl.searchParams;
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const params = {
    month: month ? parseInt(month, 10) : undefined,
    year: year ? parseInt(year, 10) : undefined,
  };

  const response = await apiClient.get<TransactionResponse[]>(
    "/budgets/spending",
    { params }
  );

  return NextResponse.json(response.data);
});
