import { AuthenticatedContext, withAuth } from "@/lib/api/auth-wrapper";
import { INFINA_FINANCIAL_SERVICE_URL } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";
// Note: Orchestrator service now handles all prompt generation and tool management

// Note: All analysis logic and tool handling is now managed by OnboardingOrchestratorService

export const POST = withAuth(
  async (
    request: NextRequest,
    context: AuthenticatedContext
  ): Promise<NextResponse> => {
    const { accessToken } = context;

    // Get request body
    const body = await request.json();
    const { message } = body;

    // Forward the request to the financial service with auth token
    const response = await fetch(
      `${INFINA_FINANCIAL_SERVICE_URL}/onboarding/messages/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: message,
        }),
      }
    );

    // Handle streaming response
    if (!response.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to connect to financial service" }),
        { status: response.status }
      );
    }

    // Return the streaming response directly
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }
);

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
