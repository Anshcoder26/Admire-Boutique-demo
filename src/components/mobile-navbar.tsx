import Link from "next/link";
import { Heart, Search, ShoppingBag, User } from "lucide-react";

export function MobileNavbar() {
  return (
    <div className="flex items-center justify-between gap-2 rounded-[22px] border border-[#eadcd3] bg-white/90 p-2 shadow-[0_12px_26px_rgba(84,58,45,0.06)] md:hidden">
      <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f0eb] text-[#4d261f]">
        <Search className="h-4 w-4" />
      </button>
      <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f0eb] text-[#4d261f]">
        <Heart className="h-4 w-4" />
      </button>
      <Link href="/cart" className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#4b1f1d] text-white">
        <ShoppingBag className="h-4 w-4" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c48341] text-[8px] font-semibold text-white">2</span>
      </Link>
      <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f0eb] text-[#4d261f]">
        <User className="h-4 w-4" />
      </button>
    </div>
  );
}
