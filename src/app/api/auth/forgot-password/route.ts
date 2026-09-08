import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function resetLinkEmail(resetUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #7D1D1D 0%, #8B7355 100%); color: #fff; padding: 28px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Reset your password</h1>
      </div>
      <div style="background: #fffaf6; padding: 28px; border-radius: 0 0 8px 8px;">
        <p>Hello,</p>
        <p>We received a request to reset your Admire Boutique password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #7D1D1D; color: #fff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">Reset Password</a>
        </p>
        <p style="font-size: 13px; color: #8B7355;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const { allowed } = await checkRateLimit(`forgot-password:${email}:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please try again later.", nextRetryIn: "in 15 minutes" },
        { status: 429 }
      );
    }

    // Generate a token only if the account exists. We always respond with the
    // same success message to avoid leaking which emails are registered.
    const token = await createPasswordResetToken(email);
    if (token) {
      const origin =
        request.headers.get("origin") ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        new URL(request.url).origin;
      const resetUrl = `${origin}/reset-password?token=${token}`;

      await sendEmail({
        to: email,
        subject: "Reset your Admire Boutique password",
        html: resetLinkEmail(resetUrl),
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("[FORGOT-PASSWORD] Error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process request. Please try again later." },
      { status: 500 }
    );
  }
}
