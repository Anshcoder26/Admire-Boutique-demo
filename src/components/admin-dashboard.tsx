"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell, CheckCircle2, LogOut, Package, Plus, Search, ShieldCheck, ShoppingBag, Sparkles, TrendingUp, Users } from "lucide-react";
import { LotusOrnament } from "@/components/lotus-ornament";

const initialCatalog = [
  { id: 1, name: "Saffron Grace Kurti", category: "Premium Cotton", price: "₹1,999", stock: 24, status: "Live" },
  { id: 2, name: "Lotus Bloom Anarkali", category: "Parsi Work", price: "₹2,799", stock: 12, status: "Low stock" },
  { id: 3, name: "Ivory Calm Straight Kurti", category: "Maheshwari Suits", price: "₹2,299", stock: 18, status: "Live" },
];

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const statCards = [
  { label: "Revenue", value: "₹4.8L", change: "+12.4%", accent: "bg-[#f1e2d2] text-[#5e3228]" },
  { label: "Orders", value: "1,248", change: "+8.1%", accent: "bg-[#eaf4ee] text-[#1c5d3d]" },
  { label: "Products", value: "182", change: "+14", accent: "bg-[#f8e9d7] text-[#7d5f2b]" },
  { label: "Customers", value: "9.6K", change: "+4.7%", accent: "bg-[#f3e8ea] text-[#79443d]" },
];

