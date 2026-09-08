import { NextResponse } from "next/server";
import { destroySession } from "@/lib/db";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function readCookie(request: Request, name: string): string {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

export async function POST(request: Request) {
  const token = readCookie(request, ADMIN_SESSION_COOKIE);
  if (token) {
    await destroySession(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
