import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// State-changing HTTP methods that must be protected against CSRF.
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Defense-in-depth CSRF protection for cookie-authenticated API mutations.
 *
 * Session cookies are already `SameSite=Lax`, which blocks the primary CSRF
 * vector (cross-site form/subresource POSTs). On top of that, we verify the
 * `Origin` (falling back to `Referer`) header host against the request host for
 * every mutating `/api/*` call. This is the OWASP-recommended header-verification
 * strategy and requires no client-side token plumbing.
 *
 * Non-browser clients (curl, server-to-server) typically omit `Origin`/`Referer`;
 * since CSRF is a browser-only attack, requests without either header are allowed
 * through. Only a *present but mismatched* origin is rejected.
 */
export function proxy(request: NextRequest) {
  if (!MUTATING_METHODS.has(request.method)) {
    return NextResponse.next();
  }

  const requestHost = request.headers.get("host");
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  const sourceUrl = originHeader ?? refererHeader;

  // No origin/referer to check (non-browser client) — allow.
  if (!sourceUrl) {
    return NextResponse.next();
  }

  let sourceHost: string | null = null;
  try {
    sourceHost = new URL(sourceUrl).host;
  } catch {
    // Malformed Origin/Referer header on a mutating request — reject.
    return csrfRejection();
  }

  const allowedHosts = new Set<string>();
  if (requestHost) allowedHosts.add(requestHost);

  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (configuredAppUrl) {
    try {
      allowedHosts.add(new URL(configuredAppUrl).host);
    } catch {
      // Ignore an invalid NEXT_PUBLIC_APP_URL configuration.
    }
  }

  if (!allowedHosts.has(sourceHost)) {
    return csrfRejection();
  }

  return NextResponse.next();
}

function csrfRejection() {
  return NextResponse.json(
    { error: "Cross-origin request blocked" },
    { status: 403 },
  );
}

export const config = {
  matcher: ["/api/:path*"],
};
