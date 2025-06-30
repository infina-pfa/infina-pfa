import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "infina-pfa-api"
      }
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({
      success: false,
      error: "Health check failed"
    }, { status: 500 });
  }
} 