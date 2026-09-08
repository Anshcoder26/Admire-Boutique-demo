import { NextResponse } from "next/server";
import { listAdminCustomers } from "@/lib/db";
import { authenticateAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const user = await authenticateAdmin(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customers, subscribers } = await listAdminCustomers();

  return NextResponse.json({
    success: true,
    customers,
    subscribers,
  });
}
