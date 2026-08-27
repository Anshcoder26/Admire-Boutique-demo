"use client";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

interface WishlistHeartProps {
  productId: string;
  className?: string;
}

export function WishlistHeart({ productId, className = "" }: WishlistHeartProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const wishlist = JSON.parse(localStorage.getItem("admire_wishlist") || "[]");
    setIsWishlisted(wishlist.includes(productId));
  }, [productId]);

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("admire_wishlist") || "[]");
    
    if (isWishlisted) {
      const updated = wishlist.filter((id: string) => id !== productId);
      localStorage.setItem("admire_wishlist", JSON.stringify(updated));
    } else {
      wishlist.push(productId);
      localStorage.setItem("admire_wishlist", JSON.stringify(wishlist));
    }
    
    setIsWishlisted(!isWishlisted);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleWishlist}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`p-2 rounded-full transition-all ${
        isWishlisted
          ? "bg-[#7D1D1D]/10 text-[#7D1D1D]"
          : "bg-white/50 text-[#8a6f5f] hover:bg-white hover:text-[#7D1D1D]"
      } ${className}`}
    >
      <Heart
        className="h-5 w-5"
        fill={isWishlisted ? "currentColor" : "none"}
        strokeWidth={2}
      />
    </button>
  );
}
