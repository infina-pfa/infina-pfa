import { withAuth } from "@/lib/api/auth-wrapper";
import { CreateIncomeRequest, IncomeResponse } from "@/lib/types/income.types";
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

  const response = await apiClient.get<IncomeResponse[]>("/incomes", {
    params,
  });
  
  return NextResponse.json(response.data);
});

export const POST = withAuth(async (req, context) => {
  const { apiClient } = context;

  const body: CreateIncomeRequest = await req.json();

  const response = await apiClient.post<IncomeResponse>("/incomes", body);
  
  return NextResponse.json(response.data, { status: 201 });
});