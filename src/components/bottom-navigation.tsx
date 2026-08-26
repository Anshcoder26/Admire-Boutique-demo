import Link from "next/link";
import { Home, ShoppingBag, Sparkles, UserRound } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Shop", icon: Sparkles },
  { href: "/cart", label: "Bag", icon: ShoppingBag },
  { href: "/login", label: "Account", icon: UserRound },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#eadcd3] bg-[#fffaf6]/90 px-3 py-2 backdrop-blur-md md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={label} href={href} className="flex flex-col items-center gap-1 rounded-full px-2 py-2 text-[10px] font-medium text-[#4a2d27]">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
