import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { storeUserSessionToken, verifyCustomerCredentials } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = verifyCustomerCredentials(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = crypto.randomBytes(24).toString("hex");
  storeUserSessionToken(token, email);

  return NextResponse.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  });
}
