import { withAuth } from "@/lib/api/auth-wrapper";
import { CreateDebtRequest, DebtResponse } from "@/lib/types/debt.types";
import { NextResponse } from "next/server";

export const GET = withAuth(async (_req, context) => {
  const { apiClient } = context;

  const response = await apiClient.get<DebtResponse[]>("/debts");
  
  return NextResponse.json(response.data);
});

export const POST = withAuth(async (req, context) => {
  const { apiClient } = context;

  const body: CreateDebtRequest = await req.json();

  const response = await apiClient.post<DebtResponse>("/debts", body);
  
  return NextResponse.json(response.data, { status: 201 });
});