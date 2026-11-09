import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/admin-auth";
import { ADMIN_ORDER_LIST_LIMIT, listAllAdminOrders } from "@/lib/db";
import { sweepExpiredOrders } from "@/lib/payments";

/** Every order, newest first, with what to ship and where, for the owner's Orders tab. */
export async function GET(request: Request) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await sweepExpiredOrders();
  const orders = await listAllAdminOrders();
  return NextResponse.json({ success: true, orders, truncated: orders.length >= ADMIN_ORDER_LIST_LIMIT });
}
