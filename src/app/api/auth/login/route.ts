import { NextResponse, NextRequest } from "next/server";
import { verifyCustomerCredentials, storeUserSessionToken } from "@/lib/db";
import {
  generateSessionToken,
  generateRefreshToken,
  getSecureCookieOptions,
  validateEmail,
  getSessionExpiryTime,
  getRefreshTokenExpiryTime,
  AUTH_RATE_LIMITS,
} from "@/lib/auth-utils";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 5 attempts per 15 minutes per email
    const body = (await request.json()) as { email?: string; password?: string };
    const email = String(body.email || "").trim().toLowerCase();

    const { allowed, remaining, retryAfter } = checkRateLimit(
      email,
      AUTH_RATE_LIMITS.login.maxAttempts,
      AUTH_RATE_LIMITS.login.windowMs
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          retryAfter,
          nextRetryIn: `${retryAfter} seconds`,
        },
        {
          status: 429,
          headers: { "Retry-After": retryAfter?.toString() || "60" },
        }
      );
    }

    // Input validation
    if (!email || !body.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const password = String(body.password || "");
    if (password.length === 0 || password.length > 128) {
      return NextResponse.json(
        { error: "Invalid password format" },
        { status: 400 }
      );
    }

    // Verify credentials
    const user = await verifyCustomerCredentials(email, password);
    if (!user) {
      // Log failed attempt (in production: log to security monitoring)
      console.warn(`[AUTH] Failed login attempt for email: ${email}`);

      return NextResponse.json(
        {
          error: "Invalid email or password",
          // Generic message to prevent email enumeration
        },
        { status: 401 }
      );
    }

    // Reset rate limit on successful login
    resetRateLimit(email);

    // Generate secure tokens
    const sessionToken = generateSessionToken();
    const refreshToken = generateRefreshToken();
    const sessionExpiry = getSessionExpiryTime();
    const refreshTokenExpiry = getRefreshTokenExpiryTime();

    // Store session in database
    storeUserSessionToken(sessionToken, email);
    // TODO: Store refresh token in database for token rotation

    // Log successful login (in production: log to audit trail)
    console.log(`[AUTH] Successful login for user: ${user.id}`);

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

    // Set secure HTTP-only cookie with session token
    const cookieOptions = getSecureCookieOptions();
    response.cookies.set("admire-session", sessionToken, cookieOptions);
    response.cookies.set("admire-refresh", refreshToken, {
      ...cookieOptions,
      maxAge: Math.floor(refreshTokenExpiry.getTime() / 1000),
    });

    // Additional security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  } catch (error) {
    console.error("[AUTH] Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

