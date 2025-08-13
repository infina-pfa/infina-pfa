import { AuthenticatedContext, withAuth } from "@/lib/api/auth-wrapper";
import { NextRequest, NextResponse } from "next/server";

interface UserProfile {
  metadata: Record<string, unknown>;
  income: number;
  expenses: number;
  budgetingStyle: string;
}

export const GET = withAuth(
  async (req: NextRequest, context: AuthenticatedContext) => {
    const { apiClient } = context;
    const response = await apiClient.get("/onboarding/profile");
    return NextResponse.json(response.data);
  }
);

export const PUT = withAuth(
  async (req: NextRequest, context: AuthenticatedContext) => {
    const { apiClient } = context;
    const { identifiedStage, name, income, expenses, budgetingStyle, ...rest } =
      await req.json();

    const currentUserProfile = (await apiClient.get("/onboarding/profile"))
      .data as { data: UserProfile };
    const currentMetadata = currentUserProfile.data.metadata;
    const newMetadata = {
      ...currentMetadata,
      ...rest,
    };

    await apiClient.patch("/onboarding/profile", {
      metadata: newMetadata,
      income,
      expense: expenses,
      budgetingStyle,
    });

    await apiClient.patch("/users/profile", {
      name,
      financialStage: identifiedStage,
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  }
);
