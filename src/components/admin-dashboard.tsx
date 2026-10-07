"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, LogOut, Package, Plus, Search, ShieldCheck, ShoppingBag, Sparkles, Trash2, TrendingUp, Users, Edit } from "lucide-react";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ProductEditor } from "@/components/admin-product-editor";
import { OrderManagement } from "@/components/admin-order-management";
import { CustomerManagement } from "@/components/admin-customer-management";
import { categories } from "@/data/products";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/auth-provider";

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

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const getCatalogStatus = (stock: number, isSoldOut: boolean): CatalogStatus =>
  isSoldOut ? "Sold Out" : stock < 10 ? "Low stock" : "Live";

type AdminStats = { revenue: number; orders: number; customers: number };
type RecentOrder = { id: string; order_number: string; customer_name: string; status: string; payment_status?: string; total: number; created_at?: string };

const ORDER_STATUS_STYLES: Record<string, string> = {
  "Awaiting Payment": "bg-[#fff4e5] text-[#8a4b00]",
  Confirmed: "bg-[#fff1e6] text-[#8a5d2b]",
  Packed: "bg-[#eef2fb] text-[#2f4f8a]",
  Shipped: "bg-[#f3ecfa] text-[#5d2f8a]",
  Delivered: "bg-[#edf5ee] text-[#1d6a3d]",
  Cancelled: "bg-[#ffe6e6] text-[#8a1f1f]",
};
const getOrderStatusStyle = (status: string) => ORDER_STATUS_STYLES[status] ?? "bg-[var(--ink)]/8 text-[var(--ink)]/70";

const formatOrderDate = (value?: string) => {
  if (!value) return "";
  // SQLite returns "YYYY-MM-DD HH:MM:SS" in UTC without a zone marker.
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
};

