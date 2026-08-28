import { NextRequest, NextResponse } from "next/server";
import { validateUserSessionToken, validateSessionToken } from "@/lib/db";

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

    const userTypeHint = request.cookies.get("user-type")?.value;

    // Validate against both customer and admin session stores.
    // Prefer the store hinted by the `user-type` cookie, then fall back.
    let userType: "customer" | "admin" | null = null;
    let user: { id: string; name: string; email: string; phone?: string } | null = null;

    if (userTypeHint === "admin") {
      const admin = await validateSessionToken(token);
      if (admin) {
        user = { id: admin.id, name: admin.name, email: admin.email };
        userType = "admin";
      }
    }

    if (!user) {
      const customer = await validateUserSessionToken(token);
      if (customer) {
        user = {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone || undefined,
        };
        userType = "customer";
      }
    }

    if (!user) {
      const admin = await validateSessionToken(token);
      if (admin) {
        user = { id: admin.id, name: admin.name, email: admin.email };
        userType = "admin";
      }
    }

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
        userType,
        user,
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
