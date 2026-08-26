import { NextResponse } from "next/server";
import { getCatalogProducts, saveCatalogProducts } from "@/lib/catalog-store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await getCatalogProducts();
  const product = products.find((item) => item.id === id || item.slug === id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await getCatalogProducts();
  const filtered = products.filter((item) => item.id !== id && item.slug !== id);

  if (filtered.length === products.length) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await saveCatalogProducts(filtered);
  return NextResponse.json({ success: true, deletedId: id });
}
