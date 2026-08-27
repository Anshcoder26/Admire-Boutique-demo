"use client";

import { useRouter } from "next/navigation";
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

export function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("admire-user-token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const stored = JSON.parse(window.localStorage.getItem("admire-cart") || "[]") as CartItem[];
    if (!stored.length) {
      router.push("/products");
      return;
    }

    setCartItems(stored);
  }, [router]);

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const shipping = subtotal > 2499 ? 0 : cartItems.length ? 149 : 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  const handlePlaceOrder = async () => {
    const token = window.localStorage.getItem("admire-user-token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!cartItems.length) {
      alert("Your cart is empty.");
      return;
    }

    if (paymentMethod === "Razorpay" && !(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID)) {
      alert("Razorpay is not configured for this environment. Add the live keys to .env.local before enabling Razorpay.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_number: `AB-${Date.now()}`,
        items: cartItems.map((item) => ({
          name: item.name,
          size: item.size,
          qty: item.quantity,
          price: item.price,
        })),
        subtotal,
        shipping,
        discount,
        total,
        payment_method: paymentMethod,
      }),
    });

    const data = (await response.json()) as { success?: boolean; error?: string };
    setIsSubmitting(false);

    if (!response.ok || !data.success) {
      alert(data.error || "Unable to place order");
      return;
    }

    window.localStorage.removeItem("admire-cart");
    window.dispatchEvent(new CustomEvent("admire-cart-updated"));
    router.push("/order-confirmation");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 flex items-center gap-3">
        <LotusOrnament className="h-11 w-11 rounded-full border border-[#d7c1af] bg-white/80 p-2" />
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Secure checkout</p>
          <h1 className="mt-1 font-serif text-4xl text-[#201614]">Checkout</h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-[30px] border border-[#eadcd3] bg-[#fffaf6] p-5">
            <h2 className="mb-4 font-serif text-3xl text-[#201614]">Customer details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <input defaultValue="Ansh" placeholder="First name" className="rounded-full border border-[#e4d4c9] bg-white px-4 py-3 text-sm outline-none" />
              <input defaultValue="Agarwal" placeholder="Last name" className="rounded-full border border-[#e4d4c9] bg-white px-4 py-3 text-sm outline-none" />
              <input defaultValue="customer@admireboutique.in" placeholder="Email" className="md:col-span-2 rounded-full border border-[#e4d4c9] bg-white px-4 py-3 text-sm outline-none" />
              <input defaultValue="+91 98765 43210" placeholder="Phone" className="md:col-span-2 rounded-full border border-[#e4d4c9] bg-white px-4 py-3 text-sm outline-none" />
            </div>
          </div>

          <div className="rounded-[30px] border border-[#eadcd3] bg-[#fffaf6] p-5">
            <h2 className="mb-4 font-serif text-3xl text-[#201614]">Shipping address</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <input defaultValue="12, Saffron Residency" placeholder="Street address" className="md:col-span-2 rounded-full border border-[#e4d4c9] bg-white px-4 py-3 text-sm outline-none" />
              <input defaultValue="Bengaluru" placeholder="City" className="rounded-full border border-[#e4d4c9] bg-white px-4 py-3 text-sm outline-none" />
              <input defaultValue="Karnataka" placeholder="State" className="rounded-full border border-[#e4d4c9] bg-white px-4 py-3 text-sm outline-none" />
              <input defaultValue="560001" placeholder="ZIP code" className="rounded-full border border-[#e4d4c9] bg-white px-4 py-3 text-sm outline-none" />
              <input defaultValue="India" placeholder="Country" className="rounded-full border border-[#e4d4c9] bg-white px-4 py-3 text-sm outline-none" />
            </div>
          </div>

          <div className="rounded-[30px] border border-[#eadcd3] bg-[#fffaf6] p-5">
            <h2 className="mb-4 font-serif text-3xl text-[#201614]">Payment</h2>
            <div className="space-y-3 text-sm text-[#4c362f]">
              {['Cash on Delivery', 'UPI', 'Credit / Debit Card', 'Net Banking', 'Razorpay'].map((method) => (
                <label key={method} className="flex items-center gap-3 rounded-[18px] border border-[#e4d4c9] bg-white px-4 py-3">
                  <input type="radio" name="payment" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-[30px] border border-[#eadcd3] bg-[#fffaf6] p-5 shadow-[0_14px_32px_rgba(84,58,45,0.05)]">
          <h2 className="mb-5 font-serif text-3xl text-[#201614]">Order summary</h2>
          <div className="space-y-4 text-sm text-[#584942]">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center justify-between gap-3">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="flex items-center justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex items-center justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
            <div className="flex items-center justify-between"><span>Discount</span><span>-₹{discount}</span></div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#eadcd3] pt-5">
            <span className="text-lg font-medium text-[#201614]">Total</span>
            <span className="text-2xl font-semibold text-[#201614]">₹{total}</span>
          </div>

          <button onClick={handlePlaceOrder} disabled={isSubmitting} className="mt-6 block w-full rounded-full bg-[#4b1f1d] px-5 py-3.5 text-center text-sm font-medium text-white shadow-lg shadow-[#4b1f1d]/15 transition hover:bg-[#341514] disabled:opacity-70">
            {isSubmitting ? "Processing..." : "Place order"}
          </button>
        </aside>
      </div>
    </div>
  );
}
