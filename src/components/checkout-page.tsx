"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LotusOrnament } from "@/components/lotus-ornament";
import { AlertCircle, Loader } from "lucide-react";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          const token = window.localStorage.getItem("admire-user-token");
          setIsAuthenticated(Boolean(token));
        }
      } catch {
        const token = window.localStorage.getItem("admire-user-token");
        setIsAuthenticated(Boolean(token));
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Load cart when auth is checked
  useEffect(() => {
    if (authLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    // Load cart items
    const stored = JSON.parse(window.localStorage.getItem("admire-cart") || "[]") as CartItem[];
    if (!stored.length) {
      setError("Your cart is empty");
      setTimeout(() => router.push("/products"), 2000);
      return;
    }

    setCartItems(stored);
  }, [isAuthenticated, authLoading, router]);

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const shipping = subtotal > 2499 ? 0 : cartItems.length ? 149 : 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setError("Please log in to place an order");
      return;
    }

    if (!cartItems.length) {
      setError("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
          paymentMethod,
        }),
      });

      const data = (await response.json()) as { success?: boolean; order?: { id: string }; error?: string };

      if (!response.ok) {
        setError(data.error || "Failed to place order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (!data.success || !data.order) {
        setError("Order creation failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Clear cart
      window.localStorage.removeItem("admire-cart");
      window.dispatchEvent(new Event("admire-cart-updated"));

      // Redirect to confirmation
      router.push(`/order-confirmation?orderId=${data.order.id}`);
    } catch (error) {
      console.error("[CHECKOUT] Error:", error);
      setError("Connection error. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader className="h-8 w-8 animate-spin text-[#c94a6a]" />
          <p className="text-[#665a55]">Loading checkout...</p>
        </div>
      </main>
    );
  }

  // Show error if not authenticated or cart is empty
  if (!isAuthenticated || (error && !cartItems.length)) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
        <div className="rounded-[24px] border-2 border-[#ff6b6b] bg-[#fff0f0] p-6 text-center">
          <AlertCircle className="h-12 w-12 text-[#ff6b6b] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#ff6b6b] mb-2">
            {!isAuthenticated ? "Please log in" : "Cart is empty"}
          </h2>
          <p className="text-[#5a4b45] mb-6">
            {!isAuthenticated
              ? "You need to be logged in to proceed with checkout."
              : "Your cart is empty. Please add items before checking out."}
          </p>
          <button
            onClick={() => router.push(!isAuthenticated ? "/login" : "/products")}
            className="rounded-full bg-[#c94a6a] px-6 py-3 text-white font-semibold hover:bg-[#a81566] transition"
          >
            {!isAuthenticated ? "Go to login" : "Continue shopping"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 flex items-center gap-3">
        <LotusOrnament className="h-11 w-11 rounded-full border border-[#d7c1af] bg-white/80 p-2" />
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Secure checkout</p>
          <h1 className="mt-1 font-serif text-4xl text-[#201614]">Checkout</h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-[24px] border-2 border-[#ff6b6b] bg-[#fff0f0] p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-[#ff6b6b] flex-shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-[#ff6b6b]">{error}</p>
        </div>
      )}

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
                <label key={method} className="flex items-center gap-3 rounded-[18px] border border-[#e4d4c9] bg-white px-4 py-3 cursor-pointer">
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

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="mt-6 block w-full rounded-full bg-[#c94a6a] px-5 py-3.5 text-center text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 border border-[#c94a6a]/40 min-h-[48px]"
          >
            {isSubmitting ? "Processing order..." : "Place order"}
          </button>
        </aside>
      </div>
    </main>
  );
}
