"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { WishlistHeart } from "@/components/wishlist-heart";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const isSoldOut = Boolean(product.isSoldOut) || Number(product.stock) <= 0;
  const toast = useToast();

  const handleQuickAdd = () => {
    if (typeof window === "undefined") return;
    if (isSoldOut) {
      toast.error(`${product.name} is currently sold out.`);
      return;
    }

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
      (entry: { productId: string; color: string; size: string }) =>
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
    toast.success(`${product.name} added to cart.`);
  };

  return (
    <Link href={`/products/${product.slug}`}>
     <article className="group overflow-hidden rounded-lg border border-[var(--ink)]/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#7D1D1D]/30 hover:shadow-[var(--shadow-md)] cursor-pointer h-full flex flex-col relative">
       <div className="relative overflow-hidden rounded-t-lg bg-[#f5f1ec]">
         <div className="block relative overflow-hidden">
           <Image
             src={product.images?.[0] || "https://images.unsplash.com/photo-1759840278862-ef629e9b0f64?auto=format&fit=crop&w=900&q=80"}
             alt={product.name}
             width={800}
             height={980}
             className="h-60 md:h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
           />
         </div>
         <WishlistHeart
           productId={product.id}
         />
         {isSoldOut ? (
           <Badge tone="soldout" className="absolute left-3 top-3">Sold Out</Badge>
         ) : product.badge ? (
           <Badge tone="maroon" className="absolute left-3 top-3">{product.badge}</Badge>
         ) : null}
       </div>

       <div className="space-y-4 p-5 flex-1 flex flex-col relative">
         <div className="flex items-center justify-between gap-2">
           <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ink)]/50">{product.category}</p>
           <div className="flex items-center gap-1 text-[#7D1D1D]">
             <Star className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" />
             <span className="text-xs font-bold">{product.rating}</span>
           </div>
         </div>

         <div className="block group/link flex-1">
           <h3 className="font-serif text-lg font-semibold leading-tight text-[var(--ink)] group-hover/link:text-[#7D1D1D] transition-colors duration-300">{product.name}</h3>
         </div>

         <div className="flex items-end gap-2">
           <span className="text-2xl font-bold text-[var(--ink)]">₹{product.price}</span>
           <span className="text-sm text-[var(--ink)]/40 line-through">₹{product.originalPrice}</span>
           <span className="text-xs font-semibold text-[#7D1D1D]">({product.discount}% off)</span>
         </div>

         <button
           type="button"
           onClick={(e) => {
             e.stopPropagation();
             e.preventDefault();
             handleQuickAdd();
           }}
           disabled={isSoldOut}
           className={`flex w-full min-h-[48px] items-center justify-center gap-2 rounded-md px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] transition-all md:min-h-[44px] md:py-3 ${
             isSoldOut
               ? "cursor-not-allowed bg-[#e4dbd7] text-[#7d6f69]"
               : "bg-[#7D1D1D] text-white hover:bg-[#641414] active:scale-[0.98]"
           }`}
         >
           <ShoppingBag className="h-5 w-5" />
           {isSoldOut ? "Sold Out" : "Quick Add"}
         </button>
       </div>
     </article>
   </Link>
  );
}
