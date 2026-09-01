"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { WishlistHeart } from "@/components/wishlist-heart";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const isSoldOut = Boolean(product.isSoldOut) || Number(product.stock) <= 0;

  const handleQuickAdd = () => {
    if (typeof window === "undefined") return;
    if (isSoldOut) {
      window.alert(`${product.name} is currently sold out.`);
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
    window.alert(`${product.name} added to cart.`);
  };

  return (
    <Link href={`/products/${product.slug}`}>
     <article className="group overflow-hidden rounded-[28px] border border-[#7D1D1D]/12 bg-white shadow-[0_10px_30px_rgba(86,65,55,0.06)] hover:shadow-[0_18px_40px_rgba(86,65,55,0.12)] transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col relative">
       <div className="relative overflow-hidden rounded-t-[28px] bg-[#f7efe8]">
         <div className="block relative overflow-hidden">
           <Image
             src={product.images?.[0] || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"}
             alt={product.name}
             width={800}
             height={980}
             className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
           />
         </div>
         <WishlistHeart
           productId={product.id}
         />
         {isSoldOut ? (
           <span className="absolute left-3 top-3 rounded-full bg-[#8a1f1f] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-md">
             Sold Out
           </span>
         ) : product.badge ? (
           <span className="absolute left-3 top-3 rounded-full bg-[#7D1D1D] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-md">
             {product.badge}
           </span>
         ) : null}
       </div>

       <div className="space-y-4 p-5 flex-1 flex flex-col border-t border-[#7D1D1D]/10 relative">
         <div className="flex items-center justify-between gap-2">
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B7355]">{product.category}</p>
           <div className="flex items-center gap-1 text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-full">
             <Star className="h-3.5 w-3.5 fill-current" />
             <span className="text-xs font-bold">{product.rating}</span>
           </div>
         </div>

         <div className="block group/link flex-1">
           <h3 className="text-lg font-bold leading-tight text-[#1a1612] group-hover/link:text-[#7D1D1D] transition-colors duration-300">{product.name}</h3>
         </div>

         <div className="flex items-end gap-2 border-t border-[#7D1D1D]/10 pt-3">
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
           disabled={isSoldOut}
           className={`flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full border px-4 py-3.5 text-sm font-bold shadow-sm transition-all md:min-h-[44px] md:py-3 ${
             isSoldOut
               ? "cursor-not-allowed border-[#c8b8b1] bg-[#e4dbd7] text-[#7d6f69]"
               : "border-[#7D1D1D] bg-[#7D1D1D] text-white hover:bg-[#6a1818] active:scale-[0.98]"
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
