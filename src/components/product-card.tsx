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
    <article className="group overflow-hidden rounded-[28px] border border-[rgba(76,54,42,0.08)] bg-white shadow-[0_12px_36px_rgba(84,58,45,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(84,58,45,0.12)]">
      <div className="relative overflow-hidden rounded-t-[28px]">
        <Link href={`/products/${product.slug}`} className="block">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={800}
            height={980}
            className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <button
          aria-label={`Add ${product.name} to wishlist`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#4f2d2b] shadow-md backdrop-blur-sm transition hover:scale-105"
        >
          <Heart className="h-4 w-4" />
        </button>
        {product.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#f2e8de] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6c3a2a]">
            {product.badge}
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">{product.category}</p>
          <div className="flex items-center gap-1 text-[#b4872b]">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-medium text-[#5d463d]">{product.rating}</span>
          </div>
        </div>

        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-lg font-medium leading-tight text-[#231712]">{product.name}</h3>
        </Link>

        <div className="flex items-end gap-2">
          <span className="text-xl font-semibold text-[#2a1d1a]">₹{product.price}</span>
          <span className="text-sm text-[#8a7b71] line-through">₹{product.originalPrice}</span>
          <span className="text-xs font-semibold text-[#b65d3c]">({product.discount}% off)</span>
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#4b1f1d] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#341514]"
        >
          <ShoppingBag className="h-4 w-4" />
          Quick add
        </button>
      </div>
    </article>
  );
}
