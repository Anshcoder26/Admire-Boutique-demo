"use client";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

interface WishlistHeartProps {
  productId: string;
  className?: string;
}

export function WishlistHeart({ productId }: WishlistHeartProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const wishlist = JSON.parse(localStorage.getItem("admire_wishlist") || "[]");
    setIsWishlisted(wishlist.includes(productId));
  }, [productId]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        zIndex: 50,
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        backgroundColor: isWishlisted ? "#7D1D1D" : "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        padding: "0",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.25)";
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <Heart
        size={22}
        style={{
          color: isWishlisted ? "#D4AF37" : "#7D1D1D",
          fill: isWishlisted ? "#D4AF37" : "none",
          strokeWidth: 2,
          transition: "all 0.2s ease",
        }}
      />
    </button>
  );
}
