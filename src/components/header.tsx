"use client";

import Link from "next/link";
import { Heart, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AbLogo } from "@/components/ab-logo";
import { useAuth } from "@/providers/auth-provider";
import { categories, type Product } from "@/data/products";

export function Header() {
  const { isAuthenticated, isLoading, userType, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchProducts, setSearchProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchRetry, setSearchRetry] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const accountHref = isAuthenticated
    ? userType === "admin"
      ? "/admin"
      : "/account"
    : "/login";

  const matchingProducts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return searchProducts.slice(0, 5);

    return searchProducts
      .filter((product) =>
        [product.name, product.category, product.fabric, product.description]
          .filter(Boolean)
          .some((value) => value.toLocaleLowerCase().includes(query)),
      )
      .slice(0, 8);
  }, [searchProducts, searchQuery]);

  useEffect(() => {
    const syncCart = () => {
      try {
        const rawCart = window.localStorage.getItem("admire-cart");
        const cart = rawCart ? JSON.parse(rawCart) : [];
        setCartCount(
          Array.isArray(cart)
            ? cart.reduce((total: number, item: { quantity?: number }) => total + (item.quantity || 0), 0)
            : 0
        );
      } catch {
        setCartCount(0);
      }
    };

    syncCart();

    const events = ["admire-cart-updated", "storage", "focus", "pageshow"] as const;
    for (const eventName of events) {
      window.addEventListener(eventName, syncCart);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      for (const eventName of events) {
        window.removeEventListener(eventName, syncCart);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return;

    let cancelled = false;
    setIsLoadingProducts(true);
    setSearchError("");

    fetch("/api/products")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load products");
        return (await response.json()) as Product[];
      })
      .then((products) => {
        if (!cancelled) setSearchProducts(Array.isArray(products) ? products : []);
      })
      .catch(() => {
        if (!cancelled) setSearchError("We couldn't load products. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProducts(false);
      });

    const focusTimer = window.setTimeout(() => searchInputRef.current?.focus(), 50);
    return () => {
      cancelled = true;
      window.clearTimeout(focusTimer);
    };
  }, [isSearchOpen, searchRetry]);

  const handleSearchClick = () => {
    setSearchQuery("");
    setIsSearchOpen(true);
  };

  const handleGoToProducts = () => {
    setIsSearchOpen(false);
    const query = searchQuery.trim().toLocaleLowerCase().replace(/\s+/g, " ");
    const normalize = (value: string) =>
      value.toLocaleLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
    const singularize = (value: string) => value.replace(/s$/, "");
    const normalizedQuery = singularize(normalize(query));

    // "Suit(s)" means browse the full collection across every category.
    if (/^(all )?suits?$/.test(normalize(query))) {
      router.push("/products");
      return;
    }

    // A search for a category (or its common singular/plural form) opens
    // that category collection. Resolve from the configured categories and
    // live product data so this works for every category, not just cotton.
    const availableCategories = Array.from(
      new Set([...categories.map((category) => category.name), ...searchProducts.map((product) => product.category)]),
    );
    const categoryMatch = availableCategories.find((category) => {
      const normalizedCategory = normalize(category);
      const categoryWords = normalizedCategory.split(" ");
      return (
        singularize(normalizedCategory) === normalizedQuery ||
        categoryWords.some((word) => singularize(word) === normalizedQuery)
      );
    });

    if (categoryMatch) {
      router.push(`/products?category=${encodeURIComponent(categoryMatch)}`);
      return;
    }

    const firstMatch = matchingProducts[0];
    if (query && firstMatch) {
      router.push(`/products/${firstMatch.slug}`);
      return;
    }
    router.push("/products");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      <header className="site-chrome sticky top-0 z-50 border-b border-[var(--ink)]/10 bg-white/90 backdrop-blur-sm">
        <div className="relative overflow-hidden bg-[#7D1D1D] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-white md:text-xs">
          <span className="relative z-10">
            Free shipping on orders above ₹2,499 &middot; exchange on damaged or wrong items
          </span>
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 md:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5 flex-1 md:flex-initial">
            <AbLogo className="h-10 w-10 md:h-11 md:w-11 rounded-full border border-[#7D1D1D]/25 bg-[#fff5f0] p-1.5 text-[#7D1D1D]" />
            <div className="block">
              <div className="font-serif text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-[var(--ink)]">Admire Boutique</div>
              <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-[#7D1D1D]">Ethnic Atelier</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)] lg:flex">
            <Link href="/products" className="hover:text-[#7D1D1D] transition">New In</Link>
            <Link href="/products" className="hover:text-[#7D1D1D] transition">Suits</Link>
            <Link href="/products" className="hover:text-[#7D1D1D] transition">Festive</Link>
            <Link href="/products" className="hover:text-[#7D1D1D] transition">Sale</Link>
            <Link href="/faq" className="hover:text-[#7D1D1D] transition">FAQ</Link>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-sm border border-[var(--ink)]/15 bg-white px-5 py-2.5 text-[#7D1D1D] hover:bg-[#faf7f2] transition font-semibold tracking-[0.14em]"
              >
                Sign out
              </button>
            ) : (
              <Link href={accountHref} className="rounded-sm bg-[#7D1D1D] px-5 py-2.5 text-white hover:bg-[#671818] transition font-semibold tracking-[0.14em]">
                {isLoading ? "..." : "Sign in"}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              type="button"
              onClick={handleSearchClick}
              className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-white text-[var(--ink)] hover:bg-[#faf7f2] transition"
              aria-label="Search products"
              title="Search products"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link href="/wishlist" className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-white text-[var(--ink)] hover:bg-[#faf7f2] transition" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-white text-[var(--ink)] hover:bg-[#faf7f2] transition"
                aria-label="Sign out"
                title="Sign out"
              >
                <User className="h-5 w-5" />
              </button>
            ) : (
              <Link href={accountHref} className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-white text-[var(--ink)] hover:bg-[#faf7f2] transition" aria-label="Account">
                <User className="h-5 w-5" />
              </Link>
            )}
            <Link href="/cart" className="relative flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-md bg-[#7D1D1D] text-white hover:bg-[#671818] transition" aria-label={`Cart with ${cartCount} items`}>
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-[#3a2a06]">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="mx-auto hidden max-w-7xl items-center justify-center gap-4 border-t border-[var(--ink)]/8 px-4 py-2.5 md:flex md:px-8 lg:px-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7D1D1D]">Trending</span>
          <span className="h-3 w-px bg-[var(--ink)]/15" />
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--ink)]/70">Cotton suits</span>
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--ink)]/70">Festive edit</span>
        </div>
      </header>

      {isSearchOpen ? createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-black/40 px-4 pb-8 pt-16 backdrop-blur-sm md:pt-28"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-search-title"
            className="w-full max-w-xl overflow-hidden rounded-[var(--radius-xl)] border border-[#D4AF37]/30 bg-white shadow-[var(--shadow-lg)] animate-[fade-in-up_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <span aria-hidden className="block h-1 w-full bg-[var(--gradient-gold)]" />
            <div className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="eyebrow mb-1">Explore the atelier</p>
                  <h2 id="global-search-title" className="font-serif text-2xl text-[#201614]">Search Suits</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#8a6f5f] transition-colors hover:bg-[#7D1D1D]/8 hover:text-[#7D1D1D]"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(event) => { event.preventDefault(); handleGoToProducts(); }}>
                <label htmlFor="global-product-search" className="sr-only">Search products, fabrics, or categories</label>
                <div className="flex items-center gap-3 rounded-lg border border-[#7D1D1D]/25 bg-[#fffaf7] px-4 focus-within:border-[#7D1D1D] focus-within:ring-2 focus-within:ring-[#7D1D1D]/10">
                  <Search className="h-5 w-5 shrink-0 text-[#7D1D1D]" />
                  <input
                    ref={searchInputRef}
                    id="global-product-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search suits, fabrics, categories..."
                    className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#201614] outline-none placeholder:text-[#8a6f5f]"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")} className="text-xs font-semibold text-[#7D1D1D] hover:underline">
                      Clear
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a6f5f]">
                    {searchQuery.trim() ? "Search results" : "Popular products"}
                  </p>
                  <Link href="/products" onClick={() => setIsSearchOpen(false)} className="text-xs font-semibold text-[#7D1D1D] hover:underline">
                    Browse all
                  </Link>
                </div>

                {isLoadingProducts ? (
                  <p className="py-6 text-center text-sm text-[#8a6f5f]">Loading products...</p>
                ) : searchError ? (
                  <div className="py-5 text-center">
                    <p role="alert" className="text-sm text-[#7D1D1D]">{searchError}</p>
                    <button type="button" onClick={() => { setSearchProducts([]); setSearchRetry((attempt) => attempt + 1); }} className="mt-2 text-sm font-semibold text-[#7D1D1D] underline">
                      Try again
                    </button>
                  </div>
                ) : matchingProducts.length ? (
                  <ul className="max-h-[45vh] space-y-1 overflow-y-auto">
                    {matchingProducts.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between gap-3 rounded-md px-3 py-3 transition-colors hover:bg-[#faf4ef]"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-[#201614]">{product.name}</span>
                            <span className="mt-0.5 block truncate text-xs text-[#8a6f5f]">{product.category} · {product.fabric}</span>
                          </span>
                          <span className="shrink-0 text-sm font-semibold text-[#7D1D1D]">₹{Number(product.price).toLocaleString("en-IN")}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-[#8a6f5f]">
                    No products found for “{searchQuery.trim()}”. Try a fabric or category name.
                  </p>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-[#8a6f5f]">
                Press <kbd className="rounded bg-[#f3e7db] px-1.5 py-0.5 font-semibold">Ctrl</kbd> + <kbd className="rounded bg-[#f3e7db] px-1.5 py-0.5 font-semibold">K</kbd> to search anywhere · <kbd className="rounded bg-[#f3e7db] px-1.5 py-0.5 font-semibold">Esc</kbd> to close
              </p>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
