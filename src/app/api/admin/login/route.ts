import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { storeSessionToken, verifyAdminCredentials } from "@/lib/db";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { getSecureCookieOptions, AUTH_RATE_LIMITS } from "@/lib/auth-utils";
import { checkRateLimit, resetRateLimit, getClientIp, tooManyRequests } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const rateKey = `admin-login:${email}:${getClientIp(request)}`;
  const rate = await checkRateLimit(
    rateKey,
    AUTH_RATE_LIMITS.adminLogin.maxAttempts,
    AUTH_RATE_LIMITS.adminLogin.windowMs
  );
  if (!rate.allowed) {
    return tooManyRequests(rate.retryAfter);
  }

  const user = await verifyAdminCredentials(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  }

  await resetRateLimit(rateKey);

  const token = crypto.randomBytes(24).toString("hex");
  await storeSessionToken(token, email);

  const response = NextResponse.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });

  // Store the admin session in an httpOnly cookie (not exposed to JS, safe from XSS)
  response.cookies.set(ADMIN_SESSION_COOKIE, token, getSecureCookieOptions());

  return response;
}
