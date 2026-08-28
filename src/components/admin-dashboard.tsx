"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell, CheckCircle2, LogOut, Package, Plus, Search, ShieldCheck, ShoppingBag, Sparkles, Trash2, TrendingUp, Users, Edit } from "lucide-react";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ProductEditor } from "@/components/admin-product-editor";
import { OrderManagement } from "@/components/admin-order-management";
import { CustomerManagement } from "@/components/admin-customer-management";
import { categories } from "@/data/products";

const productCategories = categories.map((category) => category.name);

const STITCH_TYPES = ["Stitched", "Unstitched"] as const;

// Curated palette for common boutique colour names that aren't valid CSS keywords.
const CURATED_COLORS: Record<string, string> = {
  "lemon yellow": "#fff44f",
  "mustard": "#e1ad01",
  "maroon": "#7d1d1d",
  "rani pink": "#ff1a8c",
  "rose gold": "#b76e79",
  "peach": "#ffb59e",
  "bottle green": "#006a4e",
  "off white": "#faf9f6",
  "sky blue": "#87ceeb",
  "terracotta": "#c06a4f",
  "wine": "#722f37",
  "saffron": "#f4c430",
  "charcoal": "#36454f",
  "blush": "#de5d83",
  "mauve": "#e0b0ff",
  "emerald": "#046307",
};

// Resolve a colour name (e.g. "Lemon Yellow") to a hex value using the curated
// map first, then the browser's own CSS colour parser. Returns null if unknown.
function resolveColorHex(name: string): string | null {
  const key = name.trim().toLowerCase().replace(/\s+/g, " ");
  if (!key) return null;
  if (CURATED_COLORS[key]) return CURATED_COLORS[key];

  if (typeof document === "undefined") return null;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  const candidate = key.replace(/\s+/g, "");
  ctx.fillStyle = "#000000";
  ctx.fillStyle = candidate;
  const first = ctx.fillStyle;
  ctx.fillStyle = "#ffffff";
  ctx.fillStyle = candidate;
  const second = ctx.fillStyle;
  return first === second ? first : null;
}

type CatalogStatus = "Live" | "Low stock" | "Sold Out";
type CatalogItem = {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  isSoldOut: boolean;
  status: CatalogStatus;
};

