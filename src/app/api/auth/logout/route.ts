import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/db";

/**
 * POST /api/auth/logout
 * Clears session cookies and invalidates the server-side session so a retained
 * or leaked token cannot be reused after logout.
 */
export async function POST(request: NextRequest) {
  try {
    // Revoke the server-side session before clearing cookies. Deleting by token
    // works for both customer and admin sessions (they share the sessions table).
    const token = request.cookies.get("admire-session")?.value;
    if (token) {
      await destroySession(token);
    }

    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear session cookies
    response.cookies.delete("admire-session");
    response.cookies.delete("admire-refresh");
    response.cookies.delete("user-type");

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
