import { NextResponse, after } from "next/server";
import { authenticateAdmin } from "@/lib/admin-auth";
import { codBalanceDue, codHoldDeadline, isCodHoldOver } from "@/lib/cod";
import { cancelPendingCodOrder, listPendingCodOrders, markCodAdvanceReceived } from "@/lib/db";
import { notifyCodAdvanceVerified } from "@/lib/notifications/cod-order";

export async function GET(request: Request) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await listPendingCodOrders();
  return NextResponse.json({
    success: true,
    orders: rows.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      createdAt: row.created_at,
      total: Number(row.total),
      advance: Number(row.cod_advance_amount),
      balance: codBalanceDue(Number(row.total), Number(row.cod_advance_amount)),
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      items: row.items,
      address: row.address,
      holdEndsAt: codHoldDeadline(row.created_at),
      holdOver: isCodHoldOver(row.created_at),
    })),
  });
}

export async function POST(request: Request) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { orderId?: unknown; action?: unknown; utr?: unknown };
  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  if (body.action === "advance_received") {
    const utr = typeof body.utr === "string" ? body.utr.trim() : "";
    if (!utr) {
      return NextResponse.json({ error: "Enter the UPI reference number from the screenshot" }, { status: 400 });
    }
    if (!(await markCodAdvanceReceived(orderId, utr))) {
      return NextResponse.json({ error: "This order is no longer waiting for its advance" }, { status: 409 });
    }
    after(() => notifyCodAdvanceVerified(orderId));
    return NextResponse.json({ success: true });
  }

  if (body.action === "cancel") {
    if (!(await cancelPendingCodOrder(orderId))) {
      return NextResponse.json({ error: "This order is no longer waiting for its advance" }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
