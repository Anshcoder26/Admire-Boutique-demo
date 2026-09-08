/**
 * Rate limiter backed by the database (see `consumeRateLimit` in lib/db).
 *
 * Unlike a per-instance in-memory Map, this survives serverless cold starts and
 * is shared across all running instances, so brute-force protection actually
 * holds in production. For very high throughput a dedicated store (Redis /
 * Upstash) is still recommended, but the DB approach needs no extra infra.
 */
import { consumeRateLimit, resetRateLimitKey, type RateLimitResult } from "@/lib/db";

/**
 * Record one attempt against `key` and report whether it is allowed.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  return consumeRateLimit(key, maxAttempts, windowMs);
}

/**
 * Reset the rate limit for a key (e.g. after a successful login).
 */
export async function resetRateLimit(key: string): Promise<void> {
  await resetRateLimitKey(key);
}

/**
 * Extract a best-effort client IP from a request for use in rate-limit keys.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/**
 * Build a standard 429 JSON response.
 */
export function tooManyRequests(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: "Too many attempts. Please try again later.",
      retryAfter,
      nextRetryIn: `${retryAfter} seconds`,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter || 60),
      },
    }
  );
}
