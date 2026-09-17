"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, MapPin, PackageCheck, Truck } from "lucide-react";
import { ArtMotif } from "@/components/motifs/art-motif";

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

type OrderItem = {
  name: string;
  size: string;
  qty: number;
  price: number;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  payment_status: string;
  payment_method: string;
  delivery_partner: string;
  tracking_id: string;
  estimated_delivery: string;
  items: OrderItem[];
};

export function AccountDashboard() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = window.localStorage.getItem("admire-user-token");
    if (!token) {
      router.push('/login');
      return;
    }

    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }),
      fetch("/api/me/orders", { credentials: "include" }),
      fetch("/api/me/addresses", { credentials: "include" }),
    ])
      .then(async ([meRes, ordersRes, addressesRes]) => {
        if (!active) return;
        if (!meRes.ok) {
          console.error("[ACCOUNT] Me endpoint failed:", meRes.status);
          window.localStorage.removeItem("admire-user-token");
          window.dispatchEvent(new Event("admire-auth-updated"));
          router.push('/login');
          return;
        }

        const meData = (await meRes.json()) as { user?: Customer };
        const ordersData = ordersRes.ok ? ((await ordersRes.json()) as { orders?: Order[] }) : { orders: [] };
        const addressesData = addressesRes.ok ? ((await addressesRes.json()) as { addresses?: Address[] }) : { addresses: [] };

        if (!active) return;
        setCustomer(meData.user || null);
        setOrders(ordersData.orders || []);
        setAddresses(addressesData.addresses || []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("[ACCOUNT] Error loading account data:", err);
        window.localStorage.removeItem("admire-user-token");
        router.push('/login');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <main className="mx-auto max-w-7xl px-4 py-10 text-sm text-[var(--ink)]/70">Loading your account…</main>;
  }

  const defaultAddress = addresses.find((item) => item.is_default === 1) || addresses[0];

  return (
    <div className="relative overflow-hidden">
      <ArtMotif motif="peacock" size={360} mobileSize={160} opacity={0.4} flip className="absolute -left-16 top-16 z-0 md:top-24 xl:-left-24" />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]">My account</p>
          <h1 className="font-serif text-5xl font-semibold tracking-tight text-[var(--ink)]">Welcome back, {customer?.name?.split(" ")[0] || "there"}.</h1>
        </div>
        <Link href="/products" className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#7D1D1D] px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#641414]">
          Continue shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-6">
          <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--background)] text-[#7D1D1D]">A</div>
              <div>
                <div className="font-medium text-[var(--ink)]">{customer?.name}</div>
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--ink)]/50">VIP member</div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-[var(--ink)]/70">
              <div>{customer?.email}</div>
              <div>{customer?.phone}</div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)]">
            <div className="mb-4 flex items-center gap-2 text-[#7D1D1D]">
              <MapPin className="h-4 w-4" />
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink)]">Default address</h2>
            </div>
            {defaultAddress ? (
              <div className="space-y-2 text-sm text-[var(--ink)]/70">
                <div className="font-medium uppercase tracking-[0.18em] text-[var(--ink)]/50">{defaultAddress.label}</div>
                <div>{defaultAddress.full_name}</div>
                <div>{defaultAddress.line1}</div>
                {defaultAddress.line2 ? <div>{defaultAddress.line2}</div> : null}
                <div>{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}</div>
                <div>{defaultAddress.country}</div>
              </div>
            ) : (
              <div className="text-sm text-[var(--ink)]/70">No addresses saved yet.</div>
            )}
            <Link href="/account/addresses" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#7D1D1D]">
              Manage addresses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#7D1D1D]">
                <PackageCheck className="h-4 w-4" />
                <h2 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink)]">Recent orders</h2>
              </div>
              <Link href="/account/orders" className="text-sm font-medium text-[#7D1D1D]">See all</Link>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--ink)]/15 bg-white p-5 text-sm text-[var(--ink)]/70">No orders yet. Your latest purchases will appear here.</div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="rounded-lg border border-[var(--ink)]/10 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="font-medium text-[var(--ink)]">{order.order_number}</div>
                      <span className="rounded-md bg-[#edf5ee] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1d6a3d]">{order.status}</span>
                    </div>
                    <div className="mb-3 text-sm text-[var(--ink)]/70">
                      {order.items.map((item) => `${item.name} (${item.size})`).join(" • ")}
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-[var(--ink)]/50">
                      <span>{order.delivery_partner}</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)]">
            <div className="mb-4 flex items-center gap-2 text-[#7D1D1D]">
              <Truck className="h-4 w-4" />
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink)]">Delivery support</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-[var(--background)] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#7D1D1D]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Courier network</span>
                </div>
                <div className="text-sm text-[var(--ink)]/70">BlueDart, Delhivery and Ekart partnerships available across India.</div>
              </div>

              <div className="rounded-lg bg-[var(--background)] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#7D1D1D]">
                  <PackageCheck className="h-4 w-4" />
                  <span className="font-medium">Support promise</span>
                </div>
                <div className="text-sm text-[var(--ink)]/70">Order tracking, SMS updates and fast issue resolution for every shipment.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </div>
  );
}
