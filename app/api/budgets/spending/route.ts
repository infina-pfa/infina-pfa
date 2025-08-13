import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth-wrapper";

export const GET = withAuth(async (req: NextRequest, context) => {
  const { apiClient } = context;
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (!month || !year) {
    return NextResponse.json(
      { error: "Month and year are required" },
      { status: 400 }
    );
  }

  const response = await apiClient.get(`/budgets/spending`, {
    params: {
      month: parseInt(month),
      year: parseInt(year),
    },
  });

  return NextResponse.json(response.data || []);
});
