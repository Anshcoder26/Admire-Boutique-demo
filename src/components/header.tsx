"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { LotusOrnament } from "@/components/lotus-ornament";

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const syncHeader = () => {
      try {
        const token = window.localStorage.getItem("admire-user-token");
        setIsAuthenticated(Boolean(token));

        const rawCart = window.localStorage.getItem("admire-cart");
        const cart = rawCart ? JSON.parse(rawCart) : [];
        setCartCount(
          Array.isArray(cart)
            ? cart.reduce((total: number, item: { quantity?: number }) => total + (item.quantity || 0), 0)
            : 0
        );
      } catch {
        setIsAuthenticated(false);
        setCartCount(0);
      }
    };

    syncHeader();

    const events = ["admire-cart-updated", "admire-auth-updated", "storage", "focus", "pageshow"] as const;
    for (const eventName of events) {
      window.addEventListener(eventName, syncHeader);
    }

    return () => {
      for (const eventName of events) {
        window.removeEventListener(eventName, syncHeader);
      }
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7d9cf] bg-[#fffaf6]/90 backdrop-blur-md">
      <div className="bg-[#3d1d1d] px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[#f5e9e0] md:text-xs">
        Free shipping on orders above ₹2,499 & easy 7-day returns
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8 lg:px-10">
        <div className="flex items-center gap-2 md:hidden">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dbc7b9] bg-white text-[#3d1d1d]">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <Link href="/" className="flex items-center gap-3">
          <LotusOrnament className="h-11 w-11 rounded-full border border-[#d8c3b0] bg-white/70 p-1" />
          <div>
            <div className="font-serif text-2xl text-[#1f1413]">Admire Boutique</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#8d7069]">Ethnic Atelier</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#3a2724] lg:flex">
          <Link href="/products" className="hover:text-[#6b2d2a]">New In</Link>
          <Link href="/products" className="hover:text-[#6b2d2a]">Kurtis</Link>
          <Link href="/products" className="hover:text-[#6b2d2a]">Festive</Link>
          <Link href="/products" className="hover:text-[#6b2d2a]">Formals</Link>
          <Link href="/products" className="hover:text-[#6b2d2a]">Sale</Link>
          <Link href="/faq" className="hover:text-[#6b2d2a]">FAQ</Link>
          <Link href={isAuthenticated ? "/account" : "/login"} className="rounded-full bg-[#4b1f1d] px-3 py-1.5 text-white hover:bg-[#5e2a28]">{isAuthenticated ? "Account" : "Sign in"}</Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#dbc7b9] bg-white text-[#402320] md:flex">
            <Search className="h-4 w-4" />
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dbc7b9] bg-white text-[#402320]">
            <Heart className="h-4 w-4" />
          </button>
          <Link href={isAuthenticated ? "/account" : "/login"} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dbc7b9] bg-white text-[#402320]" aria-label="Account">
            <User className="h-4 w-4" />
          </Link>
          <Link href="/cart" className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#4b1f1d] text-white shadow-lg shadow-[#4b1f1d]/20">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#c48341] text-[10px] font-semibold text-white">{cartCount}</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto hidden max-w-7xl items-center justify-center gap-3 border-t border-[#f0e2d8] px-4 py-3 md:flex md:px-8 lg:px-10">
        <svg viewBox="0 0 120 18" className="h-4 w-20 opacity-70">
          <path d="M8 13 C 16 6, 24 5, 32 9 C 41 15, 50 14, 58 8 C 67 2, 77 2, 88 8 C 96 13, 104 13, 112 8" className="ornament-arch" />
        </svg>
        <span className="text-xs uppercase tracking-[0.25em] text-[#7d685d]">Trending</span>
        <span className="text-sm text-[#4b2b27]">Cotton kurtis</span>
        <span className="text-sm text-[#4b2b27]">Festive edit</span>
        <span className="text-sm text-[#4b2b27]">Formals</span>
        <svg viewBox="0 0 120 18" className="h-4 w-20 opacity-70">
          <path d="M8 13 C 16 6, 24 5, 32 9 C 41 15, 50 14, 58 8 C 67 2, 77 2, 88 8 C 96 13, 104 13, 112 8" className="ornament-arch warm" />
        </svg>
      </div>
    </header>
  );
}
