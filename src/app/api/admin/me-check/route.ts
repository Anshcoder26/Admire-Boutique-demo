import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, storeSessionToken } from "@/lib/db";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { getSecureCookieOptions } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Check if user has an existing session from unified login
    const sessionToken = request.cookies.get("admire-session")?.value;
    const userType = request.cookies.get("user-type")?.value;

    if (!sessionToken || userType !== "admin") {
      return NextResponse.json(
        { error: "No active admin session" },
        { status: 401 }
      );
    }

    // Validate the session
    const user = await validateSessionToken(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: "Session invalid" },
        { status: 401 }
      );
    }

    // Generate a new token for the admin dashboard
    const adminToken = crypto.randomBytes(24).toString("hex");
    await storeSessionToken(adminToken, user.email);

    const response = NextResponse.json({
      success: true,
      token: adminToken,
      user: { id: user.id, name: user.name, email: user.email },
    });

    // Set the httpOnly admin session cookie so the dashboard is authenticated
    // without exposing the token to JavaScript.
    response.cookies.set(ADMIN_SESSION_COOKIE, adminToken, getSecureCookieOptions());

    return response;
  } catch {
    return NextResponse.json(
      { error: "Session check failed" },
      { status: 500 }
    );
  }
}
