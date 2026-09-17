import { NextResponse } from "next/server";
import type { Product } from "@/data/products";
import { getCatalogProducts, addCatalogProduct } from "@/lib/catalog-store";
import { authenticateAdmin } from "@/lib/admin-auth";

export async function GET() {
  const products = await getCatalogProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized - Admin token required" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<Product> & { images?: string[] | string; colors?: Array<{ name: string; hex: string }>; sizes?: string[]; stitchType?: string };

  const name = String(body.name || "").trim();
  const category = String(body.category || "Premium Cotton").trim();
  const price = Number(body.price || 0);
  const stock = Number(body.stock || 0);

  if (!name || !Number.isFinite(price) || price <= 0 || !Number.isFinite(stock) || stock < 0) {
    return NextResponse.json({ error: "Invalid product payload" }, { status: 400 });
  }

  const rawImages = body.images as unknown;
  const imageList = Array.isArray(rawImages)
    ? rawImages.map((url) => String(url).trim()).filter(Boolean)
    : typeof rawImages === "string"
      ? rawImages.split(",").map((url: string) => url.trim()).filter(Boolean)
      : [];

  const created = await addCatalogProduct({
    name,
    category,
    price,
    stock,
    fabric: String(body.fabric || "Cotton"),
    description: body.description ? String(body.description) : undefined,
    badge: "New",
    images: imageList.length ? imageList : undefined,
    colors: Array.isArray(body.colors) && body.colors.length ? body.colors : undefined,
    sizes: Array.isArray(body.sizes) && body.sizes.length ? body.sizes : undefined,
    stitchType: body.stitchType === "Stitched" || body.stitchType === "Unstitched" ? body.stitchType : undefined,
  });

  return NextResponse.json({ success: true, product: created }, { status: 201 });
}
