"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LotusOrnament } from "@/components/lotus-ornament";

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const syncHeader = async () => {
      try {
        // Try to validate session with server
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = (await response.json()) as { user?: { name: string } };
          setIsAuthenticated(!!data.user);
        } else {
          // Check localStorage as fallback
          const token = window.localStorage.getItem("admire-user-token");
          setIsAuthenticated(Boolean(token));
        }

        // Sync cart
        const rawCart = window.localStorage.getItem("admire-cart");
        const cart = rawCart ? JSON.parse(rawCart) : [];
        setCartCount(
          Array.isArray(cart)
            ? cart.reduce((total: number, item: { quantity?: number }) => total + (item.quantity || 0), 0)
            : 0
        );
      } catch {
        const token = window.localStorage.getItem("admire-user-token");
        setIsAuthenticated(Boolean(token));
      } finally {
        setIsLoading(false);
      }
    };

    syncHeader();

    const events = ["admire-cart-updated", "admire-auth-updated", "storage", "focus", "pageshow"] as const;
    for (const eventName of events) {
      window.addEventListener(eventName, syncHeader);
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
        window.removeEventListener(eventName, syncHeader);
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
      <header className="sticky top-0 z-50 border-b border-[#7D1D1D]/20 bg-[#fffaf6]/95 backdrop-blur-sm">
        {/* Promo banner */}
        <div className="bg-[#7D1D1D] px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-white md:text-xs">
          ✨ Free shipping on orders above ₹2,499 & easy 7-day returns
        </div>

        {/* Main header */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 md:px-8 lg:px-10">
          {/* Menu button for mobile */}
          <button className="flex h-12 w-12 items-center justify-center rounded-full border border-[#7D1D1D]/30 bg-white text-[#7D1D1D] hover:bg-[#fff5f0] transition md:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-1 md:flex-initial">
            <LotusOrnament className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-[#7D1D1D]/40 bg-[#fff5f0] p-1" />
            <div className="hidden sm:block">
              <div className="font-serif text-xl md:text-2xl text-[#1f1413]">Admire Boutique</div>
              <div className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#7D1D1D]">Ethnic Atelier</div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#3a2724] lg:flex">
            <Link href="/products" className="hover:text-[#7D1D1D] transition">New In</Link>
            <Link href="/products" className="hover:text-[#7D1D1D] transition">Kurtis</Link>
            <Link href="/products" className="hover:text-[#7D1D1D] transition">Festive</Link>
            <Link href="/products" className="hover:text-[#7D1D1D] transition">Formals</Link>
            <Link href="/products" className="hover:text-[#7D1D1D] transition">Sale</Link>
            <Link href="/faq" className="hover:text-[#7D1D1D] transition">FAQ</Link>
            <Link href={isAuthenticated ? "/account" : "/login"} className="rounded-full bg-[#7D1D1D] px-4 py-2 text-white hover:bg-[#6B1D1D] transition font-semibold">
              {isLoading ? "..." : isAuthenticated ? "Account" : "Sign in"}
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={handleSearchClick}
              className="hidden h-12 w-12 items-center justify-center rounded-full border border-[#7D1D1D]/30 bg-white text-[#7D1D1D] hover:bg-[#fff5f0] transition md:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link href="/wishlist" className="flex h-12 w-12 items-center justify-center rounded-full border border-[#7D1D1D]/30 bg-white text-[#7D1D1D] hover:bg-[#fff5f0] transition" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href={isAuthenticated ? "/account" : "/login"} className="flex h-12 w-12 items-center justify-center rounded-full border border-[#7D1D1D]/30 bg-white text-[#7D1D1D] hover:bg-[#fff5f0] transition" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
            <Link href="/cart" className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#7D1D1D] text-white shadow-md hover:shadow-lg transition animate-subtle-pulse" aria-label={`Cart with ${cartCount} items`}>
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-white animate-shimmer">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Trending bar */}
        <div className="mx-auto hidden max-w-7xl items-center justify-center gap-3 border-t border-[#7D1D1D]/15 px-4 py-3 md:flex md:px-8 lg:px-10">
          <svg viewBox="0 0 120 18" className="h-4 w-20 opacity-50">
            <path d="M8 13 C 16 6, 24 5, 32 9 C 41 15, 50 14, 58 8 C 67 2, 77 2, 88 8 C 96 13, 104 13, 112 8" className="ornament-arch" stroke="#7D1D1D" strokeWidth="1.5" fill="none" />
          </svg>
          <span className="text-xs uppercase tracking-[0.25em] text-[#7D1D1D]">Trending</span>
          <span className="text-xs md:text-sm text-[#4b2b27] hidden sm:inline">Cotton kurtis</span>
          <span className="text-xs md:text-sm text-[#4b2b27] hidden sm:inline">Festive edit</span>
          <span className="text-xs md:text-sm text-[#4b2b27] hidden sm:inline">Formals</span>
          <svg viewBox="0 0 120 18" className="h-4 w-20 opacity-50">
            <path d="M8 13 C 16 6, 24 5, 32 9 C 41 15, 50 14, 58 8 C 67 2, 77 2, 88 8 C 96 13, 104 13, 112 8" className="ornament-arch warm" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      </header>

      {/* Global Search Modal */}
      {isSearchOpen ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "32px",
              padding: "24px",
              maxWidth: "600px",
              width: "calc(100% - 32px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#201614",
                  margin: 0,
                }}
              >
                Search Kurtis
              </h2>
              <button
                onClick={() => setIsSearchOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#8a6f5f",
                  padding: "8px",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <p
              style={{
                fontSize: "14px",
                color: "#5a403a",
                marginBottom: "16px",
              }}
            >
              Open the products page to search and filter by category, price, and rating.
            </p>

            <button
              onClick={handleGoToProducts}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: "50px",
                backgroundColor: "#4b1f1d",
                color: "white",
                border: "none",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Go to Products
            </button>

            <p
              style={{
                fontSize: "12px",
                color: "#8a6f5f",
                marginTop: "12px",
                textAlign: "center",
              }}
            >
              💡 Tip: Press Ctrl+K (or Cmd+K on Mac) to open search from anywhere
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