export function AdminDashboard() {
  const toast = useToast();
  const { logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const addProductNameRef = useRef<HTMLInputElement>(null);
  const productSearchRef = useRef<HTMLInputElement>(null);

  const totalStock = useMemo(
    () => catalog.reduce((sum, item) => sum + Number(item.stock), 0),
    [catalog],
  );

  const filteredCatalog = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return catalog;
    return catalog.filter(
      (item) => item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)
    );
  }, [catalog, productSearch]);

  const statCards = [
    { label: "Revenue", value: stats ? formatCurrency(stats.revenue) : "—" },
    { label: "Orders", value: stats ? stats.orders.toLocaleString("en-IN") : "—" },
    { label: "Products", value: catalogLoaded ? catalog.length.toLocaleString("en-IN") : "—" },
    { label: "Customers", value: stats ? stats.customers.toLocaleString("en-IN") : "—" },
  ];

  const applyProducts = (productsData: Array<{ id: string; name: string; category: string; price: number; stock: number; isSoldOut?: boolean }>) => {
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
    setCatalogLoaded(true);
  };

  const reloadCatalog = async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) applyProducts(await res.json());
    } catch {
      toast.error("Unable to refresh the product list.");
    }
  };

  const openAddProductForm = () => {
    setActiveTab("publish");
    requestAnimationFrame(() => {
      addProductNameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      addProductNameRef.current?.focus({ preventScroll: true });
    });
  };

  const openProductSearch = () => {
    setActiveTab("products");
    requestAnimationFrame(() => productSearchRef.current?.focus());
  };

  const loadAdminData = async (): Promise<boolean> => {
    try {
      const [meRes, productsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/me", {
          credentials: "include",
        }),
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/admin/orders", {
          credentials: "include",
        }),
      ]);

      if (!meRes.ok) {
        return false;
      }

      setIsAuthenticated(true);
      setAdminToken("cookie");

      if (productsRes.ok) {
        applyProducts(await productsRes.json());
      }

      if (ordersRes.ok) {
        const ordersData = (await ordersRes.json()) as { orders?: RecentOrder[]; stats?: AdminStats };
        setRecentOrders(ordersData.orders || []);
        if (ordersData.stats) setStats(ordersData.stats);
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
    // 1) An existing httpOnly admin session cookie authenticates us directly.
    if (await loadAdminData()) return;

    // 2) Otherwise exchange a unified-login session cookie for an admin
    //    session cookie, then load again.
    try {
      const res = await fetch("/api/admin/me-check", { credentials: "include" });
      if (res.ok && (await loadAdminData())) return;
    } catch {
      // fall through to unauthenticated state
    }

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
      toast.error(data.error || "Unable to log in.");
      return;
    }

    setIsAuthenticated(true);
    setAdminToken("cookie");
    window.dispatchEvent(new Event("admire-auth-updated"));
    void loadAdminData();
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
      credentials: "include",
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
        toast.success(`"${created.name}" is now live on the storefront.`);
      }
    } else {
      const error = (await response.json().catch(() => ({ error: "Unable to create product." }))) as { error?: string };
      toast.error(error.error || "Unable to create product.");
      return;
    }

    setForm({ name: "", category: productCategories[0] || "Premium Cotton", price: "", stock: "", fabric: "Cotton", stitchType: "", images: [], colors: [] });
    setColorNameInput("");
    setColorHexInput("#c06a4f");
  };

  const handleSoldOutToggle = async (productId: string, currentSoldOutStatus: boolean) => {
    setUpdatingProductId(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}/sold-out`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isSoldOut: !currentSoldOutStatus }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        product?: { id: string; stock: number; isSoldOut?: boolean };
      };

      if (!response.ok || !data.product) {
        toast.error(data.error || "Unable to update sold out status.");
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

    setUpdatingProductId(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string; success?: boolean };

      if (!response.ok || !data.success) {
        toast.error(data.error || "Unable to delete product.");
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
        <div className="overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-white shadow-[var(--shadow-lg)]">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden bg-[#7D1D1D] p-6 text-white md:p-10">
              <div className="relative space-y-6">
                <div className="flex items-center gap-3">
                  <LotusOrnament className="h-12 w-12 rounded-md border border-white/30 bg-white/10 p-2" />
                  <div>
                    <div className="font-serif text-3xl font-semibold tracking-tight text-white">Admire Boutique</div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[#E9C766]">Owner portal</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E9C766]">Private access</p>
                  <h1 className="max-w-sm font-serif text-5xl font-semibold leading-[0.9] tracking-tight text-white md:text-6xl">Grow your boutique with clarity.</h1>
                  <p className="max-w-md text-base leading-7 text-white/75">
                    Manage stock, review sales, add new dawn-to-dusk kurti drops and keep the brand booth feeling premium from day one.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {["Publish new styles", "Track every order", "Know your customers"].map((label) => (
                    <div key={label} className="rounded-lg border border-white/20 bg-white/10 p-3">
                      <CheckCircle2 className="mb-2 h-4 w-4 text-[#E9C766]" />
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/80">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 lg:p-10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7D1D1D]">Welcome back</p>
                  <h2 className="mt-1 font-serif text-4xl font-semibold tracking-tight text-[var(--ink)]">Owner login</h2>
                </div>
                <div className="rounded-md bg-[#7D1D1D]/8 p-2 text-[#7D1D1D]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]/60">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-[var(--ink)]/15 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/20"
                    placeholder="owner@admireboutique.in"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]/60">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-[var(--ink)]/15 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/20"
                    placeholder="Enter password"
                  />
                </div>

                <p className="text-xs text-[var(--ink)]/60">
                  You&apos;ll stay signed in on this device for 30 days. Forgot your password? Contact your site administrator to reset it.
                </p>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#7D1D1D] px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-all hover:bg-[#641414]"
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
          <LotusOrnament className="h-11 w-11 rounded-md border border-[#7D1D1D]/25 bg-[#fff5f0] p-2" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]">Brand dashboard</p>
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--ink)] md:text-5xl">Owner dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              await logout();
              setAdminToken(null);
              setIsAuthenticated(false);
            }}
            className="inline-flex items-center gap-2 rounded-md border border-[var(--ink)]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[#faf7f2]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 inline-flex flex-wrap gap-1 rounded-md border border-[var(--ink)]/10 bg-[var(--panel-alt)] p-1">
        {([
          { key: "publish", label: "Publish Product" },
          { key: "products", label: "Edit Products" },
          { key: "orders", label: "Orders" },
          { key: "customers", label: "Customers" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] transition-all ${
              activeTab === tab.key
                ? "bg-[#7D1D1D] text-white"
                : "text-[var(--ink)]/60 hover:text-[#7D1D1D]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Publish Product Tab */}
      {activeTab === "publish" && (
        <>
          <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
          <div key={card.label} className="rounded-lg border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)]">
            <div className="mb-2 text-sm uppercase tracking-[0.18em] text-[var(--ink)]/60">{card.label}</div>
            <div className="font-serif text-4xl text-[var(--ink)]">{card.value}</div>
          </div>
        ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--ink)]/60">Catalog health</p>
                <h2 className="mt-1 font-serif text-3xl text-[var(--ink)]">Newest in stock</h2>
              </div>
              <button
                type="button"
                onClick={openAddProductForm}
                className="inline-flex items-center gap-2 rounded-md bg-[#7D1D1D] px-4 py-2 text-sm font-medium text-white"
              >
                <Plus className="h-4 w-4" />
                Add product
              </button>
            </div>

            <div className="space-y-3">
              {!catalogLoaded ? (
                <p className="py-4 text-sm text-[var(--ink)]/70">Loading catalog…</p>
              ) : catalog.length === 0 ? (
                <p className="py-4 text-sm text-[var(--ink)]/70">No products yet. Publish your first style using the form.</p>
              ) : null}
              {catalog.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-[var(--ink)]/10 bg-white p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#7D1D1D]/8 text-[#7D1D1D]">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-[var(--ink)]">{item.name}</div>
                      <div className="text-xs uppercase tracking-[0.15em] text-[var(--ink)]/60">{item.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:gap-6">
                    <div>
                      <div className="text-sm text-[var(--ink)]/70">{item.price}</div>
                      <div className="text-xs text-[var(--ink)]/60">{item.stock} in stock</div>
                    </div>
                    <div className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
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
                      className={`rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
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
                      className={`flex items-center justify-center rounded-md border border-[#8a1f1f]/30 bg-[#fff2f2] p-2 text-[#8a1f1f] transition hover:bg-[#ffe6e6] ${
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

          <div className="rounded-lg border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--ink)]/60">Orders</p>
                <h2 className="mt-1 font-serif text-3xl text-[var(--ink)]">Recent purchases</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#7D1D1D]"
              >
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-[var(--ink)]/80">
                <thead>
                  <tr className="border-b border-[var(--ink)]/10 text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/60">
                    <th className="pb-3 pr-4 font-medium">Order</th>
                    <th className="pb-3 pr-4 font-medium">Customer</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-sm text-[var(--ink)]/70">No recent orders yet.</td>
                  </tr>
                ) : recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[var(--ink)]/10 text-[var(--ink)]">
                    <td className="py-3 pr-4 font-medium">{order.order_number}</td>
                    <td className="py-3 pr-4">{order.customer_name}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getOrderStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                      {order.payment_status === "Refund Due" ? (
                        <span className="ml-2 rounded-md bg-[#ffe6e6] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a1f1f]">
                          Refund due
                        </span>
                      ) : null}
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
          <div className="rounded-lg border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)] md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--ink)]/60">Quick actions</p>
                <h2 className="mt-1 font-serif text-3xl text-[var(--ink)]">Add new product</h2>
              </div>
              <div className="rounded-md bg-[#7D1D1D]/8 p-2 text-[#7D1D1D]">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/60">Product name</label>
                <input
                  ref={addProductNameRef}
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[#7D1D1D]"
                  placeholder="e.g. Rose Gold Straight Kurti"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/60">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
                    className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[#7D1D1D]"
                  >
                    {productCategories.map((categoryName) => (
                      <option key={categoryName} value={categoryName}>
                        {categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/60">Fabric</label>
                  <input
                    type="text"
                    value={form.fabric}
                    onChange={(e) => setForm((current) => ({ ...current, fabric: e.target.value }))}
                    className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[#7D1D1D]"
                    placeholder="Cotton"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/60">Price</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))}
                    className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[#7D1D1D]"
                    placeholder="1999"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/60">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((current) => ({ ...current, stock: e.target.value }))}
                    className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[#7D1D1D]"
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/60">Product photos</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("border-[#7D1D1D]", "bg-[#7D1D1D]/5");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("border-[#7D1D1D]", "bg-[#7D1D1D]/5");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("border-[#7D1D1D]", "bg-[#7D1D1D]/5");
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
                  className="relative rounded-md border-2 border-dashed border-[var(--ink)]/15 bg-white p-6 text-center transition-colors cursor-pointer"
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
                    <div className="text-sm font-medium text-[var(--ink)]/70">Drag & drop images here</div>
                    <div className="text-xs text-[var(--ink)]/60">or click to browse, paste (Ctrl+V), or drag files</div>
                  </div>
                </div>
                
                {form.images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--ink)]/60">
                        {form.images.length} image{form.images.length !== 1 ? "s" : ""} added
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, images: [] }))}
                        className="text-xs text-[#7D1D1D] hover:text-[#7D1D1D]"
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
                            className="h-20 w-20 rounded-lg object-cover border border-[var(--ink)]/12"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setForm((current) => ({
                                ...current,
                                images: current.images.filter((_, i) => i !== idx),
                              }));
                            }}
                            className="absolute -top-2 -right-2 bg-[#7D1D1D] text-white rounded-md w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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
                <label className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/60">Stitch type</label>
                <select
                  value={form.stitchType}
                  onChange={(e) => setForm((current) => ({ ...current, stitchType: e.target.value as "" | "Stitched" | "Unstitched" }))}
                  className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[#7D1D1D]"
                >
                  <option value="">Not specified</option>
                  {STITCH_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/60">Colours</label>
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
                    className="flex-1 rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[#7D1D1D]"
                    placeholder="e.g. Lemon Yellow"
                  />
                  <input
                    type="color"
                    value={colorHexInput}
                    onChange={(e) => setColorHexInput(e.target.value)}
                    className="h-11 w-12 shrink-0 cursor-pointer rounded-xl border border-[var(--ink)]/12 bg-white"
                    aria-label="Pick colour shade"
                    title="Pick or fine-tune the shade"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="shrink-0 rounded-md bg-[#7D1D1D] px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
                <p className="text-[11px] text-[var(--ink)]/60">Type a colour name — the swatch auto-fills. Adjust the shade with the picker if needed.</p>
                {form.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.colors.map((color, idx) => (
                      <span key={`${color.name}-${idx}`} className="inline-flex items-center gap-2 rounded-md border border-[var(--ink)]/12 bg-white py-1 pl-1.5 pr-2 text-xs text-[var(--ink)]">
                        <span className="h-5 w-5 rounded-md border border-[var(--ink)]/12" style={{ backgroundColor: color.hex }} />
                        {color.name}
                        <button
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, colors: current.colors.filter((_, i) => i !== idx) }))}
                          className="text-[#7D1D1D] hover:text-[#7D1D1D]"
                          aria-label={`Remove ${color.name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#7D1D1D] px-5 py-3.5 text-sm font-semibold text-white ">
                Publish to storefront <ShoppingBag className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--ink)]/60">Insights</p>
                <h2 className="mt-1 font-serif text-3xl text-[var(--ink)]">Activity</h2>
              </div>
              <div className="rounded-md bg-[#eaf3ee] p-2 text-[#1f6b42]">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-[var(--ink)]/70">No activity yet. New orders will appear here.</p>
              ) : recentOrders.map((order) => (
                <div key={order.id} className="rounded-lg border border-[var(--ink)]/10 bg-white p-3">
                  <div className="mb-1 flex items-center gap-2 text-[var(--ink)]">
                    <CheckCircle2 className="h-4 w-4 text-[#1d6a3d]" />
                    <span className="font-medium">
                      {order.customer_name} placed {order.order_number} · {formatCurrency(order.total)}
                    </span>
                  </div>
                  <div className="text-xs uppercase tracking-[0.12em] text-[var(--ink)]/60">
                    {[order.status, formatOrderDate(order.created_at)].filter(Boolean).join(" · ")}
                  </div>
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
        <div className="rounded-lg border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)] md:p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-3xl text-[var(--ink)]">Edit Products</h2>
              <p className="text-sm text-[var(--ink)]/60 mt-2">Click on a product to edit its details</p>
            </div>
            <label className="relative block md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/50" />
              <input
                ref={productSearchRef}
                type="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by name or category"
                aria-label="Search products"
                className="w-full rounded-md border border-[var(--ink)]/15 bg-white py-2.5 pl-9 pr-3 text-sm text-[var(--ink)] outline-none focus:border-[#7D1D1D]"
              />
            </label>
          </div>

          <div className="space-y-3">
            {catalogLoaded && filteredCatalog.length === 0 ? (
              <p className="py-4 text-sm text-[var(--ink)]/70">
                {productSearch ? `No products match "${productSearch}".` : "No products yet."}
              </p>
            ) : null}
            {filteredCatalog.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-[var(--ink)]/10 bg-white p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#7D1D1D]/8 text-[#7D1D1D] shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--ink)] truncate">{item.name}</div>
                    <div className="text-xs uppercase tracking-[0.15em] text-[var(--ink)]/60">{item.category}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 md:justify-end flex-wrap">
                  <div className="flex gap-4 text-right">
                    <div>
                      <div className="text-sm text-[var(--ink)]/70">{item.price}</div>
                      <div className="text-xs text-[var(--ink)]/60">{item.stock} in stock</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingProductId(item.id)}
                    className="shrink-0 inline-flex items-center gap-2 rounded-md bg-[#7D1D1D] px-4 py-2 text-sm font-medium text-white hover:bg-[#641414] transition"
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
        <div className="rounded-lg border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)] md:p-6">
          <h2 className="font-serif text-3xl text-[var(--ink)] mb-6">Orders Management</h2>
          <OrderManagement token={adminToken} />
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && adminToken && (
        <div className="rounded-lg border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)] md:p-6">
          <h2 className="font-serif text-3xl text-[var(--ink)] mb-6">Customer Management</h2>
          <CustomerManagement token={adminToken} />
        </div>
      )}

      {/* Product Editor Modal */}
      {editingProductId && adminToken && (
        <ProductEditor
          token={adminToken}
          productId={editingProductId}
          onClose={() => setEditingProductId(null)}
          onSave={() => {
            setEditingProductId(null);
            void reloadCatalog();
          }}
        />
      )}

      <div className="mt-6 flex items-center justify-between rounded-lg border border-[var(--ink)]/10 bg-[var(--panel-alt)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#7D1D1D] text-white">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--ink)]">Store performance</div>
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--ink)]/60">{totalStock} units in inventory</div>
          </div>
        </div>
        <button
          type="button"
          onClick={openProductSearch}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--ink)]/15 bg-white px-4 py-2 text-sm font-medium text-[var(--ink)]"
        >
          <Search className="h-4 w-4" />
          Search products
        </button>
      </div>
    </main>
  );
}
