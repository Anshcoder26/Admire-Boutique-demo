"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Heart, Shield, Truck, Check } from "lucide-react";
import { ProductGallery } from "@/components/product-gallery";
import { DecorativeMotif, MotifDivider, MotifCorner } from "@/components/decorative-motif";
import type { Product } from "@/data/products";

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const isSoldOut = Boolean(product.isSoldOut) || Number(product.stock) <= 0;
  const isUnstitched = product.stitchType === "Unstitched";
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [selectedSize, setSelectedSize] = useState(product.sizes[2] || product.sizes[0]);
  const [quantity, setQuantity] = useState(1);

  const addProductToCart = (redirectToCheckout = false) => {
    if (typeof window === "undefined") return;
    if (isSoldOut) {
      window.alert(`${product.name} is currently sold out.`);
      return;
    }

    const cart = JSON.parse(window.localStorage.getItem("admire-cart") || "[]");
    const effectiveSize = isUnstitched ? "Unstitched" : selectedSize;
    const item = {
      productId: product.id,
      name: product.name,
      color: selectedColor,
      size: effectiveSize,
      variant: isUnstitched ? `${selectedColor} / Unstitched` : `${selectedColor} / ${selectedSize}`,
      image: product.images[0],
      price: Number(product.price),
      quantity,
    };

    const existingIndex = cart.findIndex(
      (entry: { productId: string; color: string; size: string }) =>
        entry.productId === product.id && entry.color === selectedColor && entry.size === effectiveSize
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(item);
    }

    window.localStorage.setItem("admire-cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("admire-cart-updated"));

    if (redirectToCheckout) {
      const isAuthenticated = window.localStorage.getItem("admire-user-token");
      if (!isAuthenticated) {
        router.push("/login?redirect=/checkout");
      } else {
        router.push("/checkout");
      }
      return;
    }

    window.alert(`${product.name} added to cart.`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 md:px-8 lg:px-10">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 text-sm text-[#6f2fbf]/70">
        <Link href="/" className="hover:text-[#7D1D1D] transition">Home</Link>
        <span className="text-[#ccc]">—</span>
        <Link href="/products" className="hover:text-[#7D1D1D] transition">Collection</Link>
        <span className="text-[#ccc]">—</span>
        <span className="text-[#1a1612] font-semibold">{product.name}</span>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Image Gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Product Info */}
        <div className="space-y-8">
          {/* Header */}
          <div className="border-b border-[#7D1D1D]/15 pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6f2fbf]/80">{product.category}</p>
            <div className="mt-3 flex items-start gap-3">
              <DecorativeMotif className="w-6 h-6 flex-shrink-0 mt-1" color="#D4AF37" variant="lotus" />
              <h1 className="font-serif text-4xl leading-tight text-[#1a1612] md:text-5xl">{product.name}</h1>
            </div>
            
            {product.stitchType && (
              <div className="mt-4 inline-flex items-center gap-2 border-l-2 border-[#D4AF37] pl-4">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#5e3228]">
                  {product.stitchType === "Stitched" ? "Stitched" : "Unstitched"}
                </span>
              </div>
            )}
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-[#D4AF37]" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-[#1a1612]">{product.rating}</span>
            </div>
            <span className="text-sm text-[#584942]">{product.reviews} verified reviews</span>
          </div>

          {/* Pricing */}
          <div className="space-y-4 border-y border-[#7D1D1D]/10 py-6">
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold text-[#1a1612]">₹{product.price}</span>
              <span className="text-lg text-[#999] line-through">₹{product.originalPrice}</span>
              <span className="text-sm font-bold text-[#c8563e]">{product.discount}% off</span>
            </div>
            
            {isSoldOut && (
              <div className="text-sm font-semibold text-[#8a1f1f] bg-[#fdf0f0] border border-[#8a1f1f]/20 rounded px-4 py-2 w-fit">
                Currently sold out
              </div>
            )}
          </div>

          {/* Trust Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-[#fafaf9] rounded border border-[#ddd]/30">
              <Shield className="w-5 h-5 text-[#7D1D1D] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6f2fbf]">7-Day Returns</p>
                <p className="text-sm text-[#584942] mt-1">Easy, no-questions-asked</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#fafaf9] rounded border border-[#ddd]/30">
              <Truck className="w-5 h-5 text-[#7D1D1D] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6f2fbf]">3-5 Day Delivery</p>
                <p className="text-sm text-[#584942] mt-1">Free shipping included</p>
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold uppercase tracking-[0.1em] text-[#1a1612]">Select Color</label>
              <span className="text-sm text-[#6f2fbf] font-semibold">{selectedColor}</span>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              {product.colors && product.colors.length > 0 ? (
                product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`h-12 w-12 rounded-lg border-2 transition-all ${
                      selectedColor === color.name 
                        ? "border-[#7D1D1D] ring-2 ring-[#7D1D1D]/30 shadow-sm" 
                        : "border-[#7D1D1D]/20 hover:border-[#7D1D1D]/60"
                    }`}
                    style={{ backgroundColor: color.hex || "#cccccc" }}
                    aria-label={color.name}
                    title={color.name}
                  />
                ))
              ) : (
                <span className="text-sm text-[#8b7965]">No colors available</span>
              )}
            </div>
          </div>

          {/* Size Selection */}
          {!isUnstitched && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold uppercase tracking-[0.1em] text-[#1a1612]">Select Size</label>
                <Link href="#size-guide" className="text-xs font-semibold text-[#6f2fbf] hover:text-[#7D1D1D] transition">Size Guide</Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 min-w-[44px] px-4 flex items-center justify-center rounded border text-sm font-semibold transition-all ${
                      selectedSize === size
                        ? "border-[#7D1D1D] bg-[#7D1D1D] text-white shadow-md"
                        : "border-[#7D1D1D]/30 bg-white text-[#1a1612] hover:border-[#7D1D1D]/60"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#7D1D1D]/20 rounded">
                <button
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={isSoldOut}
                  className="px-4 py-3 text-[#7D1D1D] hover:bg-[#f9f7f6] transition"
                >
                  −
                </button>
                <span className="px-6 py-3 text-base font-semibold text-[#1a1612] border-x border-[#7D1D1D]/20">{quantity}</span>
                <button
                  onClick={() => setQuantity((value) => value + 1)}
                  disabled={isSoldOut}
                  className="px-4 py-3 text-[#7D1D1D] hover:bg-[#f9f7f6] transition"
                >
                  +
                </button>
              </div>

              <button className="flex items-center justify-center w-12 h-12 rounded border border-[#7D1D1D]/30 hover:bg-[#f9f7f6] transition" aria-label="Add to wishlist">
                <Heart className="w-5 h-5 text-[#7D1D1D]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => addProductToCart(false)}
                disabled={isSoldOut}
                className={`w-full py-4 px-6 rounded font-semibold text-base transition-all ${
                  isSoldOut
                    ? "cursor-not-allowed bg-[#e4dbd7] text-[#7d6f69]"
                    : "bg-[#7D1D1D] text-white hover:bg-[#5a1515] active:scale-95"
                }`}
              >
                {isSoldOut ? "Sold Out" : "Add to Cart"}
              </button>
              <button
                onClick={() => addProductToCart(true)}
                disabled={isSoldOut}
                className={`w-full py-4 px-6 rounded font-semibold text-base border-2 transition-all ${
                  isSoldOut
                    ? "cursor-not-allowed border-[#c8b8b1] bg-[#e4dbd7] text-[#7d6f69]"
                    : "border-[#7D1D1D] bg-white text-[#7D1D1D] hover:bg-[#7D1D1D] hover:text-white"
                }`}
              >
                {isSoldOut ? "Sold Out" : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="mt-20 grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="border-b border-[#7D1D1D]/10 pb-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <DecorativeMotif className="w-5 h-5" color="#D4AF37" variant="flower" />
              <h2 className="font-serif text-3xl font-bold text-[#1a1612]">Product Details</h2>
              <DecorativeMotif className="w-5 h-5" color="#D4AF37" variant="flower" />
            </div>
            <p className="text-base leading-8 text-[#584942] whitespace-pre-line">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#6f2fbf] mb-3">Fabric</h3>
              <p className="text-base font-semibold text-[#1a1612]">{product.fabric}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#6f2fbf] mb-3">Care Instructions</h3>
              <p className="text-base font-semibold text-[#1a1612]">Cold wash, line dry, minimal ironing</p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="border border-[#7D1D1D]/15 rounded p-5 bg-[#fafaf9]">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6f2fbf] flex items-center gap-2">
              <span className="text-lg">🚚</span> Shipping
            </p>
            <p className="text-sm font-semibold mt-3 text-[#1a1612]">Free worldwide shipping</p>
          </div>

          <div className="border border-[#7D1D1D]/15 rounded p-5 bg-[#fafaf9]">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6f2fbf] flex items-center gap-2">
              <Check className="w-4 h-4" /> Guarantee
            </p>
            <p className="text-sm font-semibold mt-3 text-[#1a1612]">7-day money-back guarantee</p>
          </div>
        </div>
      </div>

      {/* Why Choose */}
      <div className="mt-20 border-t border-[#7D1D1D]/10 pt-12">
        <MotifDivider className="mb-8" />
        <div className="flex items-center justify-center gap-4 mb-8">
          <DecorativeMotif className="w-6 h-6" color="#D4AF37" variant="lotus" />
          <h2 className="font-serif text-3xl font-bold text-[#1a1612]">Why Admire Boutique?</h2>
          <DecorativeMotif className="w-6 h-6" color="#D4AF37" variant="lotus" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Premium Quality", desc: "Handpicked fabrics and superior craftsmanship" },
            { title: "Authentic Design", desc: "Traditional aesthetics meets modern elegance" },
            { title: "Perfect Fit", desc: "Available in multiple sizes and customization options" },
          ].map((item) => (
            <div key={item.title} className="border border-[#7D1D1D]/10 rounded p-8 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 opacity-20 group-hover:opacity-30 transition">
                <DecorativeMotif className="w-12 h-12" color="#D4AF37" variant="diamond" />
              </div>
              <h3 className="font-semibold text-[#1a1612] mb-3">{item.title}</h3>
              <p className="text-sm leading-6 text-[#584942]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
