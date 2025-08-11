import { withAuth } from "@/lib/api/auth-wrapper";
import { NextResponse } from "next/server";

export const DELETE = withAuth<{ id: string; spendingId: string }>(
  async (_req, context) => {
    const { apiClient, params } = context;

    if (!params) {
      return NextResponse.json(
        { error: "Missing route parameters" },
        { status: 400 }
      );
    }

    const { id, spendingId } = params;

    await apiClient.delete(`/budgets/${id}/spending/${spendingId}`);

    return NextResponse.json({ message: "Spending deleted successfully" });
  }
);
