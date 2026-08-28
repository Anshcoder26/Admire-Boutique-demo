import { NextResponse } from "next/server";
import { listRecentAdminOrders, validateSessionToken, getDb } from "@/lib/db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  const user = token ? await validateSessionToken(token) : null;

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
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  const user = token ? await validateSessionToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { orderId, status, paymentStatus } = body;

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  const db = getDb();
  
  // Check if order exists
  const checkStmt = db.prepare("SELECT id FROM orders WHERE id = ?");
  const exists = checkStmt.get(orderId);
  if (!exists) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Update order status and/or payment status
  let updateQuery = "UPDATE orders SET ";
  const params: any[] = [];
  const updates: string[] = [];

  if (status) {
    updates.push("status = ?");
    params.push(status);
  }

  if (paymentStatus) {
    updates.push("payment_status = ?");
    params.push(paymentStatus);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  updateQuery += updates.join(", ") + " WHERE id = ?";
  params.push(orderId);

  const updateStmt = db.prepare(updateQuery);
  updateStmt.run(...params);

  return NextResponse.json({ success: true, orderId });
}
