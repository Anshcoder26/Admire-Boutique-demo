import { NextResponse } from "next/server";
import { consumePasswordResetToken, updateCustomerPassword, destroyCustomerSessions } from "@/lib/db";
import { AUTH_RATE_LIMITS, validatePasswordStrength } from "@/lib/auth-utils";
import { checkRateLimit, getClientIp, tooManyRequests } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  try {
    const ipRate = await checkRateLimit(
      `reset-password:${getClientIp(request)}`,
      AUTH_RATE_LIMITS.passwordReset.maxAttempts,
      AUTH_RATE_LIMITS.passwordReset.windowMs
    );
    if (!ipRate.allowed) {
      return tooManyRequests(ipRate.retryAfter);
    }

    const body = (await request.json()) as { token?: string; password?: string };
    const token = String(body.token || "").trim();
    const password = String(body.password || "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Reset token is required" },
        { status: 400 }
      );
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json(
        { success: false, error: strength.errors[0], errors: strength.errors },
        { status: 400 }
      );
    }

    const result = await consumePasswordResetToken(token);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const updated = await updateCustomerPassword(result.customerId, password);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Unable to update password. Please try again." },
        { status: 500 }
      );
    }

    // Revoke any existing sessions so a previously-stolen token can't be reused
    // after the password has been reset.
    await destroyCustomerSessions(result.email);

    return NextResponse.json({
      success: true,
      message: "Your password has been reset. You can now log in.",
    });
  } catch (error) {
    console.error("[RESET-PASSWORD] Error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process request. Please try again later." },
      { status: 500 }
    );
  }
}
