import { NextResponse } from "next/server";
import { createCustomer, storeUserSessionToken } from "@/lib/db";
import {
  generateSessionToken,
  generateRefreshToken,
  getSecureCookieOptions,
  getSessionExpiryTime,
  getRefreshTokenExpiryTime,
} from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "").trim();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Name, email, phone and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const user = await createCustomer({ name, email, phone, password });
    if (!user) {
      return NextResponse.json(
        { error: "Account already exists with this email" },
        { status: 409 }
      );
    }

    // Generate secure tokens (same as login flow)
    const sessionToken = generateSessionToken();
    const refreshToken = generateRefreshToken();
    const sessionExpiry = getSessionExpiryTime();
    const refreshTokenExpiry = getRefreshTokenExpiryTime();

    storeUserSessionToken(sessionToken, email);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || undefined,
        },
        sessionExpiry: sessionExpiry.toISOString(),
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookies (prevents XSS token theft)
    const cookieOptions = getSecureCookieOptions();
    response.cookies.set("admire-session", sessionToken, cookieOptions);
    response.cookies.set("admire-refresh", refreshToken, {
      ...cookieOptions,
      maxAge: Math.floor(refreshTokenExpiry.getTime() / 1000),
    });

    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  } catch (error) {
    console.error("[AUTH] Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
