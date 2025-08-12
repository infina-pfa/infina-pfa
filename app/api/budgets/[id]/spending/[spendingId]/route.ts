import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth-wrapper";

export const DELETE = withAuth(async (req: NextRequest, context) => {
  const { apiClient } = context;
  const { id, spendingId } = context.params as unknown as {
    id: string;
    spendingId: string;
  };

  await apiClient.delete(`/budgets/${id}/spending/${spendingId}`);
  return NextResponse.json({ success: true }, { status: 200 });
});
