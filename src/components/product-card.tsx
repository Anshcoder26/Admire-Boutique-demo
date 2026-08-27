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
     <article className="group overflow-hidden rounded-[28px] border-2 border-[#7D1D1D]/40 bg-white/95 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-[#7D1D1D]/60 backdrop-blur-sm cursor-pointer h-full flex flex-col relative hover:shadow-2xl">
       {/* Animated lotus motifs */}
       <div className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-40 animate-float transition-opacity duration-300">
         <svg viewBox="0 0 60 60" className="h-full w-full">
           <path d="M30 10 C 40 15, 45 25, 45 35 C 40 40, 35 41, 30 37 C 25 41, 20 40, 15 35 C 15 25, 20 15, 30 10 Z" fill="none" stroke="#7D1D1D" strokeWidth="1.5" opacity="0.6" />
           <circle cx="30" cy="30" r="4" fill="#D4AF37" opacity="0.7" />
         </svg>
       </div>
       <div className="absolute bottom-2 left-2 h-8 w-8 opacity-0 group-hover:opacity-40 animate-float transition-opacity duration-300" style={{ animationDelay: "0.3s" }}>
         <svg viewBox="0 0 60 60" className="h-full w-full">
           <path d="M30 10 C 40 15, 45 25, 45 35 C 40 40, 35 41, 30 37 C 25 41, 20 40, 15 35 C 15 25, 20 15, 30 10 Z" fill="none" stroke="#8B7355" strokeWidth="1.5" opacity="0.6" />
           <circle cx="30" cy="30" r="4" fill="#D4AF37" opacity="0.7" />
         </svg>
       </div>
        
       {/* Ornamental corner accent */}
       <div className="absolute top-0 right-0 h-12 w-12 border-t-2 border-r-2 border-[#8B7355]/30 rounded-bl-3xl group-hover:border-[#7D1D1D]/50 transition-colors" />
       <div className="absolute bottom-0 left-0 h-12 w-12 border-b-2 border-l-2 border-[#8B7355]/30 rounded-tr-3xl group-hover:border-[#D4AF37]/50 transition-colors" />
        
       <div className="relative overflow-hidden rounded-t-[28px] bg-gradient-to-br from-[#fff5f0] to-[#f5e8f5]">
         {/* Subtle gradient overlay */}
         <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#7D1D1D]/0 via-transparent to-[#8B7355]/0 transition-all duration-300 group-hover:from-[#7D1D1D]/8 group-hover:to-[#8B7355]/8" />
          
         <div className="block relative overflow-hidden">
           <Image
             src={product.images?.[0] || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"}
             alt={product.name}
             width={800}
             height={980}
             className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-110"
           />
         </div>
         <button
           onClick={(e) => {
             e.stopPropagation();
             e.preventDefault();
           }}
           aria-label={`Add ${product.name} to wishlist`}
           className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#7D1D1D] shadow-md backdrop-blur-sm transition-all hover:scale-125 hover:shadow-xl border border-[#7D1D1D]/30 group-hover:border-[#7D1D1D]/60 hover:bg-white hover:animate-pulse-subtle"
         >
           <Heart className="h-5 w-5 fill-current" />
         </button>
         {product.badge ? (
           <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[#7D1D1D] to-[#D4AF37] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-md border border-[#7D1D1D]/40 animate-shimmer">
             {product.badge}
           </span>
         ) : null}
       </div>

       <div className="space-y-4 p-5 flex-1 flex flex-col border-t border-[#7D1D1D]/15 relative">
         {/* Subtle corner ornament */}
         <div className="absolute top-2 right-2 w-6 h-6 opacity-20">
           <svg viewBox="0 0 60 60" className="h-full w-full">
             <path d="M30 10 C 35 13, 38 18, 40 25 C 35 28, 30 28, 30 25 C 30 28, 25 28, 20 25 C 22 18, 25 13, 30 10 Z" fill="none" stroke="#7D1D1D" strokeWidth="1" />
             <circle cx="30" cy="30" r="2" fill="#D4AF37" />
           </svg>
         </div>
          
         <div className="flex items-center justify-between gap-2">
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B7355]">{product.category}</p>
           <div className="flex items-center gap-1 text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-full hover:bg-[#D4AF37]/20 transition-colors">
             <Star className="h-3.5 w-3.5 fill-current animate-spin-slow" />
             <span className="text-xs font-bold">{product.rating}</span>
           </div>
         </div>

         <div className="block group/link flex-1">
           <h3 className="text-lg font-bold leading-tight text-[#1a1612] group-hover/link:text-[#7D1D1D] transition-colors duration-300">{product.name}</h3>
         </div>

         <div className="flex items-end gap-2 border-t border-[#7D1D1D]/15 pt-3">
           <span className="text-2xl font-bold text-[#7D1D1D]">₹{product.price}</span>
           <span className="text-sm text-[#999] line-through">₹{product.originalPrice}</span>
           <span className="text-xs font-bold text-[#8B7355]">({product.discount}% off)</span>
         </div>

         <button
           type="button"
           onClick={(e) => {
             e.stopPropagation();
             e.preventDefault();
             handleQuickAdd();
           }}
           className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#7D1D1D]/30 bg-gradient-to-r from-[#7D1D1D] to-[#8B7355] px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-110 hover:animate-subtle-pulse hover:shadow-xl active:scale-95 md:min-h-[44px] md:py-3"
         >
           <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
           Quick Add
         </button>
       </div>
     </article>
   </Link>
  );
}
