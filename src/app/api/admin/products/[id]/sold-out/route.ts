import { NextRequest, NextResponse } from "next/server";
import { setProductSoldOutStatus, validateSessionToken } from "@/lib/db";

async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  if (!token) return null;
  return await validateSessionToken(token);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized - Admin token required" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { isSoldOut?: boolean };

  if (typeof body.isSoldOut !== "boolean") {
    return NextResponse.json({ error: "isSoldOut must be a boolean" }, { status: 400 });
  }

  const product = await setProductSoldOutStatus(id, body.isSoldOut);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    product,
  });
}
