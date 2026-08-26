import { NextResponse } from "next/server";
import type { Product } from "@/data/products";
import { getCatalogProducts, saveCatalogProducts } from "@/lib/catalog-store";

export async function GET() {
  const products = await getCatalogProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Product> & { images?: string[] | string; colors?: Array<{ name: string; hex: string }>; sizes?: string[] };

  const name = String(body.name || "").trim();
  const category = String(body.category || "Cotton Kurtis").trim();
  const price = Number(body.price || 0);
  const stock = Number(body.stock || 0);

  if (!name || !Number.isFinite(price) || !Number.isFinite(stock)) {
    return NextResponse.json({ error: "Invalid product payload" }, { status: 400 });
  }

  const products = await getCatalogProducts();
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `product-${Date.now()}`;

  const rawImages = body.images as unknown;
  const imageList = Array.isArray(rawImages)
    ? rawImages.map((url) => String(url).trim()).filter(Boolean)
    : typeof rawImages === "string"
      ? rawImages.split(",").map((url: string) => url.trim()).filter(Boolean)
      : [
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
        ];

  const originalPrice = Math.round(price * 1.35);
  const created: Product = {
    id: `prod-${Date.now()}`,
    slug,
    name,
    category,
    price,
    originalPrice,
    discount: Math.min(40, Math.max(10, Math.round(((originalPrice - price) / originalPrice) * 100))),
    rating: 4.8,
    reviews: 0,
    stock,
    badge: "New",
    fabric: String(body.fabric || "Cotton"),
    description: String(body.description || "Newly added premium kurti from the Admire Boutique collection."),
    images: imageList.length ? imageList : [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    ],
    colors: Array.isArray(body.colors) && body.colors.length ? body.colors : [{ name: "Terracotta", hex: "#c06a4f" }],
    sizes: Array.isArray(body.sizes) && body.sizes.length ? body.sizes : ["XS", "S", "M", "L", "XL"],
  };

  await saveCatalogProducts([created, ...products]);

  return NextResponse.json({ success: true, product: created }, { status: 201 });
}
