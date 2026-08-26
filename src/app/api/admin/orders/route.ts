import { NextResponse } from "next/server";
import { listRecentAdminOrders, validateSessionToken } from "@/lib/db";

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
