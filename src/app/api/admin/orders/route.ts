import { NextResponse } from "next/server";
import { getAdminStats, getOrderById, listRecentAdminOrders, updateAdminOrder } from "@/lib/db";
import { validateAdminOrderUpdate } from "@/lib/order-status";
import { authenticateAdmin } from "@/lib/admin-auth";
import { sweepExpiredOrders } from "@/lib/payments";

export async function GET(request: Request) {
  const user = await authenticateAdmin(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await sweepExpiredOrders();
  const [rows, stats] = await Promise.all([listRecentAdminOrders(), getAdminStats()]);

  return NextResponse.json({
    success: true,
    stats,
    orders: rows.map((row) => ({
      ...row,
      total: Number(row.total),
      created_at: row.created_at,
    })),
  });
}

export async function PUT(request: Request) {
  const user = await authenticateAdmin(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { orderId, status, paymentStatus } = body;

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  if (!status && !paymentStatus) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const invalid = validateAdminOrderUpdate(String(order.status ?? ""), { status, paymentStatus });
  if (invalid) {
    return NextResponse.json({ error: invalid.error }, { status: invalid.status });
  }

  const updated = await updateAdminOrder(orderId, { status, paymentStatus });
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, orderId });
}
