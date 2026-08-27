"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const handleQuickAdd = () => {
    if (typeof window === "undefined") return;

    const cart = JSON.parse(window.localStorage.getItem("admire-cart") || "[]");
    const item = {
      productId: product.id,
      name: product.name,
      color: product.colors?.[0]?.name || "Default",
      size: product.sizes?.[2] || product.sizes?.[0] || "M",
      variant: `${product.colors?.[0]?.name || "Default"} / ${product.sizes?.[2] || product.sizes?.[0] || "M"}`,
      image: product.images?.[0] || "",
      price: Number(product.price),
      quantity: 1,
    };

    const existingIndex = cart.findIndex(
      (entry: any) =>
        entry.productId === product.id &&
        entry.color === item.color &&
        entry.size === item.size,
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(item);
    }

    window.localStorage.setItem("admire-cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("admire-cart-updated"));
    window.alert(`${product.name} added to cart.`);
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <article className="group overflow-hidden rounded-[28px] border border-[#d81e8f]/20 bg-white/95 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-[#d81e8f]/50 backdrop-blur-sm cursor-pointer h-full flex flex-col">
        <div className="relative overflow-hidden rounded-t-[28px] bg-gradient-to-br from-[#fff5f0] to-[#f5e8f5]">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#d81e8f]/0 via-transparent to-[#6f2fbf]/0 group-hover:from-[#d81e8f]/10 group-hover:to-[#6f2fbf]/10 transition-all duration-300 z-10" />
          
          <div className="block relative overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              width={800}
              height={980}
              className="h-72 w-full object-cover transition duration-500 group-hover:scale-110"
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            aria-label={`Add ${product.name} to wishlist`}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#fff5f0] to-[#f5e8f5] text-[#d81e8f] shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:shadow-xl border border-[#d81e8f]/30 group-hover:border-[#d81e8f]/60"
          >
            <Heart className="h-5 w-5 fill-current" />
          </button>
          {product.badge ? (
            <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[#d81e8f] to-[#f4a500] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-lg">
              {product.badge}
            </span>
          ) : null}
        </div>

        <div className="space-y-4 p-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6f2fbf]">{product.category}</p>
            <div className="flex items-center gap-1 text-[#f4a500]">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-bold text-[#f4a500]">{product.rating}</span>
            </div>
          </div>

          <div className="block group/link flex-1">
            <h3 className="text-lg font-bold leading-tight text-[#1a1612] group-hover/link:text-transparent group-hover/link:bg-clip-text group-hover/link:bg-gradient-to-r group-hover/link:from-[#d81e8f] group-hover/link:to-[#6f2fbf] transition-all">{product.name}</h3>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d81e8f] to-[#6f2fbf]">₹{product.price}</span>
            <span className="text-sm text-[#999] line-through">₹{product.originalPrice}</span>
            <span className="text-xs font-bold text-[#00a8cc]">({product.discount}% off)</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleQuickAdd();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d81e8f] to-[#a81566] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#d81e8f]/30 transition-all hover:shadow-xl hover:shadow-[#d81e8f]/50 hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="h-5 w-5" />
            Quick Add
          </button>
        </div>
      </article>
    </Link>
  );
}
