import { NextResponse, NextRequest } from "next/server";
import { verifyCustomerCredentials, verifyAdminCredentials, storeUserSessionToken, storeSessionToken } from "@/lib/db";
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
    
    // Debug logging for Vercel
    console.log("[AUTH] Login attempt:", { email, hasDbUrl: !!process.env.DATABASE_URL, env: process.env.NODE_ENV });

    const { allowed, retryAfter } = checkRateLimit(
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

    // Try admin login first
    const adminUser = await verifyAdminCredentials(email, password);
    if (adminUser) {
      resetRateLimit(email);
      
      const sessionToken = generateSessionToken();
      const refreshToken = generateRefreshToken();
      const sessionExpiry = getSessionExpiryTime();
      const refreshTokenExpiry = getRefreshTokenExpiryTime();

      // Store session for admin
      storeSessionToken(sessionToken, email);

      console.log(`[AUTH] Successful admin login for user: ${adminUser.id}`);

      const response = NextResponse.json(
        {
          success: true,
          user: {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
          },
          userType: "admin",
          sessionExpiry: sessionExpiry.toISOString(),
        },
        { status: 200 }
      );

      const cookieOptions = getSecureCookieOptions();
      response.cookies.set("admire-session", sessionToken, cookieOptions);
      response.cookies.set("admire-refresh", refreshToken, {
        ...cookieOptions,
        maxAge: Math.floor(refreshTokenExpiry.getTime() / 1000),
      });
      response.cookies.set("user-type", "admin", cookieOptions);

      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set("X-XSS-Protection", "1; mode=block");

      return response;
    }

    // Try customer login
    const customer = await verifyCustomerCredentials(email, password);
    if (!customer) {
      console.warn(`[AUTH] Failed login attempt for email: ${email}`);
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    resetRateLimit(email);

    const sessionToken = generateSessionToken();
    const refreshToken = generateRefreshToken();
    const sessionExpiry = getSessionExpiryTime();
    const refreshTokenExpiry = getRefreshTokenExpiryTime();

    storeUserSessionToken(sessionToken, email);

    console.log(`[AUTH] Successful customer login for user: ${customer.id}`);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone || undefined,
        },
        userType: "customer",
        sessionExpiry: sessionExpiry.toISOString(),
      },
      { status: 200 }
    );

    const cookieOptions = getSecureCookieOptions();
    response.cookies.set("admire-session", sessionToken, cookieOptions);
    response.cookies.set("admire-refresh", refreshToken, {
      ...cookieOptions,
      maxAge: Math.floor(refreshTokenExpiry.getTime() / 1000),
    });
    response.cookies.set("user-type", "customer", cookieOptions);

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

