import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, storeSessionToken } from "@/lib/db";

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
    storeSessionToken(adminToken, user.email);

    return NextResponse.json({
      success: true,
      token: adminToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch {
    return NextResponse.json(
      { error: "Session check failed" },
      { status: 500 }
    );
  }
}