const initialCatalog: CatalogItem[] = [
  { id: "seed-1", name: "Saffron Grace Kurti", category: "Premium Cotton", price: "₹1,999", stock: 24, isSoldOut: false, status: "Live" },
  { id: "seed-2", name: "Lotus Bloom Anarkali", category: "Georgette", price: "₹2,799", stock: 12, isSoldOut: false, status: "Live" },
  { id: "seed-3", name: "Ivory Calm Straight Kurti", category: "Pure Mul", price: "₹2,299", stock: 18, isSoldOut: false, status: "Live" },
];

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const getCatalogStatus = (stock: number, isSoldOut: boolean): CatalogStatus =>
  isSoldOut ? "Sold Out" : stock < 10 ? "Low stock" : "Live";

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
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"publish" | "products" | "orders" | "customers">("publish");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: productCategories[0] || "Premium Cotton",
    price: "",
    stock: "",
    fabric: "Cotton",
    stitchType: "" as "" | "Stitched" | "Unstitched",
    images: [] as string[],
    colors: [] as Array<{ name: string; hex: string }>,
  });
  const [colorNameInput, setColorNameInput] = useState("");
  const [colorHexInput, setColorHexInput] = useState("#c06a4f");
  const [catalog, setCatalog] = useState<CatalogItem[]>(initialCatalog);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; order_number: string; customer_name: string; status: string; total: number }>>([]);

  const totalStock = useMemo(
    () => catalog.reduce((sum, item) => sum + Number(item.stock), 0),
    [catalog],
  );

  const loadAdminData = async (token: string): Promise<boolean> => {
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
        return false;
      }

      setIsAuthenticated(true);

      if (productsRes.ok) {
        const productsData = (await productsRes.json()) as Array<{ id: string; name: string; category: string; price: number; stock: number; isSoldOut?: boolean }>;
        setCatalog(
          productsData.map((product) => ({
            id: product.id,
            name: product.name,
            category: product.category,
            price: formatCurrency(Number(product.price)),
            stock: Number(product.stock),
            isSoldOut: Boolean(product.isSoldOut),
            status: getCatalogStatus(Number(product.stock), Boolean(product.isSoldOut)),
          }))
        );
      }

      if (ordersRes.ok) {
        const ordersData = (await ordersRes.json()) as { orders?: Array<{ id: string; order_number: string; customer_name: string; status: string; total: number }> };
        setRecentOrders(ordersData.orders || []);
      }

      return true;
    } catch {
      return false;
    }
  };

  // Smoothly authenticate the owner without forcing a second login:
  // 1) reuse a real admin token from localStorage, else
  // 2) exchange the existing unified-login session cookie for an admin token.
  const bootstrapAdmin = async () => {
    const storedToken = window.localStorage.getItem("admire-admin-token");
    if (storedToken && storedToken !== "authenticated") {
      const ok = await loadAdminData(storedToken);
      if (ok) return;
    }

    try {
      const res = await fetch("/api/admin/me-check", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { token?: string };
        if (data.token) {
          window.localStorage.setItem("admire-admin-token", data.token);
          const ok = await loadAdminData(data.token);
          if (ok) return;
        }
      }
    } catch {
      // fall through to unauthenticated state
    }

    window.localStorage.removeItem("admire-admin-token");
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      await bootstrapAdmin();
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleColorNameChange = (value: string) => {
    setColorNameInput(value);
    const resolved = resolveColorHex(value);
    if (resolved) setColorHexInput(resolved);
  };

  const handleAddColor = () => {
    const name = colorNameInput.trim();
    if (!name) return;
    setForm((current) => {
      if (current.colors.some((color) => color.name.toLowerCase() === name.toLowerCase())) {
        return current;
      }
      return { ...current, colors: [...current.colors, { name, hex: colorHexInput }] };
    });
    setColorNameInput("");
    setColorHexInput("#c06a4f");
  };

  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.price || !form.stock) return;

    const imageUrls = form.images.filter(Boolean);

    // Include any colour the owner typed but didn't explicitly "Add" yet.
    const finalColors = [...form.colors];
    const pendingName = colorNameInput.trim();
    if (pendingName && !finalColors.some((color) => color.name.toLowerCase() === pendingName.toLowerCase())) {
      finalColors.push({ name: pendingName, hex: resolveColorHex(pendingName) || colorHexInput });
    }

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      fabric: form.fabric,
      stitchType: form.stitchType || undefined,
      colors: finalColors.length ? finalColors : undefined,
      description: `${form.name} has been added via the owner dashboard and is ready to be published on the storefront.`,
      images: imageUrls.length ? imageUrls : undefined,
    };

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = (await response.json()) as { product?: { id: string; name: string; category: string; price: number; stock: number; isSoldOut?: boolean } };
      const created = data.product;

      if (created) {
        setCatalog((current) => [
          {
            id: created.id,
            name: created.name,
            category: created.category,
            price: formatCurrency(Number(created.price)),
            stock: created.stock,
            isSoldOut: Boolean(created.isSoldOut),
            status: getCatalogStatus(Number(created.stock), Boolean(created.isSoldOut)),
          },
          ...current,
        ]);
      }
    } else {
      const error = (await response.json().catch(() => ({ error: "Unable to create product." }))) as { error?: string };
      alert(error.error || "Unable to create product.");
      return;
    }

    setForm({ name: "", category: productCategories[0] || "Premium Cotton", price: "", stock: "", fabric: "Cotton", stitchType: "", images: [], colors: [] });
    setColorNameInput("");
    setColorHexInput("#c06a4f");
  };

  const handleSoldOutToggle = async (productId: string, currentSoldOutStatus: boolean) => {
    const token = window.localStorage.getItem("admire-admin-token");
    if (!token) {
      alert("Session expired. Please login again.");
      setIsAuthenticated(false);
      return;
    }

    setUpdatingProductId(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}/sold-out`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isSoldOut: !currentSoldOutStatus }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        product?: { id: string; stock: number; isSoldOut?: boolean };
      };

      if (!response.ok || !data.product) {
        alert(data.error || "Unable to update sold out status.");
        return;
      }

      setCatalog((current) =>
        current.map((item) =>
          item.id === productId
            ? {
                ...item,
                isSoldOut: Boolean(data.product?.isSoldOut),
                status: getCatalogStatus(item.stock, Boolean(data.product?.isSoldOut)),
              }
            : item
        )
      );
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Delete "${productName}"? This permanently removes it from the storefront.`)) {
      return;
    }

    const token = window.localStorage.getItem("admire-admin-token");
    if (!token || token === "authenticated") {
      alert("Session expired. Please login again.");
      setIsAuthenticated(false);
      return;
    }

    setUpdatingProductId(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string; success?: boolean };

      if (!response.ok || !data.success) {
        alert(data.error || "Unable to delete product.");
        return;
      }

      setCatalog((current) => current.filter((item) => item.id !== productId));
    } finally {
      setUpdatingProductId(null);
    }
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

      {/* Tab Navigation */}
      <div className="mb-8 flex gap-2 border-b border-[#ead9cf]">
        <button
          onClick={() => setActiveTab("publish")}
          className={`px-6 py-3 font-medium transition ${
            activeTab === "publish"
              ? "border-b-2 border-[#4b1f1d] text-[#4b1f1d]"
              : "text-[#8a6f5f] hover:text-[#5a403a]"
          }`}
        >
          Publish Product
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-6 py-3 font-medium transition ${
            activeTab === "products"
              ? "border-b-2 border-[#4b1f1d] text-[#4b1f1d]"
              : "text-[#8a6f5f] hover:text-[#5a403a]"
          }`}
        >
          Edit Products
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-6 py-3 font-medium transition ${
            activeTab === "orders"
              ? "border-b-2 border-[#4b1f1d] text-[#4b1f1d]"
              : "text-[#8a6f5f] hover:text-[#5a403a]"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-6 py-3 font-medium transition ${
            activeTab === "customers"
              ? "border-b-2 border-[#4b1f1d] text-[#4b1f1d]"
              : "text-[#8a6f5f] hover:text-[#5a403a]"
          }`}
        >
          Customers
        </button>
      </div>

      {/* Publish Product Tab */}
      {activeTab === "publish" && (
        <>
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
                    <div className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      item.status === "Live"
                        ? "bg-[#eaf4ee] text-[#1f6b42]"
                        : item.status === "Sold Out"
                          ? "bg-[#ffe6e6] text-[#8a1f1f]"
                          : "bg-[#fff1e6] text-[#8a5d2b]"
                    }`}>
                      {item.status}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSoldOutToggle(item.id, item.isSoldOut)}
                      disabled={updatingProductId === item.id}
                      className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                        item.isSoldOut
                          ? "border border-[#1f6b42]/30 bg-[#eaf4ee] text-[#1f6b42]"
                          : "border border-[#8a1f1f]/30 bg-[#fff2f2] text-[#8a1f1f]"
                      } ${updatingProductId === item.id ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      {updatingProductId === item.id ? "Updating..." : item.isSoldOut ? "Mark Live" : "Mark Sold Out"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(item.id, item.name)}
                      disabled={updatingProductId === item.id}
                      aria-label={`Delete ${item.name}`}
                      title="Delete product"
                      className={`flex items-center justify-center rounded-full border border-[#8a1f1f]/30 bg-[#fff2f2] p-2 text-[#8a1f1f] transition hover:bg-[#ffe6e6] ${
                        updatingProductId === item.id ? "cursor-not-allowed opacity-60" : ""
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
                    {productCategories.map((categoryName) => (
                      <option key={categoryName} value={categoryName}>
                        {categoryName}
                      </option>
                    ))}
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
                <label className="text-[10px] uppercase tracking-[0.18em] text-[#7a655d]">Product photos</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("border-[#8a6f5f]", "bg-[#f5ede5]");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("border-[#8a6f5f]", "bg-[#f5ede5]");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("border-[#8a6f5f]", "bg-[#f5ede5]");
                    const files = Array.from(e.dataTransfer.files);
                    files.forEach((file) => {
                      if (file.type.startsWith("image/")) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          setForm((current) => ({
                            ...current,
                            images: [...current.images, base64],
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    });
                  }}
                  onPaste={(e) => {
                    const items = e.clipboardData?.items;
                    if (!items) return;
                    Array.from(items).forEach((item) => {
                      if (item.type.startsWith("image/")) {
                        const file = item.getAsFile();
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            setForm((current) => ({
                              ...current,
                              images: [...current.images, base64],
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    });
                  }}
                  className="relative rounded-2xl border-2 border-dashed border-[#d9cabe] bg-[#fffaf7] p-6 text-center transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      Array.from(e.currentTarget.files || []).forEach((file) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          setForm((current) => ({
                            ...current,
                            images: [...current.images, base64],
                          }));
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-[#5a4b45]">Drag & drop images here</div>
                    <div className="text-xs text-[#8a6f5f]">or click to browse, paste (Ctrl+V), or drag files</div>
                  </div>
                </div>
                
                {form.images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium uppercase tracking-[0.15em] text-[#7a655d]">
                        {form.images.length} image{form.images.length !== 1 ? "s" : ""} added
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, images: [] }))}
                        className="text-xs text-[#c85a4d] hover:text-[#a84640]"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {form.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="h-20 w-20 rounded-lg object-cover border border-[#e0d0c3]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setForm((current) => ({
                                ...current,
                                images: current.images.filter((_, i) => i !== idx),
                              }));
                            }}
                            className="absolute -top-2 -right-2 bg-[#c85a4d] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-[#7a655d]">Stitch type</label>
                <select
                  value={form.stitchType}
                  onChange={(e) => setForm((current) => ({ ...current, stitchType: e.target.value as "" | "Stitched" | "Unstitched" }))}
                  className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm text-[#2d2421] outline-none focus:border-[#b67c60]"
                >
                  <option value="">Not specified</option>
                  {STITCH_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-[#7a655d]">Colours</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={colorNameInput}
                    onChange={(e) => handleColorNameChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddColor();
                      }
                    }}
                    className="flex-1 rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm text-[#2d2421] outline-none focus:border-[#b67c60]"
                    placeholder="e.g. Lemon Yellow"
                  />
                  <input
                    type="color"
                    value={colorHexInput}
                    onChange={(e) => setColorHexInput(e.target.value)}
                    className="h-11 w-12 shrink-0 cursor-pointer rounded-xl border border-[#ead9cf] bg-white"
                    aria-label="Pick colour shade"
                    title="Pick or fine-tune the shade"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="shrink-0 rounded-full bg-[#4b1f1d] px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
                <p className="text-[11px] text-[#8a6f5f]">Type a colour name — the swatch auto-fills. Adjust the shade with the picker if needed.</p>
                {form.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.colors.map((color, idx) => (
                      <span key={`${color.name}-${idx}`} className="inline-flex items-center gap-2 rounded-full border border-[#ead9cf] bg-white py-1 pl-1.5 pr-2 text-xs text-[#3a2b26]">
                        <span className="h-5 w-5 rounded-full border border-[#e0d0c3]" style={{ backgroundColor: color.hex }} />
                        {color.name}
                        <button
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, colors: current.colors.filter((_, i) => i !== idx) }))}
                          className="text-[#c85a4d] hover:text-[#a84640]"
                          aria-label={`Remove ${color.name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
        </>
      )}

      {/* Products Tab - Edit Existing Products */}
      {activeTab === "products" && (
        <div className="rounded-[30px] border border-[#eadcce] bg-white p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)] md:p-6">
          <div className="mb-6">
            <h2 className="font-serif text-3xl text-[#201614]">Edit Products</h2>
            <p className="text-sm text-[#8a6f5f] mt-2">Click on a product to edit its details</p>
          </div>

          <div className="space-y-3">
            {catalog.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-[24px] border border-[#efe1d7] bg-[#fffaf7] p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3e7db] text-[#4b1f1d] shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[#201614] truncate">{item.name}</div>
                    <div className="text-xs uppercase tracking-[0.15em] text-[#7a675f]">{item.category}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 md:justify-end flex-wrap">
                  <div className="flex gap-4 text-right">
                    <div>
                      <div className="text-sm text-[#5b4a45]">{item.price}</div>
                      <div className="text-xs text-[#7a675f]">{item.stock} in stock</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingProductId(item.id)}
                    className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#4b1f1d] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d1815] transition"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && adminToken && (
        <div className="rounded-[30px] border border-[#eadcce] bg-white p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)] md:p-6">
          <h2 className="font-serif text-3xl text-[#201614] mb-6">Orders Management</h2>
          <OrderManagement token={adminToken} />
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && adminToken && (
        <div className="rounded-[30px] border border-[#eadcce] bg-white p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)] md:p-6">
          <h2 className="font-serif text-3xl text-[#201614] mb-6">Customer Management</h2>
          <CustomerManagement token={adminToken} />
        </div>
      )}

      {/* Product Editor Modal */}
      {editingProductId && adminToken && (
        <ProductEditor
          token={adminToken}
          productId={editingProductId}
          onClose={() => setEditingProductId(null)}
          onSave={() => setEditingProductId(null)}
        />
      )}

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
