import { NextRequest, NextResponse } from "next/server";
import { endAllSessions } from "@/lib/session-cookies";

/**
 * POST /api/auth/logout
 * Clears session cookies and invalidates the server-side session so a retained
 * or leaked token cannot be reused after logout.
 */
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Revoke both storefront and owner-dashboard sessions server-side, then
    // clear their cookies.
    await endAllSessions(request, response);

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
