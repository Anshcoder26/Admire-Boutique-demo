import Link from "next/link";
import { Camera, Mail, MapPin, MessageCircleMore, Phone } from "lucide-react";
import { LotusOrnament } from "@/components/lotus-ornament";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[#e6d9cf] bg-[#f8f2ee]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:px-10">
        <div className="mb-8 flex items-center justify-center gap-3 text-[#7d645a]">
          <svg viewBox="0 0 100 18" className="h-4 w-16 opacity-70">
            <path d="M8 13 C 18 6, 28 5, 38 9 C 48 14, 58 14, 68 8 C 78 2, 89 3, 92 9" className="ornament-arch" />
          </svg>
          <span className="text-[10px] uppercase tracking-[0.28em]">Crafted with tradition</span>
          <svg viewBox="0 0 100 18" className="h-4 w-16 opacity-70">
            <path d="M8 13 C 18 6, 28 5, 38 9 C 48 14, 58 14, 68 8 C 78 2, 89 3, 92 9" className="ornament-arch warm" />
          </svg>
        </div>

        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <LotusOrnament className="h-11 w-11 rounded-full border border-[#d8c3b0] bg-white/80 p-1.5" />
              <div>
                <div className="font-serif text-2xl text-[#1f1413]">Admire Boutique</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#7d645a]">Ethnic Atelier</div>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#5b4a45]">
              Contemporary Indian wear shaped for everyday confidence, from soft cotton essentials to festive statement pieces.
            </p>
            <div className="mt-5 flex gap-3">
              {[Camera, MessageCircleMore, Mail].map((Icon, idx) => (
                <Link key={idx} href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c3b8] bg-white text-[#4b1f1d] transition hover:-translate-y-0.5 hover:bg-[#f1e4d8]">
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#684d47]">Shop</h3>
            <ul className="space-y-3 text-sm text-[#5b4a45]">
              <li><Link href="/products" className="hover:text-[#3c1d1d]">Kurtis</Link></li>
              <li><Link href="/products" className="hover:text-[#3c1d1d]">Festive wear</Link></li>
              <li><Link href="/products" className="hover:text-[#3c1d1d]">Office wear</Link></li>
              <li><Link href="/products" className="hover:text-[#3c1d1d]">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#684d47]">Support</h3>
            <ul className="space-y-3 text-sm text-[#5b4a45]">
              <li><Link href="/support" className="hover:text-[#3c1d1d]">Shipping</Link></li>
              <li><Link href="/support" className="hover:text-[#3c1d1d]">Returns</Link></li>
              <li><Link href="/faq" className="hover:text-[#3c1d1d]">Sizing guide</Link></li>
              <li><Link href="/faq" className="hover:text-[#3c1d1d]">FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#684d47]">Contact</h3>
            <ul className="space-y-3 text-sm text-[#5b4a45]">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[#6b4338]" /> 12 Saffron Lane, Bengaluru</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#6b4338]" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#6b4338]" /> hello@admireboutique.in</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[#e0cfbf] pt-5 text-xs uppercase tracking-[0.14em] text-[#7d645a] md:flex-row md:items-center md:justify-between">
          <p>© 2026 Admire Boutique. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Payments</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
