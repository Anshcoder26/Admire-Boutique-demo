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
      <article className="group overflow-hidden rounded-[28px] border-2 border-[#c94a6a]/40 bg-white/95 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#c94a6a]/60 backdrop-blur-sm cursor-pointer h-full flex flex-col relative">
        {/* Ornamental corner accent */}
        <div className="absolute top-0 right-0 h-12 w-12 border-t-2 border-r-2 border-[#6f2fbf]/30 rounded-bl-3xl" />
        <div className="absolute bottom-0 left-0 h-12 w-12 border-b-2 border-l-2 border-[#00a8cc]/30 rounded-tr-3xl" />
        
        <div className="relative overflow-hidden rounded-t-[28px] bg-gradient-to-br from-[#fff5f0] to-[#f5e8f5]">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#c94a6a]/0 via-transparent to-[#6f2fbf]/0 group-hover:from-[#c94a6a]/5 group-hover:to-[#6f2fbf]/5 transition-all duration-300 z-10" />
          
          <div className="block relative overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              width={800}
              height={980}
              className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            aria-label={`Add ${product.name} to wishlist`}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#c94a6a] shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:shadow-lg border border-[#c94a6a]/30 group-hover:border-[#c94a6a]/60 hover:bg-white"
          >
            <Heart className="h-5 w-5 fill-current" />
          </button>
          {product.badge ? (
            <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[#c94a6a] to-[#e6a86a] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-md border border-[#c94a6a]/40">
              {product.badge}
            </span>
          ) : null}
        </div>

        <div className="space-y-4 p-5 flex-1 flex flex-col border-t border-[#c94a6a]/15">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6f2fbf]">{product.category}</p>
            <div className="flex items-center gap-1 text-[#e6a86a] bg-[#e6a86a]/10 px-2 py-1 rounded-full">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-bold">{product.rating}</span>
            </div>
          </div>

          <div className="block group/link flex-1">
            <h3 className="text-lg font-bold leading-tight text-[#1a1612] group-hover/link:text-[#c94a6a] transition-colors">{product.name}</h3>
          </div>

          <div className="flex items-end gap-2 border-t border-[#c94a6a]/15 pt-3">
            <span className="text-2xl font-bold text-[#c94a6a]">₹{product.price}</span>
            <span className="text-sm text-[#999] line-through">₹{product.originalPrice}</span>
            <span className="text-xs font-bold text-[#6f2fbf]">({product.discount}% off)</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleQuickAdd();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c94a6a] px-4 py-3.5 md:py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95 border border-[#c94a6a]/30 min-h-[48px] md:min-h-[44px]"
          >
            <ShoppingBag className="h-5 w-5" />
            Quick Add
          </button>
        </div>
      </article>
    </Link>
  );
}
