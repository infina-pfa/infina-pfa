import { AuthenticatedContext, withAuth } from "@/lib/api/auth-wrapper";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAuth(
  async (request: NextRequest, context: AuthenticatedContext) => {
    const { apiClient } = context;

    const response = await apiClient.post("/onboarding/profile/complete", {});

    if (response.data.status !== 201) {
      return NextResponse.json(
        { error: response.data.message || "Failed to complete onboarding" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  }
);
