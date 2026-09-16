"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/providers/auth-provider";

export function BottomNavigation() {
  const { isAuthenticated, userType } = useAuth();
  const pathname = usePathname();

  const accountHref = isAuthenticated
    ? userType === "admin"
      ? "/admin"
      : "/account"
    : "/login";

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Shop", icon: Sparkles },
    { href: "/cart", label: "Bag", icon: ShoppingBag },
    { href: accountHref, label: "Account", icon: UserRound },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--ink)]/10 bg-white/95 px-3 py-2 shadow-[0_-2px_12px_rgba(26,21,18,0.05)] backdrop-blur-md md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors",
                active ? "text-[#7D1D1D]" : "text-[var(--ink)]/60",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md transition-all",
                  active ? "bg-[#7D1D1D] text-white" : "text-current",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
