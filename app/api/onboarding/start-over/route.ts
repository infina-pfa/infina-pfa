import { AuthenticatedContext, withAuth } from "@/lib/api/auth-wrapper";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAuth(
  async (
    request: NextRequest,
    context: AuthenticatedContext
  ): Promise<NextResponse> => {
    const { apiClient } = context;

    try {
      await apiClient.post("/onboarding/profile/start-over");

      return NextResponse.json({
        success: true,
        message: "Onboarding reset successfully",
      });
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to reset onboarding",
        },
        { status: error instanceof AxiosError ? error.response?.status : 500 }
      );
    }
  }
);
