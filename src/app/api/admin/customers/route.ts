import { NextResponse } from "next/server";
import { validateSessionToken, getDb } from "@/lib/db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  const user = token ? await validateSessionToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  
  // Get customers
  const customersStmt = db.prepare(`
    SELECT id, email, name, phone, created_at 
    FROM customers 
    ORDER BY created_at DESC 
    LIMIT 500
  `);
  const customers = customersStmt.all() as any[];
  
  // Get newsletter subscribers
  const subscribersStmt = db.prepare(`
    SELECT email, subscribed_at 
    FROM newsletter_subscribers 
    ORDER BY subscribed_at DESC 
    LIMIT 500
  `);
  const subscribers = subscribersStmt.all() as any[];

  return NextResponse.json({
    success: true,
    customers: customers.map(c => ({
      ...c,
      totalOrders: (db.prepare("SELECT COUNT(*) as count FROM orders WHERE customer_id = ?").get(c.id) as { count: number }).count,
    })),
    subscribers,
  });
}
