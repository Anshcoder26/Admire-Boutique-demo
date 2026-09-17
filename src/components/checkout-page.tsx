"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (resp: unknown) => void) => void };
  }
}

// Load the Razorpay checkout script on demand. Resolves false if it can't load
// (e.g. offline) so the caller can surface a friendly error.
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Safely read + parse a JSON array from localStorage; never throws on corrupt data.
function readCart<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

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

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type Address = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: number;
};

export function CheckoutPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Controlled customer + address fields so typed-in values are actually
  // captured (previously uncontrolled defaultValue inputs were ignored, which
  // blocked checkout for anyone without a saved address).
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");

  // Select a saved address and copy its values into the editable fields.
  const applyAddress = (addr: Address) => {
    setSelectedAddress(addr);
    setLine1(addr.line1 || "");
    setLine2(addr.line2 || "");
    setCity(addr.city || "");
    setStateName(addr.state || "");
    setPincode(addr.pincode || "");
    setCountry(addr.country || "India");
  };

  // Check authentication and load customer data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [meRes, addressesRes] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include" }),
          fetch("/api/me/addresses", { credentials: "include" }),
        ]);

        if (meRes.ok) {
          setIsAuthenticated(true);
          setError(""); // Clear any error when authenticated
          const meData = (await meRes.json()) as { user?: Customer };
          if (meData.user) {
            const parts = (meData.user.name || "").trim().split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" "));
            setEmail(meData.user.email || "");
            setPhone(meData.user.phone || "");
          }

          if (addressesRes.ok) {
            const addressData = (await addressesRes.json()) as { addresses?: Address[] };
            if (addressData.addresses?.length) {
              setAddresses(addressData.addresses);
              // Set default address and prefill the editable address fields.
              const defaultAddr = addressData.addresses.find((a) => a.is_default === 1) || addressData.addresses[0];
              applyAddress(defaultAddr);
            }
          }
        } else {
          // The httpOnly session cookie is the single source of truth. If
          // /api/auth/me rejects it, the user is not authenticated.
          setIsAuthenticated(false);
          setError("Please log in to place an order");
        }
      } catch (e) {
        console.error("[CHECKOUT] Auth check error:", e);
        setIsAuthenticated(false);
        setError("Please log in to place an order");
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

    // Load cart items (safe parse — corrupt storage must not crash checkout)
    const stored = readCart<CartItem>("admire-cart");
    if (!stored.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Your cart is empty");
      const timer = setTimeout(() => router.push("/products"), 2000);
      return () => clearTimeout(timer);
    }

    setCartItems(stored);
  }, [isAuthenticated, authLoading, router]);

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const shipping = subtotal > 2499 ? 0 : cartItems.length ? 149 : 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  const payWithRazorpay = (
    orderId: string,
    orderNumber: string,
    amount: number,
    prefill: { name: string; email: string; contact: string }
  ): Promise<boolean> =>
    new Promise(async (resolve) => {
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded || !window.Razorpay) {
          setError("Could not load the payment gateway. Please try again.");
          return resolve(false);
        }

        const rzpRes = await fetch("/api/checkout/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ amount, order_number: orderNumber, order_id: orderId }),
        });
        const rzpData = (await rzpRes.json()) as {
          success?: boolean;
          razorpay_order_id?: string;
          key_id?: string;
          amount?: number;
          error?: string;
        };
        if (!rzpRes.ok || !rzpData.success || !rzpData.razorpay_order_id) {
          setError(rzpData.error || "Could not start the payment. Please try again.");
          return resolve(false);
        }

        const rzp = new window.Razorpay({
          key: rzpData.key_id,
          amount: rzpData.amount ?? Math.round(amount * 100),
          currency: "INR",
          name: "Admire Boutique",
          description: `Order ${orderNumber}`,
          order_id: rzpData.razorpay_order_id,
          prefill,
          theme: { color: "#7D1D1D" },
          handler: async (response: unknown) => {
            const r = response as {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            };
            try {
              const verifyRes = await fetch("/api/checkout/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  razorpay_order_id: r.razorpay_order_id,
                  razorpay_payment_id: r.razorpay_payment_id,
                  razorpay_signature: r.razorpay_signature,
                  order_id: orderId,
                }),
              });
              const verifyData = (await verifyRes.json()) as { success?: boolean; error?: string };
              if (verifyRes.ok && verifyData.success) return resolve(true);
              setError(verifyData.error || "Payment verification failed.");
              resolve(false);
            } catch {
              setError("Could not verify the payment. Please contact support if you were charged.");
              resolve(false);
            }
          },
          modal: {
            ondismiss: () => {
              setError("Payment was cancelled. Your order is saved as pending.");
              resolve(false);
            },
          },
        });
        rzp.on("payment.failed", (resp: unknown) => {
          const desc = (resp as { error?: { description?: string } })?.error?.description;
          setError(desc || "Payment failed. Please try again.");
          resolve(false);
        });
        rzp.open();
      } catch {
        setError("Payment error. Please try again.");
        resolve(false);
      }
    });

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setError("Please log in to place an order");
      return;
    }

    if (!cartItems.length) {
      setError("Your cart is empty");
      return;
    }

    // Validate customer + address (server re-validates and re-computes money).
    const trimmedPhone = phone.replace(/\D/g, "");
    if (!firstName.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    if (!/^\d{10}$/.test(trimmedPhone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!line1.trim() || !city.trim() || !stateName.trim()) {
      setError("Please complete your shipping address.");
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const address = {
      full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      phone: trimmedPhone,
      line1: line1.trim(),
      line2: line2.trim(),
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.trim(),
      country: country.trim() || "India",
    };

    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
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
          address,
        }),
      });

      const data = (await response.json()) as { success?: boolean; order?: { id: string; order_number?: string }; error?: string };

      if (!response.ok) {
        if (response.status === 409) {
          // Stock conflict
          setError(data.error || "Some items are out of stock. Please update your cart.");
        } else {
          setError(data.error || "Failed to place order. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      if (!data.success || !data.order) {
        setError("Order creation failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // For online payment, run the Razorpay flow and only continue once the
      // payment is verified. The order already exists as "Pending".
      if (paymentMethod === "Razorpay") {
        const paid = await payWithRazorpay(data.order.id, data.order.order_number || data.order.id, total, {
          name: address.full_name,
          email: email.trim(),
          contact: trimmedPhone,
        });
        if (!paid) {
          setIsSubmitting(false);
          return;
        }
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
          <Loader className="h-8 w-8 animate-spin text-[#7D1D1D]" />
          <p className="text-[var(--ink)]/60">Loading checkout...</p>
        </div>
      </main>
    );
  }

  // Show error if not authenticated or cart is empty
  if (!isAuthenticated || (error && !cartItems.length)) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
        <div className="rounded-lg border border-[#b3261e]/40 bg-[#fff0f0] p-6 text-center">
          <AlertCircle className="h-12 w-12 text-[#b3261e] mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#b3261e] mb-2">
            {!isAuthenticated ? "Please log in" : "Cart is empty"}
          </h2>
          <p className="text-[var(--ink)]/70 mb-6">
            {!isAuthenticated
              ? "You need to be logged in to proceed with checkout."
              : "Your cart is empty. Please add items before checking out."}
          </p>
          <button
            onClick={() => router.push(!isAuthenticated ? "/login" : "/products")}
            className="min-h-[44px] rounded-md bg-[#7D1D1D] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#641414]"
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
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]">Secure checkout</p>
          <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight text-[var(--ink)]">Checkout</h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-[#b3261e]/40 bg-[#fff0f0] p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-[#b3261e] flex-shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-[#b3261e]">{error}</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-5">
            <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight text-[var(--ink)]">Customer details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                aria-label="First name"
                placeholder="First name"
                className="rounded-md border border-[var(--ink)]/10 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/10"
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                aria-label="Last name"
                placeholder="Last name"
                className="rounded-md border border-[var(--ink)]/10 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/10"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                aria-label="Email"
                placeholder="Email"
                className="md:col-span-2 rounded-md border border-[var(--ink)]/10 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/10"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                aria-label="Phone"
                placeholder="Phone (10 digits)"
                className="md:col-span-2 rounded-md border border-[var(--ink)]/10 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/10"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-5">
            <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight text-[var(--ink)]">Shipping address</h2>
            {addresses.length > 0 ? (
              <>
                <div className="mb-4 space-y-2">
                  {addresses.map((addr) => (
                    <label key={addr.id} className="flex items-center gap-3 rounded-md border border-[var(--ink)]/10 bg-white px-4 py-3 text-[var(--ink)] cursor-pointer transition hover:border-[#7D1D1D]/30">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress?.id === addr.id}
                        onChange={() => applyAddress(addr)}
                      />
                      <span className="text-sm">{addr.label}: {addr.line1}, {addr.city}, {addr.state} {addr.pincode}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                aria-label="Street address"
                placeholder="Street address"
                className="md:col-span-2 rounded-md border border-[var(--ink)]/10 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/10"
              />
              <input
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                aria-label="Apartment, suite, etc. (optional)"
                placeholder="Apartment, suite, etc. (optional)"
                className="md:col-span-2 rounded-md border border-[var(--ink)]/10 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/10"
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="City"
                placeholder="City"
                className="rounded-md border border-[var(--ink)]/10 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/10"
              />
              <input
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                aria-label="State"
                placeholder="State"
                className="rounded-md border border-[var(--ink)]/10 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/10"
              />
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                inputMode="numeric"
                aria-label="PIN code"
                placeholder="PIN code (6 digits)"
                className="rounded-md border border-[var(--ink)]/10 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/10"
              />
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                aria-label="Country"
                placeholder="Country"
                className="rounded-md border border-[var(--ink)]/10 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/10"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-5">
            <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight text-[var(--ink)]">Payment</h2>
            <div className="space-y-3 text-sm text-[var(--ink)]/70">
              {[
                { value: "Cash on Delivery", label: "Cash on Delivery" },
                { value: "Razorpay", label: "Pay online (UPI / Cards / Net Banking)" },
              ].map((method) => (
                <label key={method.value} className="flex items-center gap-3 rounded-md border border-[var(--ink)]/10 bg-white px-4 py-3 text-[var(--ink)] cursor-pointer transition hover:border-[#7D1D1D]/30">
                  <input type="radio" name="payment" checked={paymentMethod === method.value} onChange={() => setPaymentMethod(method.value)} />
                  <span>{method.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-xl border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-5 font-serif text-3xl font-semibold tracking-tight text-[var(--ink)]">Order summary</h2>
          <div className="space-y-4 text-sm text-[var(--ink)]/70">
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

          <div className="mt-6 flex items-center justify-between border-t border-[var(--ink)]/10 pt-5">
            <span className="text-lg font-medium text-[var(--ink)]">Total</span>
            <span className="font-serif text-3xl font-semibold text-[#7D1D1D]">₹{total}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="mt-6 block min-h-[48px] w-full rounded-md border border-[#7D1D1D]/40 bg-[#7D1D1D] px-5 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[var(--shadow-sm)] transition hover:bg-[#641414] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:scale-100"
          >
            {isSubmitting ? "Processing order..." : "Place order"}
          </button>
        </aside>
      </div>
    </main>
  );
}
