"use client";

import Link from "next/link";
import { Mail, MapPin, MessageCircleMore, Phone, Camera, Video } from "lucide-react";
import { useState } from "react";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ThemeToggle } from "@/components/theme-toggle";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { FloralBelMotif } from "@/components/motifs/floral-bel-motif";
import { motifOpacity, motifColors } from "@/components/motifs/motif-utils";

export function Footer() {
  const [open, setOpen] = useState(false);
  return (
    <footer className="relative mt-0 overflow-hidden border-t border-[#e6d9cf] bg-[#f8f2ee]">
      {/* Floral Bel top border decoration */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-center hidden md:flex">
        <FloralBelMotif
          variant="horizontal"
          opacity={motifOpacity.light}
          color={motifColors.gold}
          width="85%"
        />
      </div>

      {/* Animated lotus motifs - footer corners */}
      <div className="absolute top-6 right-8 w-10 h-10 opacity-30 animate-float-elegant hidden md:block">
        <svg viewBox="0 0 60 60" className="h-full w-full">
          <path d="M30 10 C 40 15, 45 25, 45 35 C 40 40, 35 41, 30 37 C 25 41, 20 40, 15 35 C 15 25, 20 15, 30 10 Z" fill="none" stroke="#7D1D1D" strokeWidth="1.2" opacity="0.8" />
          <circle cx="30" cy="30" r="2.5" fill="#D4AF37" />
        </svg>
      </div>

      <div className="absolute bottom-12 left-5 w-12 h-12 opacity-25 animate-float-elegant hidden md:block" style={{ animationDelay: '1.5s' }}>
        <svg viewBox="0 0 60 60" className="h-full w-full">
          <path d="M30 10 C 40 15, 45 25, 45 35 C 40 40, 35 41, 30 37 C 25 41, 20 40, 15 35 C 15 25, 20 15, 30 10 Z" fill="none" stroke="#8b6b47" strokeWidth="1.5" opacity="0.7" />
          <circle cx="30" cy="30" r="3" fill="#7D1D1D" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-0 pt-12 md:px-8 lg:px-10">
        <div className="mb-8 flex items-center justify-center gap-3 text-[#7d645a]">
          <svg viewBox="0 0 100 18" className="h-4 w-16 opacity-70 hover:opacity-100 transition-opacity hover:animate-rotate-gentle">
            <path d="M8 13 C 18 6, 28 5, 38 9 C 48 14, 58 14, 68 8 C 78 2, 89 3, 92 9" className="ornament-arch" />
          </svg>
          <span className="text-[10px] uppercase tracking-[0.28em]">Crafted with tradition</span>
          <svg viewBox="0 0 100 18" className="h-4 w-16 opacity-70 hover:opacity-100 transition-opacity hover:animate-rotate-gentle" style={{ animationDelay: '0.2s' }}>
            <path d="M8 13 C 18 6, 28 5, 38 9 C 48 14, 58 14, 68 8 C 78 2, 89 3, 92 9" className="ornament-arch warm" />
          </svg>
        </div>

        <div className="mb-12 max-w-md mx-auto">
          <NewsletterSignup />
        </div>

        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="hover:animate-glow-pulse transition-all">
                <LotusOrnament className="h-11 w-11 rounded-full border border-[#d8c3b0] bg-white/80 p-1.5" />
              </div>
              <div>
                <div className="font-serif text-2xl text-[#1f1413]">Admire Boutique</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#7d645a]">Ethnic Atelier</div>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#5b4a45]">
              Contemporary Indian wear shaped for everyday confidence, from soft cotton essentials to festive statement pieces.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <circle cx="17.5" cy="6.5" r="1.5" />
                    </svg>
                  ),
                  href: "https://www.instagram.com/admire_boutique.ab/", 
                  label: "Instagram" 
                },
                { 
                  icon: (
                    <MessageCircleMore className="h-4 w-4" />
                  ),
                  href: "https://wa.me/919876543210", 
                  label: "WhatsApp" 
                },
                { 
                  icon: (
                    <Mail className="h-4 w-4" />
                  ),
                  href: "mailto:contact@admireboutique.com", 
                  label: "Email" 
                }
              ].map(({ icon, href, label }, idx) => (
                <a key={idx} href={href} target="_blank" rel="noopener noreferrer" title={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c3b8] bg-white text-[#7D1D1D] transition hover:-translate-y-1 hover:bg-[#f1e4d8] hover:animate-pulse-subtle hover:border-[#7D1D1D]">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#684d47]">Shop</h3>
            <ul className="space-y-3 text-sm text-[#5b4a45]">
              <li><Link href="/products" className="hover:text-[#7D1D1D] hover:font-semibold transition-colors">Kurtis</Link></li>
              <li><Link href="/products" className="hover:text-[#7D1D1D] hover:font-semibold transition-colors">Festive wear</Link></li>
              <li><Link href="/products" className="hover:text-[#7D1D1D] hover:font-semibold transition-colors">Office wear</Link></li>
              <li><Link href="/products" className="hover:text-[#7D1D1D] hover:font-semibold transition-colors">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#684d47]">Support</h3>
            <ul className="space-y-3 text-sm text-[#5b4a45]">
              <li><Link href="/support" className="hover:text-[#7D1D1D] hover:font-semibold transition-colors">Shipping</Link></li>
              <li><Link href="/support" className="hover:text-[#7D1D1D] hover:font-semibold transition-colors">Returns</Link></li>
              <li><Link href="/faq" className="hover:text-[#7D1D1D] hover:font-semibold transition-colors">Sizing guide</Link></li>
              <li><Link href="/faq" className="hover:text-[#7D1D1D] hover:font-semibold transition-colors">FAQs</Link></li>
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

        <div className="mb-0 mt-6 flex flex-col gap-3 border-t border-[#e0cfbf] pb-0 pt-4 text-xs uppercase tracking-[0.14em] text-[#7d645a] md:flex-row md:items-center md:justify-between">
          <p>© 2026 Admire Boutique. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Payments</Link>
          </div>
        </div>

        {/* Quick Actions Menu - Integrated in Footer */}
        <div className="mt-8 border-t border-[#e0cfbf] pt-6">
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Open quick actions"
              onClick={() => setOpen((value) => !value)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4b1f1d] text-white shadow-lg transition hover:scale-105"
            >
              <div className="flex flex-col gap-1">
                <span className="block h-0.5 w-4 rounded-full bg-white" />
                <span className="block h-0.5 w-4 rounded-full bg-white" />
                <span className="block h-0.5 w-4 rounded-full bg-white" />
              </div>
            </button>

            {open && (
              <div className="flex gap-2">
                <Link href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition">
                  <MessageCircleMore className="h-5 w-5" />
                </Link>
                <Link href="https://instagram.com" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E1306C] text-white shadow-lg hover:scale-110 transition">
                  <Camera className="h-5 w-5" />
                </Link>
                <Link href="https://facebook.com" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg hover:scale-110 transition">
                  <Video className="h-5 w-5" />
                </Link>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e7db] text-[#402320] shadow-lg">
                  <ThemeToggle />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
