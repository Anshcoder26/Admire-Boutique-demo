"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, MapPin, PackageCheck, Truck } from "lucide-react";

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
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem("admire-user-token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    Promise.all([
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/me/orders", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/me/addresses", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([meRes, ordersRes, addressesRes]) => {
        if (!meRes.ok) {
          window.localStorage.removeItem("admire-user-token");
          window.dispatchEvent(new Event("admire-auth-updated"));
          window.location.href = "/login";
          return;
        }

        const meData = (await meRes.json()) as { user?: Customer };
        const ordersData = (await ordersRes.json()) as { orders?: Order[] };
        const addressesData = (await addressesRes.json()) as { addresses?: Address[] };

        setCustomer(meData.user || null);
        setOrders(ordersData.orders || []);
        setAddresses(addressesData.addresses || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main className="mx-auto max-w-7xl px-4 py-10 text-sm text-[#5a4b45]">Loading your account…</main>;
  }

  const defaultAddress = addresses.find((item) => item.is_default === 1) || addresses[0];

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">My account</p>
          <h1 className="font-serif text-5xl text-[#201614]">Welcome back, {customer?.name?.split(" ")[0] || "there"}.</h1>
        </div>
        <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-[#4b1f1d] px-4 py-2.5 text-sm font-medium text-white">
          Continue shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-6">
          <div className="rounded-[30px] border border-[#eadcce] bg-white p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3e7db] text-[#4b1f1d]">A</div>
              <div>
                <div className="font-medium text-[#201614]">{customer?.name}</div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#7d645a]">VIP member</div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-[#564b46]">
              <div>{customer?.email}</div>
              <div>{customer?.phone}</div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#eadcce] bg-[#fffaf7] p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)]">
            <div className="mb-4 flex items-center gap-2 text-[#5d2a25]">
              <MapPin className="h-4 w-4" />
              <h2 className="font-serif text-3xl text-[#201614]">Default address</h2>
            </div>
            {defaultAddress ? (
              <div className="space-y-2 text-sm text-[#4c3d38]">
                <div className="font-medium uppercase tracking-[0.18em] text-[#7d645a]">{defaultAddress.label}</div>
                <div>{defaultAddress.full_name}</div>
                <div>{defaultAddress.line1}</div>
                {defaultAddress.line2 ? <div>{defaultAddress.line2}</div> : null}
                <div>{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}</div>
                <div>{defaultAddress.country}</div>
              </div>
            ) : (
              <div className="text-sm text-[#5a4b45]">No addresses saved yet.</div>
            )}
            <Link href="/account/addresses" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#5d2a25]">
              Manage addresses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-[#eadcce] bg-white p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#5d2a25]">
                <PackageCheck className="h-4 w-4" />
                <h2 className="font-serif text-3xl text-[#201614]">Recent orders</h2>
              </div>
              <Link href="/account/orders" className="text-sm font-medium text-[#5d2a25]">See all</Link>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[#d9c3b8] bg-[#fffaf7] p-5 text-sm text-[#5a4b45]">No orders yet. Your latest purchases will appear here.</div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="rounded-[22px] border border-[#efe3d9] bg-[#fffaf7] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="font-medium text-[#201614]">{order.order_number}</div>
                      <span className="rounded-full bg-[#edf5ee] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1d6a3d]">{order.status}</span>
                    </div>
                    <div className="mb-3 text-sm text-[#584b46]">
                      {order.items.map((item) => `${item.name} (${item.size})`).join(" • ")}
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-[#7a645d]">
                      <span>{order.delivery_partner}</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[30px] border border-[#eadcce] bg-white p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)]">
            <div className="mb-4 flex items-center gap-2 text-[#5d2a25]">
              <Truck className="h-4 w-4" />
              <h2 className="font-serif text-3xl text-[#201614]">Delivery support</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] bg-[#f7efe8] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#5d2a25]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Courier network</span>
                </div>
                <div className="text-sm text-[#564b46]">BlueDart, Delhivery and Ekart partnerships available across India.</div>
              </div>

              <div className="rounded-[22px] bg-[#f7efe8] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#5d2a25]">
                  <PackageCheck className="h-4 w-4" />
                  <span className="font-medium">Support promise</span>
                </div>
                <div className="text-sm text-[#564b46]">Order tracking, SMS updates and fast issue resolution for every shipment.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
