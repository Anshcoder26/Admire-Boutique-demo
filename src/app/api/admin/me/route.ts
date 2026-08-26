import { NextResponse } from "next/server";
import { validateSessionToken } from "@/lib/db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const user = await validateSessionToken(token);
  if (!user) {
    return NextResponse.json({ error: "Session invalid" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email },
  });
}
