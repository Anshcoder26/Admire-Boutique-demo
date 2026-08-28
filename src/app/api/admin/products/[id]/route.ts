import { NextRequest, NextResponse } from "next/server";
import { getDb, validateSessionToken, deleteProductById } from "@/lib/db";

async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  if (!token) return null;
  return await validateSessionToken(token);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized - Admin token required" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM products WHERE id = ?");
  const product = stmt.get(id) as any;

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminAuth(request);
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

  const db = getDb();
  
  // Check if product exists
  const checkStmt = db.prepare("SELECT id FROM products WHERE id = ?");
  const exists = checkStmt.get(id);
  if (!exists) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Update product
  const updateStmt = db.prepare(`
    UPDATE products SET 
      name = ?,
      category = ?,
      price = ?,
      stock = ?,
      fabric = ?,
      description = ?,
      images = ?,
      colors = ?,
      stitch_type = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  updateStmt.run(
    name,
    category || "Other",
    Number(price),
    Number(stock) || 0,
    fabric || "Cotton",
    description || "",
    JSON.stringify(images || []),
    JSON.stringify(colors || []),
    stitchType || "",
    id
  );

  return NextResponse.json({ success: true, productId: id });
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
