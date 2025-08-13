import { withAuth } from "@/lib/api/auth-wrapper";
import { UpdateIncomeRequest, IncomeResponse } from "@/lib/types/income.types";
import { NextResponse } from "next/server";

export const PATCH = withAuth(async (req, context) => {
  const { apiClient } = context;
  const { id } = context.params as unknown as { id: string };

  const body: UpdateIncomeRequest = await req.json();

  const response = await apiClient.patch<IncomeResponse>(
    `/incomes/${id}`,
    body
  );

  return NextResponse.json(response.data);
});

export const DELETE = withAuth(async (_, context) => {
  const { apiClient } = context;
  const { id } = context.params as unknown as { id: string };

  await apiClient.delete(`/incomes/${id}`);

  return NextResponse.json({ success: true });
});