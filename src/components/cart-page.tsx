"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LotusOrnament } from "@/components/lotus-ornament";

type CartItem = {
  productId: string;
  name: string;
  variant: string;
  size: string;
  color: string;
  price: number;
  image: string;
  quantity: number;
};

export function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const syncCart = () => {
      const stored = JSON.parse(window.localStorage.getItem("admire-cart") || "[]") as CartItem[];
      setCartItems(stored);
    };

    syncCart();
    window.addEventListener("admire-cart-updated", syncCart);
    return () => window.removeEventListener("admire-cart-updated", syncCart);
  }, []);

  const updateCart = (nextItems: CartItem[]) => {
    setCartItems(nextItems);
    window.localStorage.setItem("admire-cart", JSON.stringify(nextItems));
    window.dispatchEvent(new CustomEvent("admire-cart-updated"));
  };

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const shipping = subtotal > 2499 ? 0 : cartItems.length ? 149 : 0;
  const total = subtotal + shipping;

  const updateQuantity = (productId: string, size: string, color: string, change: number) => {
    const nextItems = cartItems
      .map((item) =>
        item.productId === productId && item.size === size && item.color === color
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
      .filter((item) => item.quantity > 0);
    updateCart(nextItems);
  };

  const removeItem = (productId: string, size: string, color: string) => {
    updateCart(cartItems.filter((item) => !(item.productId === productId && item.size === size && item.color === color)));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 flex items-center gap-3">
        <LotusOrnament className="h-11 w-11 rounded-full border border-[#d7c1af] bg-white/80 p-2" />
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Your bag</p>
          <h1 className="mt-1 font-serif text-4xl text-[#201614]">Cart</h1>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-[30px] border border-[#eadcd3] bg-[#fffaf6] p-8 text-center shadow-[0_14px_32px_rgba(84,58,45,0.05)]">
          <p className="mb-4 text-lg font-medium text-[#201614]">Your cart is empty.</p>
          <Link href="/products" className="inline-flex rounded-full bg-[#4b1f1d] px-5 py-3 text-sm font-medium text-white">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 rounded-[28px] border border-[#eadcd3] bg-white p-3 shadow-[0_12px_26px_rgba(84,58,45,0.04)]">
                <div className="w-28 overflow-hidden rounded-[22px]">
                  <Image src={item.image} alt={item.name} width={260} height={320} className="h-28 w-full object-cover" />
                </div>

                <div className="flex flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-medium text-[#241915]">{item.name}</h2>
                      <p className="mt-1 text-sm text-[#6a534e]">{item.variant}</p>
                    </div>
                    <button onClick={() => removeItem(item.productId, item.size, item.color)} className="text-[#7e5a52]" aria-label={`Remove ${item.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 rounded-full border border-[#eadfd5] bg-[#fffaf6] px-2 py-1.5">
                      <button onClick={() => updateQuantity(item.productId, item.size, item.color, -1)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#f5e9e4]">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm text-[#2a1d1a]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.size, item.color, 1)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#f5e9e4]">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-xl font-semibold text-[#1f1715]">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-[30px] border border-[#eadcd3] bg-[#fffaf6] p-5 shadow-[0_14px_32px_rgba(84,58,45,0.05)]">
            <h2 className="mb-5 font-serif text-3xl text-[#201614]">Order summary</h2>

            <div className="space-y-3 text-sm text-[#584942]">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>₹0</span></div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#eadcd3] pt-5">
              <span className="text-lg font-medium text-[#201614]">Total</span>
              <span className="text-2xl font-semibold text-[#201614]">₹{total}</span>
            </div>

            <Link href="/checkout" className="mt-6 block rounded-full bg-[#4b1f1d] px-5 py-3.5 text-center text-sm font-medium text-white shadow-lg shadow-[#4b1f1d]/15 transition hover:bg-[#341514]">
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
