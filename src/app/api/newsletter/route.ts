import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/db";
import { AUTH_RATE_LIMITS } from "@/lib/auth-utils";
import { checkRateLimit, getClientIp, tooManyRequests } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const rate = await checkRateLimit(
      `newsletter:${getClientIp(request)}`,
      AUTH_RATE_LIMITS.newsletter.maxAttempts,
      AUTH_RATE_LIMITS.newsletter.windowMs
    );
    if (!rate.allowed) {
      return tooManyRequests(rate.retryAfter);
    }

    const body = await request.json();
    const email = String(body?.email || "").trim();
    const name = body?.name ? String(body.name).trim() : null;

    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const outcome = await addSubscriber(email, name);
    if (outcome === "already") {
      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Successfully subscribed to our newsletter" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
