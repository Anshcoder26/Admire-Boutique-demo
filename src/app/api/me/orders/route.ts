import { NextResponse } from "next/server";
import { listCustomerOrders, validateUserSessionToken } from "@/lib/db";

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  if (!token) return null;
  return validateUserSessionToken(token);
}

export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ success: true, orders: listCustomerOrders(user.id) });
}
