import { AuthenticatedContext, withAuth } from "@/lib/api/auth-wrapper";
import { INFINA_FINANCIAL_SERVICE_URL } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";

export type OnboardingMessage = {
  id: string;
  userId: string;
  sender: string;
  content: string;
  componentId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export const GET = withAuth(
  async (
    request: NextRequest,
    context: AuthenticatedContext
  ): Promise<NextResponse<OnboardingMessage[]>> => {
    const { accessToken } = context;
    const response = await fetch(
      `${INFINA_FINANCIAL_SERVICE_URL}/onboarding/messages`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const messages = (await response.json()) as OnboardingMessage[];

    return NextResponse.json(messages);
  }
);

export const POST = withAuth(
  async (
    request: NextRequest,
    context: AuthenticatedContext
  ): Promise<NextResponse<OnboardingMessage>> => {
    const { accessToken } = context;

    const { message, sender, component_id, metadata } = await request.json();
    const response = await fetch(
      `${INFINA_FINANCIAL_SERVICE_URL}/onboarding/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
          sender,
          component_id,
          metadata,
        }),
      }
    );

    const createdMessage = (await response.json()) as OnboardingMessage;

    return NextResponse.json(createdMessage);
  }
);
