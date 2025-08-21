import { withAuth } from "@/lib/api/auth-wrapper";
import {
  UpdateDebtRequest,
  DebtDetailResponse,
  DebtSimple,
} from "@/lib/types/debt.types";
import { NextResponse } from "next/server";

export const GET = withAuth<{ id: string }>(async (_req, context) => {
  const { apiClient, params } = context;

  if (!params) {
    return NextResponse.json(
      { error: "Missing route parameters" },
      { status: 400 }
    );
  }

  const response = await apiClient.get<DebtDetailResponse>(
    `/debts/${params.id}`
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

  const body: UpdateDebtRequest = await req.json();

  const response = await apiClient.patch<DebtSimple>(
    `/debts/${params.id}`,
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

  await apiClient.delete(`/debts/${params.id}`);
  
  return NextResponse.json({ message: "Debt deleted successfully" });
});