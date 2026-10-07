import type { NextResponse } from "next/server";
import { destroySession } from "@/lib/db";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export const SITE_SESSION_COOKIE = "admire-session";
const AUTH_COOKIES = [SITE_SESSION_COOKIE, "admire-refresh", "user-type", ADMIN_SESSION_COOKIE];

function readCookie(request: Request, name: string): string {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

/**
 * Signs the browser out everywhere. The storefront and the owner dashboard use
 * separate cookies, so revoking only one of them left the other session alive.
 */
export async function endAllSessions(request: Request, response: NextResponse) {
  const tokens = new Set(
    [SITE_SESSION_COOKIE, ADMIN_SESSION_COOKIE].map((name) => readCookie(request, name)).filter(Boolean)
  );
  await Promise.all([...tokens].map((token) => destroySession(token)));

  for (const name of AUTH_COOKIES) {
    response.cookies.delete(name);
  }
}
