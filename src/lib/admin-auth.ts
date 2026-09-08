import { validateSessionToken, type AdminUserRecord } from "@/lib/db";

export const ADMIN_SESSION_COOKIE = "admire-admin-session";

function readCookie(request: Request, name: string): string {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

/**
 * Authenticate an admin request. Prefers the httpOnly admin session cookie
 * (not exposed to JS, safe from XSS) and falls back to the Authorization
 * Bearer header for backward compatibility.
 */
export async function authenticateAdmin(request: Request): Promise<AdminUserRecord | null> {
  const cookieToken = readCookie(request, ADMIN_SESSION_COOKIE);
  if (cookieToken) {
    const user = await validateSessionToken(cookieToken);
    if (user) return user;
  }

  const authHeader = request.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (bearer) {
    return validateSessionToken(bearer);
  }

  return null;
}
