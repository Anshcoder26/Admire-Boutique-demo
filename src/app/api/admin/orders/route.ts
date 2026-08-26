import { NextResponse } from "next/server";
import { getDb, validateSessionToken } from "@/lib/db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  const user = token ? validateSessionToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = getDb().prepare(`
    SELECT o.id, o.order_number, o.status, o.total, o.payment_status, o.payment_method, o.created_at, c.name AS customer_name
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    ORDER BY o.created_at DESC
    LIMIT 5
  `).all() as Array<{ id: string; order_number: string; status: string; total: number; payment_status: string; payment_method: string; created_at: string; customer_name: string }>;

  return NextResponse.json({
    success: true,
    orders: rows.map((row) => ({
      ...row,
      total: Number(row.total),
      created_at: row.created_at,
    })),
  });
}
