"use client";

import { useEffect, useState } from "react";
import { LotusOrnament } from "@/components/lotus-ornament";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductGrid } from "@/components/product-grid";
import { products } from "@/data/products";
import type { Product } from "@/data/products";

export function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const wishlistIds = JSON.parse(localStorage.getItem("admire_wishlist") || "[]");
    console.log("Wishlist IDs from localStorage:", wishlistIds);
    
    if (wishlistIds.length > 0) {
      const filtered = products.filter((p: Product) => 
        wishlistIds.includes(p.id)
      );
      console.log("Filtered wishlist products:", filtered.length, filtered);
      setWishlistProducts(filtered);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 flex items-center gap-3">
        <LotusOrnament className="h-11 w-11 rounded-full border border-[#d7c1af] bg-white/80 p-2" />
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Saved items</p>
          <h1 className="mt-1 font-serif text-4xl text-[#201614]">Your Wishlist</h1>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="rounded-[30px] border border-[#eadcd3] bg-[#fffaf6] p-8 text-center shadow-[0_14px_32px_rgba(84,58,45,0.05)]">
          <Heart className="mx-auto mb-4 h-12 w-12 text-[#8a6f5f]/50" />
          <p className="mb-4 text-lg font-medium text-[#201614]">No items in your wishlist yet.</p>
          <p className="mb-6 text-sm text-[#584942]">Click the heart icon on products to save them here.</p>
          <Link href="/products" className="inline-flex rounded-full bg-[#4b1f1d] px-5 py-3 text-sm font-medium text-white">
            Continue shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div>
          <p className="mb-6 text-sm text-[#584942]">
            You have <strong>{wishlistProducts.length}</strong> item{wishlistProducts.length !== 1 ? 's' : ''} saved
          </p>
          <ProductGrid products={wishlistProducts} />
        </div>
      )}
    </div>
  );
}