const activityFeed = [
  { title: "New festive kurti collection approved", meta: "2 hours ago" },
  { title: "Inventory restocked for Cotton Silk range", meta: "Today" },
  { title: "Customer review score updated to 4.9/5", meta: "Yesterday" },
];

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("owner@admireboutique.in");
  const [password, setPassword] = useState("admire123");
  const [form, setForm] = useState({
    name: "",
    category: "Premium Cotton",
    description: "",
    price: "",
    stock: "",
    fabric: "Cotton",
    images: [] as string[],
    colors: [] as Array<{ name: string; hex: string }>,
  });
  const [catalog, setCatalog] = useState(initialCatalog);
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; order_number: string; customer_name: string; status: string; total: number }>>([]);

  const totalStock = useMemo(
    () => catalog.reduce((sum, item) => sum + Number(item.stock), 0),
    [catalog],
  );

  const loadAdminData = async (token: string) => {
    try {
      const [meRes, productsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/products"),
        fetch("/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!meRes.ok) {
        window.localStorage.removeItem("admire-admin-token");
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      if (productsRes.ok) {
        const productsData = (await productsRes.json()) as Array<{ id: string; name: string; category: string; price: number; stock: number }>;
        setCatalog(
          productsData.map((product) => ({
            id: Number(product.id.replace(/\D/g, "")) || Date.now(),
            name: product.name,
            category: product.category,
            price: formatCurrency(Number(product.price)),
            stock: Number(product.stock),
            status: Number(product.stock) < 10 ? "Low stock" : "Live",
          }))
        );
      }

      if (ordersRes.ok) {
        const ordersData = (await ordersRes.json()) as { orders?: Array<{ id: string; order_number: string; customer_name: string; status: string; total: number }> };
        setRecentOrders(ordersData.orders || []);
      }
    } catch {
      window.localStorage.removeItem("admire-admin-token");
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      // First, try to get token from localStorage
      let token = window.localStorage.getItem("admire-admin-token");
      
      // If no token, check if there's an active session from unified login
      if (!token) {
        try {
          const meRes = await fetch("/api/admin/me-check");
          if (meRes.ok) {
            const meData = (await meRes.json()) as { token?: string };
            if (meData.token) {
              token = meData.token;
              window.localStorage.setItem("admire-admin-token", token);
            }
          }
        } catch {
          // Session check failed, continue
        }
      }
      
      // If we have a token now, load admin data
      if (token) {
        void loadAdminData(token);
      }
    };
    
    void checkAuth();
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json()) as { success?: boolean; error?: string; token?: string };

    if (!response.ok || !data.success || !data.token) {
      alert(data.error || "Unable to log in.");
      return;
    }

    window.localStorage.setItem("admire-admin-token", data.token);
    setIsAuthenticated(true);
    void loadAdminData(data.token);
  };

  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.price || !form.stock) return;

    const imageUrls = Array.isArray(form.images)
      ? (form.images as string[]).filter(Boolean)
      : (form.images as unknown as string)
          .split(",")
          .map((url: string) => url.trim())
          .filter(Boolean);

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      fabric: form.fabric,
      description: form.description || `${form.name} has been added via the owner dashboard.`,
      images: imageUrls.length ? imageUrls : undefined,
      colors: Array.isArray(form.colors) && form.colors.length > 0 
        ? form.colors.filter(c => c.name && c.hex)
        : undefined,
    };

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${window.localStorage.getItem("admire-admin-token") || ""}` },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = (await response.json()) as { product?: { id: string; name: string; category: string; price: number; stock: number } };
        const created = data.product;

        if (created) {
          setCatalog((current) => [
            {
              id: Number(created.id?.replace(/\D/g, "") || Date.now()),
              name: created.name,
              category: created.category,
              price: formatCurrency(Number(created.price)),
              stock: created.stock,
              status: created.stock < 10 ? "Low stock" : "Live",
            },
            ...current,
          ]);
          
          alert(`✅ Product "${form.name}" published successfully! Customers will receive a notification email.`);
        }
      } else {
        const error = (await response.json().catch(() => ({ error: "Unable to create product." }))) as { error?: string };
        alert(error.error || "Unable to create product.");
        return;
      }
    } catch (err) {
      console.error("Product creation error:", err);
      alert("Network error while creating product. Please try again.");
      return;
    }

    setForm({ name: "", category: "Premium Cotton", description: "", price: "", stock: "", fabric: "Cotton", images: [], colors: [] });
  };

  if (!isAuthenticated) {
    return (
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:px-8 lg:px-10">
        <div className="overflow-hidden rounded-[32px] border border-[#e7d9cf] bg-[#fffaf6] shadow-[0_22px_60px_rgba(51,32,27,0.08)]">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(146,98,75,0.12),_transparent_38%),linear-gradient(135deg,_#f8efe7,_#f3e5d8_40%,_#efe0d0)] p-6 md:p-10">
              <div className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-[#d7a46c]/10 blur-3xl" />
              <div className="relative space-y-6">
                <div className="flex items-center gap-3">
                  <LotusOrnament className="h-12 w-12 rounded-full border border-[#d8c3b0] bg-white/80 p-2" />
                  <div>
                    <div className="font-serif text-3xl text-[#231711]">Admire Boutique</div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-[#7f6257]">Owner portal</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">Private access</p>
                  <h1 className="max-w-sm font-serif text-5xl leading-[0.9] text-[#201614] md:text-6xl">Grow your boutique with clarity.</h1>
                  <p className="max-w-md text-base leading-7 text-[#5a4b45]">
                    Manage stock, review sales, add new dawn-to-dusk kurti drops and keep the brand booth feeling premium from day one.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "182", label: "active styles" },
                    { value: "₹4.8L", label: "monthly revenue" },
                    { value: "4.9/5", label: "customer rating" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[22px] border border-white/60 bg-white/50 p-3 backdrop-blur-sm">
                      <div className="font-serif text-2xl text-[#201614]">{item.value}</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[#7a6057]">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 lg:p-10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Welcome back</p>
                  <h2 className="mt-1 font-serif text-4xl text-[#201614]">Owner login</h2>
                </div>
                <div className="rounded-full bg-[#eaf3ee] p-2 text-[#1f6b42]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-[#7a655d]">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-[#e1d0c7] bg-[#f9f2ee] px-4 py-3 text-sm text-[#2d2421] outline-none transition focus:border-[#a76a52] focus:bg-white"
                    placeholder="owner@admireboutique.in"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-[#7a655d]">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-[#e1d0c7] bg-[#f9f2ee] px-4 py-3 text-sm text-[#2d2421] outline-none transition focus:border-[#a76a52] focus:bg-white"
                    placeholder="Enter password"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#695b54]">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-[#d9c7ba] text-[#4b1f1d]" />
                    Keep me signed in
                  </label>
                  <button type="button" className="font-medium text-[#5d2a25]">Forgot password?</button>
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4b1f1d] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4b1f1d]/20 transition hover:-translate-y-0.5"
                >
                  Access dashboard <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <LotusOrnament className="h-11 w-11 rounded-full border border-[#d7c1af] bg-white/80 p-2" />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">Brand dashboard</p>
            <h1 className="font-serif text-4xl text-[#201614] md:text-5xl">Owner dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dbc7b9] bg-white text-[#402320]">
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              window.localStorage.removeItem("admire-admin-token");
              setIsAuthenticated(false);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[#dcc5b4] bg-white px-4 py-2.5 text-sm font-medium text-[#402320]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-[28px] border border-[#eadcce] bg-white p-5 shadow-[0_16px_28px_rgba(84,58,45,0.04)]">
            <div className={`mb-4 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${card.accent}`}>
              {card.change}
            </div>
            <div className="mb-2 text-sm uppercase tracking-[0.18em] text-[#7d645a]">{card.label}</div>
            <div className="font-serif text-4xl text-[#201614]">{card.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[30px] border border-[#eadcce] bg-white p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">Catalog health</p>
                <h2 className="mt-1 font-serif text-3xl text-[#201614]">Newest in stock</h2>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full bg-[#4b1f1d] px-4 py-2 text-sm font-medium text-white">
                <Plus className="h-4 w-4" />
                Add product
              </button>
            </div>

            <div className="space-y-3">
              {catalog.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-[24px] border border-[#efe1d7] bg-[#fffaf7] p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3e7db] text-[#4b1f1d]">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-[#201614]">{item.name}</div>
                      <div className="text-xs uppercase tracking-[0.15em] text-[#7a675f]">{item.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:gap-6">
                    <div>
                      <div className="text-sm text-[#5b4a45]">{item.price}</div>
                      <div className="text-xs text-[#7a675f]">{item.stock} in stock</div>
                    </div>
                    <div className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${item.status === "Live" ? "bg-[#eaf4ee] text-[#1f6b42]" : "bg-[#fff1e6] text-[#8a5d2b]"}`}>
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#eadcce] bg-white p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">Orders</p>
                <h2 className="mt-1 font-serif text-3xl text-[#201614]">Recent purchases</h2>
              </div>
              <button className="inline-flex items-center gap-2 text-sm font-medium text-[#5d2a25]">
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-[#433a35]">
                <thead>
                  <tr className="border-b border-[#f0e2d8] text-[10px] uppercase tracking-[0.18em] text-[#7d645a]">
                    <th className="pb-3 pr-4 font-medium">Order</th>
                    <th className="pb-3 pr-4 font-medium">Customer</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-sm text-[#5a4b45]">No recent orders yet.</td>
                  </tr>
                ) : recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#f5ece5] text-[#352f2d]">
                    <td className="py-3 pr-4 font-medium">{order.order_number}</td>
                    <td className="py-3 pr-4">{order.customer_name}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-[#edf5ee] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1d6a3d]">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 font-medium">{formatCurrency(order.total)}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-[#eadcce] bg-[#fffaf7] p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)] md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">Quick actions</p>
                <h2 className="mt-1 font-serif text-3xl text-[#201614]">Add new product</h2>
              </div>
              <div className="rounded-full bg-[#f3e7db] p-2 text-[#4b1f1d]">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-[#7a655d]">Product name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm text-[#2d2421] outline-none focus:border-[#b67c60]"
                  placeholder="e.g. Rose Gold Straight Kurti"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[#7a655d]">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
                    className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm text-[#2d2421] outline-none focus:border-[#b67c60]"
                  >
                    <option>Premium Cotton</option>
                    <option>Pure Mul</option>
                    <option>Georgette</option>
                    <option>Maheshwari Suits</option>
                    <option>Parsi Work</option>
                    <option>Muslins</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[#7a655d]">Fabric</label>
                  <input
                    type="text"
                    value={form.fabric}
                    onChange={(e) => setForm((current) => ({ ...current, fabric: e.target.value }))}
                    className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm text-[#2d2421] outline-none focus:border-[#b67c60]"
                    placeholder="Cotton"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[#7a655d]">Price</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))}
                    className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm text-[#2d2421] outline-none focus:border-[#b67c60]"
                    placeholder="1999"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[#7a655d]">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((current) => ({ ...current, stock: e.target.value }))}
                    className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm text-[#2d2421] outline-none focus:border-[#b67c60]"
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-[#7a655d]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm text-[#2d2421] outline-none focus:border-[#b67c60]"
                  placeholder="Product description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-[#7a655d]">Product Photos</label>
                <div className="space-y-3">
                  {/* Drag & Drop + File Input Zone */}
                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                      const imageURLs = files.map((file) => URL.createObjectURL(file));
                      setForm((current) => ({ ...current, images: [...(current.images as string[]), ...imageURLs] }));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className="relative rounded-2xl border-2 border-dashed border-[#d4c4b8] bg-gradient-to-br from-[#faf7f3] to-[#f5ede6] p-6 transition-all hover:border-[#b67c60] hover:from-[#fff9f6] cursor-pointer"
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.currentTarget.files || []);
                        const imageURLs = files.map((file) => URL.createObjectURL(file));
                        setForm((current) => ({ ...current, images: [...(current.images as string[]), ...imageURLs] }));
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center text-center py-4">
                      <div className="text-3xl mb-2">📷</div>
                      <p className="text-sm font-medium text-[#5e3228]">Drag images here or click to browse</p>
                      <p className="text-xs text-[#8b7965] mt-1">You can also paste images (Ctrl+V)</p>
                    </div>
                  </div>

                  {/* Paste Handler */}
                  <div
                    onPaste={(e) => {
                      const items = e.clipboardData?.items;
                      if (!items) return;
                      const imageURLs: string[] = [];
                      for (let i = 0; i < items.length; i++) {
                        if (items[i].type.startsWith('image/')) {
                          const file = items[i].getAsFile();
                          if (file) {
                            imageURLs.push(URL.createObjectURL(file));
                          }
                        }
                      }
                      if (imageURLs.length > 0) {
                        setForm((current) => ({ ...current, images: [...(current.images as string[]), ...imageURLs] }));
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {Array.isArray(form.images) && form.images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-[#7a655d]">
                      Uploaded Images ({form.images.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, images: [] }))}
                      className="text-xs text-[#b67c60] hover:text-[#8b4513] transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="group relative overflow-hidden rounded-xl border-2 border-[#ead9cf] bg-white shadow-sm hover:shadow-md transition-all">
                        <img
                          src={img}
                          alt={`Preview ${idx}`}
                          className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <button
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, images: (current.images as string[]).filter((_, i) => i !== idx) }))}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                          title="Remove image"
                        >
                          ✕
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs truncate">Image {idx + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.18em] text-[#7a655d]">Add Colors</label>
                <div className="space-y-2">
                  {Array.isArray(form.colors) && form.colors.map((color, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => {
                          const updatedColors = [...form.colors];
                          updatedColors[idx].name = e.target.value;
                          setForm((current) => ({ ...current, colors: updatedColors }));
                        }}
                        className="flex-1 rounded-lg border border-[#ead9cf] bg-white px-3 py-2 text-sm text-[#2d2421] outline-none focus:border-[#b67c60]"
                        placeholder="Color name (e.g., Saffron)"
                      />
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => {
                          const updatedColors = [...form.colors];
                          updatedColors[idx].hex = e.target.value;
                          setForm((current) => ({ ...current, colors: updatedColors }));
                        }}
                        className="h-10 w-16 rounded-lg border border-[#ead9cf] cursor-pointer"
                        title="Pick a color"
                      />
                      <div
                        className="h-10 w-10 rounded-lg border-2 border-[#ead9cf]"
                        style={{ backgroundColor: color.hex }}
                      />
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, colors: (current.colors as Array<{ name: string; hex: string }>).filter((_, i) => i !== idx) }))}
                        className="px-3 py-2 bg-red-500/10 text-red-600 rounded-lg text-sm font-medium hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, colors: [...(current.colors as Array<{ name: string; hex: string }>), { name: "", hex: "#000000" }] }))}
                    className="w-full px-4 py-2 border border-dashed border-[#b67c60] rounded-lg text-[#b67c60] text-sm font-medium hover:bg-[#f8e9d7]"
                  >
                    + Add Color
                  </button>
                </div>
              </div>

              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4b1f1d] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4b1f1d]/20">
                Publish to storefront <ShoppingBag className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="rounded-[30px] border border-[#eadcce] bg-white p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">Insights</p>
                <h2 className="mt-1 font-serif text-3xl text-[#201614]">Activity</h2>
              </div>
              <div className="rounded-full bg-[#eaf3ee] p-2 text-[#1f6b42]">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-3">
              {activityFeed.map((item) => (
                <div key={item.title} className="rounded-[20px] border border-[#f1e4db] bg-[#fffaf7] p-3">
                  <div className="mb-1 flex items-center gap-2 text-[#201614]">
                    <CheckCircle2 className="h-4 w-4 text-[#1d6a3d]" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <div className="text-xs uppercase tracking-[0.12em] text-[#7a655d]">{item.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between rounded-[28px] border border-[#eadcce] bg-[#f7efe8] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4b1f1d] text-white">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-[#201614]">Store performance</div>
            <div className="text-xs uppercase tracking-[0.18em] text-[#7a655d]">{totalStock} units in inventory</div>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-[#d6c0b0] bg-white px-4 py-2 text-sm font-medium text-[#402320]">
          <Search className="h-4 w-4" />
          Search products
        </button>
      </div>
    </main>
  );
}
