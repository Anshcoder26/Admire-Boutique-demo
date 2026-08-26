import { NextResponse } from "next/server";
import { listCustomerOrders, validateUserSessionToken } from "@/lib/db";

async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  if (!token) return null;
  return await validateUserSessionToken(token);
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ success: true, orders: await listCustomerOrders(user.id) });
}
