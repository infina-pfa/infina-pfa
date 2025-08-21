import { withAuth } from "@/lib/api/auth-wrapper";
import { NextResponse } from "next/server";

export const DELETE = withAuth<{ id: string; paymentId: string }>(
  async (_req, context) => {
    const { apiClient, params } = context;

    if (!params) {
      return NextResponse.json(
        { error: "Missing route parameters" },
        { status: 400 }
      );
    }

    await apiClient.delete(
      `/debts/${params.id}/payments/${params.paymentId}`
    );

    return NextResponse.json({ message: "Payment deleted successfully" });
  }
);