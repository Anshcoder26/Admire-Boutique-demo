import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkOrigin } from "@/lib/csrf";

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
  const result = checkOrigin({
    method: request.method,
    host: request.headers.get("host"),
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  });

  if (result === "reject") {
    return NextResponse.json(
      { error: "Cross-origin request blocked" },
      { status: 403 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
