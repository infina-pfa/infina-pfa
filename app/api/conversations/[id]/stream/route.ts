import { AuthenticatedContext, withAuth } from "@/lib/api/auth-wrapper";
import { INFINA_FINANCIAL_SERVICE_URL } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAuth(
  async (
    request: NextRequest,
    context: AuthenticatedContext<{ id: string }>
  ): Promise<NextResponse> => {
    const { stream } = context;
    const { id } = context.params!;
    const { content } = await request.json();

    const response = await stream(
      `${INFINA_FINANCIAL_SERVICE_URL}/ai-advisor/conversations/${id}/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      }
    );

    if (!response.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to connect to financial service" }),
        { status: response.status }
      );
    }

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
