/**
 * In-memory rate limiter for authentication endpoints
 * Production: prevents brute force attacks
 * Note: Use Redis in production for distributed rate limiting across multiple servers
 */

interface RateLimitEntry {
  attempts: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if request exceeds rate limit
 * @param key - Unique identifier (e.g., email or IP address)
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns { allowed: boolean; remaining: number; retryAfter?: number }
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // No entry or time window has expired
    rateLimitStore.set(key, { attempts: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  entry.attempts += 1;

  if (entry.attempts > maxAttempts) {
    const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter: retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - entry.attempts,
  };
}

/**
 * Reset rate limit for a key (e.g., after successful login)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits (for testing only)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Middleware for rate limiting
 */
export function withRateLimit(
  handler: (
    request: Request,
    { params }: { params: Record<string, string> }
  ) => Promise<Response>,
  getLimitKey: (request: Request) => string,
  maxAttempts: number,
  windowMs: number
) {
  return async (
    request: Request,
    { params }: { params: Record<string, string> }
  ): Promise<Response> => {
    const limitKey = getLimitKey(request);
    const { allowed, remaining, retryAfter } = checkRateLimit(
      limitKey,
      maxAttempts,
      windowMs
    );

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: "Too many attempts. Please try again later.",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter?.toString() || "60",
          },
        }
      );
    }

    const response = await handler(request, { params });

    // Add remaining attempts to response header
    response.headers.set("X-RateLimit-Remaining", remaining.toString());

    return response;
  };
}
