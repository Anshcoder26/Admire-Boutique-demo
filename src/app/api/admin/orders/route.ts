import { NextResponse } from "next/server";
import { listRecentAdminOrders, updateAdminOrder } from "@/lib/db";
import { authenticateAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const user = await authenticateAdmin(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await listRecentAdminOrders();

  return NextResponse.json({
    success: true,
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

  const updated = await updateAdminOrder(orderId, { status, paymentStatus });
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, orderId });
}
