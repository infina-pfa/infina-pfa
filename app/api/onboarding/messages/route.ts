import { AuthenticatedContext, withAuth } from "@/lib/api/auth-wrapper";
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
    const { apiClient } = context;
    const response = await apiClient.get("/onboarding/messages");

    const messages = response.data as OnboardingMessage[];

    return NextResponse.json(messages);
  }
);

export const POST = withAuth(
  async (
    request: NextRequest,
    context: AuthenticatedContext
  ): Promise<NextResponse<OnboardingMessage>> => {
    const { apiClient } = context;

    const { message, sender, component_id, metadata } = await request.json();
    const response = await apiClient.post("/onboarding/messages", {
      content: message,
      sender,
      component_id,
      metadata,
    });
    const createdMessage = response.data as OnboardingMessage;

    return NextResponse.json(createdMessage);
  }
);
