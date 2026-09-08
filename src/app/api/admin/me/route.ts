import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const user = await authenticateAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Session invalid" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email },
  });
}
