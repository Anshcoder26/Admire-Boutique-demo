import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Clears session cookies and invalidates the session
 */
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear session cookies
    response.cookies.delete("admire-session");
    response.cookies.delete("admire-refresh");

    // Add security headers
    response.headers.set("X-Content-Type-Options", "nosniff");

    return response;
  } catch (error) {
    console.error("[AUTH] Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
