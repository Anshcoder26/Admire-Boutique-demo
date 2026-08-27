import { NextRequest, NextResponse } from "next/server";
import { validateUserSessionToken } from "@/lib/db";

/**
 * GET /api/auth/me
 * Validates current session and returns authenticated user info
 * Supports both:
 * 1. Authorization header with Bearer token (from localStorage)
 * 2. HTTP-only cookie (from secure session)
 */
export async function GET(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    let token = "";
    const authHeader = request.headers.get("authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    }

    // If no header token, try HTTP-only cookie
    if (!token) {
      token = request.cookies.get("admire-session")?.value || "";
    }

    if (!token) {
      return NextResponse.json(
        { error: "No active session" },
        { status: 401 }
      );
    }

    // Verify token
    const user = await validateUserSessionToken(token);

    if (!user) {
      // Clear invalid session cookie
      const response = NextResponse.json(
        { error: "Session expired or invalid" },
        { status: 401 }
      );
      response.cookies.delete("admire-session");
      response.cookies.delete("admire-refresh");
      return response;
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || undefined,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AUTH] Session validation error:", error);
    return NextResponse.json(
      { error: "Session validation failed" },
      { status: 500 }
    );
  }
}
