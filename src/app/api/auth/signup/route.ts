import { NextResponse } from "next/server";
import { createCustomer, storeUserSessionToken } from "@/lib/db";
import {
  generateSessionToken,
  generateRefreshToken,
  getSecureCookieOptions,
  getSessionExpiryTime,
  getRefreshTokenExpiryTime,
  validatePasswordStrength,
  AUTH_RATE_LIMITS,
} from "@/lib/auth-utils";
import { checkRateLimit, getClientIp, tooManyRequests } from "@/lib/rate-limiter";

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

    // Rate-limit on IP + email so an attacker can't register unlimited accounts
    // from one IP by varying the email (e.g. user+1@, user+2@ ...).
    const ipRate = await checkRateLimit(
      `signup:${getClientIp(request)}:${email}`,
      AUTH_RATE_LIMITS.signup.maxAttempts,
      AUTH_RATE_LIMITS.signup.windowMs
    );
    if (!ipRate.allowed) {
      return tooManyRequests(ipRate.retryAfter);
    }

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Name, email, phone and password are required" },
        { status: 400 }
      );
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json(
        { error: strength.errors[0], errors: strength.errors },
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

    await storeUserSessionToken(sessionToken, email);

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
      maxAge: Math.floor((refreshTokenExpiry.getTime() - Date.now()) / 1000),
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
