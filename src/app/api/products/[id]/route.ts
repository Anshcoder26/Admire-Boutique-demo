import { NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/catalog-store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await getCatalogProducts();
  const product = products.find((item) => item.id === id || item.slug === id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// Product deletion is intentionally handled only by the protected admin route
// `/api/admin/products/[id]` (requires a valid admin token). Do not expose an
// unauthenticated DELETE here.
