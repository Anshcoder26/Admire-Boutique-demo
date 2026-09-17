"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";

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
      const stored = readJSON<CartItem[]>(STORAGE_KEYS.cart, []);
      setCartItems(Array.isArray(stored) ? stored : []);
    };

    syncCart();
    window.addEventListener("admire-cart-updated", syncCart);
    return () => window.removeEventListener("admire-cart-updated", syncCart);
  }, []);

  const updateCart = (nextItems: CartItem[]) => {
    setCartItems(nextItems);
    writeJSON(STORAGE_KEYS.cart, nextItems);
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
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]">Your bag</p>
          <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight text-[var(--ink)]">Cart</h1>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-8 text-center shadow-[var(--shadow-sm)]">
          <p className="mb-4 text-lg font-medium text-[var(--ink)]">Your cart is empty.</p>
          <Link href="/products" className="inline-flex min-h-[44px] items-center rounded-md bg-[#7D1D1D] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#641414]">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 rounded-lg border border-[var(--ink)]/10 bg-white p-3 shadow-[var(--shadow-sm)]">
                <div className="w-28 overflow-hidden rounded-lg">
                  <Image src={item.image} alt={item.name} width={260} height={320} className="h-28 w-full object-cover" />
                </div>

                <div className="flex flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-medium text-[var(--ink)]">{item.name}</h2>
                      <p className="mt-1 text-sm text-[var(--ink)]/60">{item.variant}</p>
                    </div>
                    <button onClick={() => removeItem(item.productId, item.size, item.color)} className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--ink)]/50 transition hover:bg-[var(--background)] hover:text-[#7D1D1D]" aria-label={`Remove ${item.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 rounded-md border border-[var(--ink)]/10 bg-white px-2 py-1.5">
                      <button onClick={() => updateQuantity(item.productId, item.size, item.color, -1)} className="flex h-11 w-11 items-center justify-center rounded-md transition hover:bg-[var(--background)]">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm text-[var(--ink)]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.size, item.color, 1)} className="flex h-11 w-11 items-center justify-center rounded-md transition hover:bg-[var(--background)]">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-xl font-semibold text-[var(--ink)]">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-xl border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)]">
            <h2 className="mb-5 font-serif text-3xl font-semibold tracking-tight text-[var(--ink)]">Order summary</h2>

            <div className="space-y-3 text-sm text-[var(--ink)]/70">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>₹0</span></div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[var(--ink)]/10 pt-5">
              <span className="text-lg font-medium text-[var(--ink)]">Total</span>
              <span className="font-serif text-3xl font-bold text-[#7D1D1D]">₹{total}</span>
            </div>

            <Link href="/checkout" className="mt-6 flex min-h-[48px] items-center justify-center rounded-md bg-[#7D1D1D] px-5 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[var(--shadow-sm)] transition hover:bg-[#641414] active:scale-[0.98]">
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
