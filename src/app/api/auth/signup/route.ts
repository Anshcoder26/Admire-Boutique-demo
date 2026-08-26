import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createCustomer, storeUserSessionToken } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const password = String(body.password || "").trim();

  if (!name || !email || !phone || !password) {
    return NextResponse.json({ error: "Name, email, phone and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
  }

  const user = await createCustomer({ name, email, phone, password });
  if (!user) {
    return NextResponse.json({ error: "Account already exists with this email" }, { status: 409 });
  }

  const token = crypto.randomBytes(24).toString("hex");
  storeUserSessionToken(token, email);

  return NextResponse.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  });
}
