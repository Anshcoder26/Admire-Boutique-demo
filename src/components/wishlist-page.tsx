"use client";

import { useEffect, useState } from "react";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductGrid } from "@/components/product-grid";
import { products } from "@/data/products";
import type { Product } from "@/data/products";
import { STORAGE_KEYS, readJSON } from "@/lib/storage";

export function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const wishlistIds = readJSON<string[]>(STORAGE_KEYS.wishlist, []);

    if (wishlistIds.length > 0) {
      const filtered = products.filter((p: Product) => wishlistIds.includes(p.id));
      setWishlistProducts(filtered);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 flex items-center gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]">Saved items</p>
          <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight text-[var(--ink)]">Your Wishlist</h1>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-8 text-center shadow-[var(--shadow-sm)]">
          <Heart className="mx-auto mb-4 h-12 w-12 text-[#7D1D1D]/50" />
          <p className="mb-4 text-lg font-medium text-[var(--ink)]">No items in your wishlist yet.</p>
          <p className="mb-6 text-sm text-[var(--ink)]/70">Click the heart icon on products to save them here.</p>
          <Link href="/products" className="inline-flex min-h-[44px] items-center rounded-md bg-[#7D1D1D] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#641414]">
            Continue shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div>
          <p className="mb-6 text-sm text-[var(--ink)]/70">
            You have <strong>{wishlistProducts.length}</strong> item{wishlistProducts.length !== 1 ? 's' : ''} saved
          </p>
          <ProductGrid products={wishlistProducts} />
        </div>
      )}
    </div>
  );
}
