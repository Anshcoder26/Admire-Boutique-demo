import { NextRequest, NextResponse } from "next/server";
import { getAdminProductById, updateProductById, deleteProductById } from "@/lib/db";
import { authenticateAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized - Admin token required" }, { status: 401 });
  }

  const { id } = await params;
  const product = await getAdminProductById(id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized - Admin token required" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, category, price, stock, fabric, description, images, colors, stitchType } = body;

  if (!name || !price) {
    return NextResponse.json(
      { error: "Product name and price are required" },
      { status: 400 }
    );
  }

  const updated = await updateProductById(id, {
    name,
    category,
    price: Number(price),
    stock: Number(stock) || 0,
    fabric,
    description,
    images,
    colors,
    stitchType,
  });

  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, productId: id });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await authenticateAdmin(request);
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
