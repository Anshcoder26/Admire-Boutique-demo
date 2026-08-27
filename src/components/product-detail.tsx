"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ProductGallery } from "@/components/product-gallery";
import type { Product } from "@/data/products";

export function ProductDetail({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [selectedSize, setSelectedSize] = useState(product.sizes[2] || product.sizes[0]);
  const [quantity, setQuantity] = useState(1);

  const addProductToCart = (redirectToCheckout = false) => {
    if (typeof window === "undefined") return;

    const cart = JSON.parse(window.localStorage.getItem("admire-cart") || "[]");
    const item = {
      productId: product.id,
      name: product.name,
      color: selectedColor,
      size: selectedSize,
      variant: `${selectedColor} / ${selectedSize}`,
      image: product.images[0],
      price: Number(product.price),
      quantity,
    };

    const existingIndex = cart.findIndex(
      (entry: any) =>
        entry.productId === product.id && entry.color === selectedColor && entry.size === selectedSize
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(item);
    }

    window.localStorage.setItem("admire-cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("admire-cart-updated"));

    if (redirectToCheckout) {
      window.location.href = "/checkout";
      return;
    }

    window.alert(`${product.name} added to cart.`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 md:px-8 lg:px-10">
      <div className="mb-8 flex items-center gap-2 text-sm font-bold text-[#6f2fbf]">
        <Link href="/" className="hover:text-[#d81e8f] transition">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#d81e8f] transition">Kurtis</Link>
        <span>/</span>
        <span className="text-[#d81e8f]">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery images={product.images} name={product.name} />

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <LotusOrnament className="h-14 w-14 rounded-full border-2 border-gradient-to-r from-[#d81e8f] to-[#6f2fbf] bg-gradient-to-br from-[#d81e8f]/10 to-[#6f2fbf]/10 p-3 animate-pulse" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#d81e8f]">✨ {product.category}</p>
              <h1 className="mt-2 font-serif text-5xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#d81e8f] to-[#6f2fbf] md:text-6xl">{product.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#f4a500]/10 to-[#ff6b35]/10 px-4 py-2 text-[#f4a500]">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-sm font-bold">{product.rating}</span>
            </div>
            <span className="text-base font-semibold text-[#6f2fbf]">{product.reviews} verified reviews</span>
          </div>

          <div className="flex items-end gap-4">
            <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d81e8f] to-[#f4a500]">₹{product.price}</span>
            <span className="text-xl text-[#999] line-through">₹{product.originalPrice}</span>
            <span className="rounded-full bg-gradient-to-r from-[#d81e8f] to-[#f4a500] px-4 py-1.5 text-sm font-bold text-white">{product.discount}% off 🎉</span>
          </div>

          <div className="rounded-[28px] border border-[#d81e8f]/20 bg-gradient-to-br from-[#fff5f0] to-[#f5e8f5] p-5 shadow-lg">
            <div className="mb-3 flex items-center gap-3 text-base font-bold text-[#d81e8f]">
              <ShieldCheck className="h-5 w-5" />
              ✓ Easy return within 7 days
            </div>
            <div className="flex items-center gap-3 text-base font-bold text-[#6f2fbf]">
              <Truck className="h-5 w-5" />
              🚚 Delivery: 3-5 days | Cash on Delivery
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-bold text-[#1a1612]">🎨 Color</span>
              <span className="px-4 py-1 rounded-full bg-gradient-to-r from-[#d81e8f]/20 to-[#6f2fbf]/20 text-sm font-bold text-[#d81e8f]">{selectedColor}</span>
            </div>
            <div className="flex gap-4">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`h-12 w-12 rounded-full border-3 transition-all hover:scale-110 ${
                    selectedColor === color.name ? "border-[#d81e8f] shadow-lg shadow-[#d81e8f]/50" : "border-[#d81e8f]/30"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-bold text-[#1a1612]">📏 Size</span>
              <Link href="#" className="text-sm font-bold text-[#00a8cc] hover:text-[#6f2fbf] transition">Size guide</Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                    selectedSize === size
                      ? "border-[#d81e8f] bg-gradient-to-r from-[#d81e8f] to-[#a81566] text-white shadow-lg shadow-[#d81e8f]/50"
                      : "border-[#d81e8f]/30 bg-white text-[#1a1612] hover:border-[#d81e8f]/60 hover:scale-105"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border-2 border-[#d81e8f]/30 bg-white px-4 py-3">
              <button
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f5e6f0] text-[#d81e8f] font-bold text-lg"
              >
                −
              </button>
              <span className="w-8 text-center text-base font-bold text-[#1a1612]">{quantity}</span>
              <button
                onClick={() => setQuantity((value) => value + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f5e6f0] text-[#d81e8f] font-bold text-lg"
              >
                +
              </button>
            </div>

            <button onClick={() => addProductToCart(false)} className="flex-1 rounded-full bg-gradient-to-r from-[#d81e8f] to-[#a81566] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#d81e8f]/40 transition-all hover:shadow-xl hover:scale-105 active:scale-95">
              🛍️ Add to Cart
            </button>
            <button className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#d81e8f]/30 bg-white text-[#d81e8f] hover:border-[#d81e8f] hover:bg-[#fff5f0] transition">
              <Heart className="h-6 w-6 fill-current" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button onClick={() => addProductToCart(true)} className="rounded-full border-2 border-[#d81e8f] bg-white px-6 py-4 text-base font-bold text-[#d81e8f] transition-all hover:bg-[#d81e8f] hover:text-white hover:scale-105 active:scale-95">
              💳 Buy Now
            </button>
            <button className="rounded-full bg-gradient-to-r from-[#f4a500] to-[#ff6b35] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#f4a500]/30 transition-all hover:shadow-xl hover:scale-105 active:scale-95">
              👗 Try On at Home
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[32px] border-2 border-[#d81e8f]/20 bg-gradient-to-br from-[#fff5f0] via-[#f5e8f5] to-[#f0e8f5] p-8 shadow-lg">
          <h2 className="mb-6 font-serif text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d81e8f] to-[#6f2fbf]">📦 Product Details</h2>
          <p className="text-lg leading-8 text-[#584942]">{product.description}</p>

          <div className="mt-8 grid gap-6 border-t-2 border-[#d81e8f]/20 pt-6 md:grid-cols-2">
            <div className="rounded-[20px] bg-white/80 p-5 border border-[#d81e8f]/20">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#d81e8f]">🧵 Fabric</h3>
              <p className="mt-3 text-base font-semibold text-[#1a1612]">{product.fabric}</p>
            </div>
            <div className="rounded-[20px] bg-white/80 p-5 border border-[#6f2fbf]/20">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#6f2fbf]">🧺 Care</h3>
              <p className="mt-3 text-base font-semibold text-[#1a1612]">Cold wash, line dry, minimal ironing</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[32px] border-2 border-[#f4a500]/20 bg-gradient-to-br from-[#fffbf8] to-[#fff5f0] p-8 shadow-lg">
          <div className="rounded-[16px] bg-white/80 border border-[#f4a500]/20 p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1a1612]">📊 Stock</span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#f4a500]/20 to-[#ff6b35]/20 font-bold text-[#ff6b35]">{product.stock} left</span>
            </div>
          </div>
          <div className="rounded-[16px] bg-white/80 border border-[#00a8cc]/20 p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1a1612]">🚚 Shipping</span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#00a8cc]/20 to-[#d81e8f]/20 font-bold text-[#00a8cc]">Free</span>
            </div>
          </div>
          <div className="rounded-[16px] bg-white/80 border border-[#6f2fbf]/20 p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1a1612]">✅ Returns</span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#6f2fbf]/20 to-[#00a8cc]/20 font-bold text-[#6f2fbf]">7 days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 rounded-[32px] border-2 border-[#d81e8f]/20 bg-gradient-to-br from-[#fff5f0] via-[#f0e8f5] to-[#e8f8f9] p-8 shadow-lg">
        <h2 className="mb-8 font-serif text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d81e8f] via-[#6f2fbf] to-[#00a8cc]">⭐ Why Shoppers Love It</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: "✨", text: "Premium fabric feel with breathable comfort" },
            { icon: "👗", text: "Tailored silhouettes that flatter various body types" },
            { icon: "🎨", text: "Elegant colors designed for modern Indian wardrobes" },
          ].map((item) => (
            <div key={item.text} className="rounded-[24px] bg-white/90 border border-[#d81e8f]/20 p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="text-3xl mb-3">{item.icon}</div>
              <p className="text-base leading-7 font-semibold text-[#584942]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex gap-4 justify-end md:hidden">
        <button onClick={() => addProductToCart(false)} className="flex-1 rounded-full bg-gradient-to-r from-[#d81e8f] to-[#a81566] px-5 py-3.5 text-sm font-bold text-white">🛍️ Add to cart</button>
        <button className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#d81e8f]/30 bg-white text-[#d81e8f]">
          <Heart className="h-5 w-5 fill-current" />
        </button>
      </div>
    </div>
  );
}
