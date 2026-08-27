import { NextRequest, NextResponse } from "next/server";
import { listCustomerOrders, validateUserSessionToken } from "@/lib/db";

async function getUserFromRequest(request: Request) {
  // Try Authorization header first
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  if (token) {
    return await validateUserSessionToken(token);
  }
  
  // Fall back to HTTP-only cookie
  const nextRequest = request as NextRequest;
  const cookieToken = nextRequest.cookies.get("admire-session")?.value || "";
  if (cookieToken) {
    return await validateUserSessionToken(cookieToken);
  }
  
  return null;
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ success: true, orders: await listCustomerOrders(user.id) });
}
