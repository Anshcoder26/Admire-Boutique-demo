"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LotusOrnament } from "@/components/lotus-ornament";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function Header() {
  const { isAuthenticated, isLoading, userType } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  const accountHref = isAuthenticated
    ? userType === "admin"
      ? "/admin"
      : "/account"
    : "/login";

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

    // Keyboard shortcut for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      for (const eventName of events) {
        window.removeEventListener(eventName, syncCart);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleGoToProducts = () => {
    setIsSearchOpen(false);
    router.push("/products");
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--ink)]/10 bg-white/90 backdrop-blur-sm">
        {/* Promo banner */}
        <div className="relative overflow-hidden bg-[#7D1D1D] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-white md:text-xs">
          <span className="relative z-10">
            Free shipping on orders above ₹2,499 &middot; easy 7-day returns
          </span>
        </div>

        {/* Main header */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 md:px-8 lg:px-10">
          {/* Menu button for mobile */}
          <button className="flex h-11 w-11 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-white text-[var(--ink)] hover:bg-[#faf7f2] transition md:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-1 md:flex-initial">
            <LotusOrnament className="h-10 w-10 md:h-11 md:w-11 rounded-full border border-[#7D1D1D]/30 bg-[#fff5f0] p-1" />
            <div className="hidden sm:block">
              <div className="font-serif text-xl md:text-2xl font-semibold tracking-tight text-[var(--ink)]">Admire Boutique</div>
              <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-[#7D1D1D]">Ethnic Atelier</div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)] lg:flex">
            <Link href="/products" className="hover:text-[#7D1D1D] transition">New In</Link>
            <Link href="/products" className="hover:text-[#7D1D1D] transition">Kurtis</Link>
            <Link href="/products" className="hover:text-[#7D1D1D] transition">Festive</Link>
            <Link href="/products" className="hover:text-[#7D1D1D] transition">Formals</Link>
            <Link href="/products" className="hover:text-[#7D1D1D] transition">Sale</Link>
            <Link href="/faq" className="hover:text-[#7D1D1D] transition">FAQ</Link>
            <Link href={accountHref} className="rounded-sm bg-[#7D1D1D] px-5 py-2.5 text-white hover:bg-[#671818] transition font-semibold tracking-[0.14em]">
              {isLoading ? "..." : isAuthenticated ? "Account" : "Sign in"}
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={handleSearchClick}
              className="hidden h-11 w-11 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-white text-[var(--ink)] hover:bg-[#faf7f2] transition md:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link href="/wishlist" className="flex h-11 w-11 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-white text-[var(--ink)] hover:bg-[#faf7f2] transition" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href={accountHref} className="flex h-11 w-11 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-white text-[var(--ink)] hover:bg-[#faf7f2] transition" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
            <Link href="/cart" className="relative flex h-11 w-11 items-center justify-center rounded-md bg-[#7D1D1D] text-white hover:bg-[#671818] transition" aria-label={`Cart with ${cartCount} items`}>
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-[#3a2a06]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Trending bar */}
        <div className="mx-auto hidden max-w-7xl items-center justify-center gap-4 border-t border-[var(--ink)]/8 px-4 py-2.5 md:flex md:px-8 lg:px-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7D1D1D]">Trending</span>
          <span className="h-3 w-px bg-[var(--ink)]/15" />
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--ink)]/70">Cotton kurtis</span>
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--ink)]/70">Festive edit</span>
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--ink)]/70">Formals</span>
        </div>
      </header>

      {/* Global Search Modal */}
      {isSearchOpen ? (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/40 px-4 pt-24 backdrop-blur-sm md:pt-32"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-[var(--radius-xl)] border border-[#D4AF37]/30 bg-white shadow-[var(--shadow-lg)] animate-[fade-in-up_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <span aria-hidden className="block h-1 w-full bg-[var(--gradient-gold)]" />
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="eyebrow mb-1">Explore the atelier</p>
                  <h2 className="font-serif text-2xl text-[#201614]">Search Kurtis</h2>
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#8a6f5f] transition-colors hover:bg-[#7D1D1D]/8 hover:text-[#7D1D1D]"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="mb-5 text-sm leading-relaxed text-[#5a403a]">
                Open the products page to search and filter by category, price, and rating.
              </p>

              <Button variant="primary" size="lg" fullWidth onClick={handleGoToProducts}>
                <Search className="h-4 w-4" /> Go to Products
              </Button>

              <p className="mt-4 text-center text-xs text-[#8a6f5f]">
                Tip: Press <kbd className="rounded bg-[#f3e7db] px-1.5 py-0.5 font-semibold">Ctrl</kbd>
                {" + "}
                <kbd className="rounded bg-[#f3e7db] px-1.5 py-0.5 font-semibold">K</kbd> to open search anywhere
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
