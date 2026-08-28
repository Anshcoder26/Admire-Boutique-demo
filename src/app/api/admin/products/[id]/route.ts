import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, deleteProductById } from "@/lib/db";

async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  if (!token) return null;
  return await validateSessionToken(token);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized - Admin token required" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteProductById(id);

  if (!deleted) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, deletedId: id });
}
