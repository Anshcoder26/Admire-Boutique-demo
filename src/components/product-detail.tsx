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
      <div className="mb-5 flex items-center gap-2 text-sm text-[#76665f]">
        <Link href="/" className="hover:text-[#402320]">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#402320]">Kurtis</Link>
        <span>/</span>
        <span className="text-[#201614]">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery images={product.images} name={product.name} />

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <LotusOrnament className="h-12 w-12 rounded-full border border-[#d7c1af] bg-white/80 p-2" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">{product.category}</p>
              <h1 className="mt-1 font-serif text-4xl leading-none text-[#201614] md:text-5xl">{product.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full bg-[#f9f1e8] px-2.5 py-1 text-[#b4872b]">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-sm font-semibold text-[#563f39]">{product.rating}</span>
            </div>
            <span className="text-sm text-[#7c6760]">{product.reviews} reviews</span>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-4xl font-semibold text-[#271a17]">₹{product.price}</span>
            <span className="text-lg text-[#8c786f] line-through">₹{product.originalPrice}</span>
            <span className="rounded-full bg-[#f5d9c9] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#7c3f35]">{product.discount}% off</span>
          </div>

          <div className="rounded-[28px] border border-[#eadbd0] bg-[#fffaf6] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#4a2d27]">
              <ShieldCheck className="h-4 w-4 text-[#6f4b6b]" />
              Easy return within 7 days. Cash on delivery available.
            </div>
            <div className="flex items-center gap-2 text-sm text-[#5c4f49]">
              <Truck className="h-4 w-4 text-[#5d4037]" />
              Estimated delivery: 3-5 days.
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-[#3b2824]">Color</span>
              <span className="text-xs uppercase tracking-[0.18em] text-[#8c705d]">{selectedColor}</span>
            </div>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`h-10 w-10 rounded-full border-2 ${
                    selectedColor === color.name ? "border-[#4b1f1d]" : "border-[#d8b9a5]"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-[#3b2824]">Size</span>
              <Link href="#" className="text-xs uppercase tracking-[0.18em] text-[#7d5b4d]">Size guide</Link>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition ${
                    selectedSize === size
                      ? "border-[#4b1f1d] bg-[#4b1f1d] text-white"
                      : "border-[#e5d0c1] bg-white text-[#4b2d28]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#e7d7cd] bg-[#fffaf6] px-2.5 py-2.5">
              <button
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f5e9e4]"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-7 text-center text-sm font-medium text-[#2a1d1a]">{quantity}</span>
              <button
                onClick={() => setQuantity((value) => value + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f5e9e4]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button onClick={() => addProductToCart(false)} className="flex-1 rounded-full bg-[#4b1f1d] px-5 py-3.5 text-sm font-medium text-white shadow-lg shadow-[#4b1f1d]/15 transition hover:bg-[#341514]">
              Add to cart
            </button>
            <button className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e5d2c3] bg-white text-[#4f2f2a]">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => addProductToCart(true)} className="rounded-full border border-[#4b1f1d] bg-[#f7efe9] px-5 py-3 text-sm font-medium text-[#381d1a] transition hover:bg-[#f1e4dc]">
              Buy now
            </button>
            <button className="rounded-full bg-[#f2d8b5] px-5 py-3 text-sm font-medium text-[#3a2b26] transition hover:bg-[#e9c58f]">
              Try on at home
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[30px] border border-[#ead8cc] bg-[#fffaf6] p-6">
          <h2 className="mb-4 font-serif text-3xl text-[#201614]">Product details</h2>
          <p className="text-base leading-8 text-[#584942]">{product.description}</p>

          <div className="mt-6 grid gap-4 border-t border-[#ead8cc] pt-5 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7d645a]">Fabric</h3>
              <p className="mt-2 text-base text-[#463832]">{product.fabric}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7d645a]">Care</h3>
              <p className="mt-2 text-base text-[#463832]">Cold wash, line dry, minimal ironing</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[30px] border border-[#ead8cc] bg-white p-6 shadow-[0_12px_30px_rgba(84,58,45,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-[#43332d]">Stock</span>
            <span className="font-medium text-[#1f1715]">{product.stock} left</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#43332d]">Shipping</span>
            <span className="font-medium text-[#1f1715]">Free</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#43332d]">Returns</span>
            <span className="font-medium text-[#1f1715]">7 days</span>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-[30px] border border-[#ead8cc] bg-[#fffaf6] p-6">
        <h2 className="mb-5 font-serif text-3xl text-[#201614]">Why shoppers love it</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Premium fabric feel with breathable comfort",
            "Tailored silhouettes that flatter various body types",
            "Elegant colors designed for modern Indian wardrobes",
          ].map((item) => (
            <div key={item} className="rounded-[20px] bg-white p-4 text-sm leading-7 text-[#584942] shadow-[0_10px_20px_rgba(84,58,45,0.04)]">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex gap-4 justify-end md:hidden">
        <button onClick={() => addProductToCart(false)} className="flex-1 rounded-full bg-[#4b1f1d] px-5 py-3.5 text-sm font-medium text-white">Add to cart</button>
        <button className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e5d2c3] bg-white text-[#4f2f2a]">
          <Heart className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
