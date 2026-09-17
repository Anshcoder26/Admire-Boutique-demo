"use client";

import Link from "next/link";
import { Mail, MapPin, MessageCircleMore, Phone, Camera, Video } from "lucide-react";
import { useState } from "react";
import { AbLogo } from "@/components/ab-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { MotifTile } from "@/components/motifs/motif-tile";
import { ArtMotif } from "@/components/motifs/art-motif";

export function Footer() {
  const [open, setOpen] = useState(false);
  return (
    <footer className="relative isolate mt-0 overflow-hidden border-t border-[var(--ink)]/10 bg-white">
      {/* Designer lotus, tiled as a subtle suit-fabric texture */}
      <MotifTile motif="lotus" opacity={0.22} mobileOpacity={0.14} size={150} className="-z-10" />
      {/* Designer peacock resting in the corner of the footer */}
      <ArtMotif
        motif="peacock"
        size={420}
        mobileSize={200}
        opacity={0.5}
        className="absolute bottom-0 right-[-60px] z-0 lg:right-[-90px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-14 md:px-8 md:pb-0 lg:px-10">
        <div className="mb-8 flex items-center justify-center gap-3 text-[#7D1D1D]">
          <span className="h-px w-10 bg-[var(--ink)]/15" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">Crafted with tradition</span>
          <span className="h-px w-10 bg-[var(--ink)]/15" />
        </div>

        <div className="mb-12 max-w-md mx-auto">
          <NewsletterSignup />
        </div>

        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <AbLogo className="h-11 w-11 rounded-full border border-[#7D1D1D]/25 bg-[#fff5f0] p-1.5 text-[#7D1D1D]" />
              <div>
                <div className="font-serif text-2xl font-semibold tracking-tight text-[var(--ink)]">Admire Boutique</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#7D1D1D]">Ethnic Atelier</div>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[var(--ink)]/70">
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
                <a key={idx} href={href} target="_blank" rel="noopener noreferrer" title={label} className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-white text-[#7D1D1D] transition hover:-translate-y-0.5 hover:border-[#7D1D1D] hover:bg-[#fff5f0]">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]">Shop</h3>
            <ul className="space-y-3 text-sm text-[var(--ink)]/70">
              <li><Link href="/products" className="hover:text-[#7D1D1D] transition-colors">Kurtis</Link></li>
              <li><Link href="/products" className="hover:text-[#7D1D1D] transition-colors">Festive wear</Link></li>
              <li><Link href="/products" className="hover:text-[#7D1D1D] transition-colors">Office wear</Link></li>
              <li><Link href="/products" className="hover:text-[#7D1D1D] transition-colors">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]">Support</h3>
            <ul className="space-y-3 text-sm text-[var(--ink)]/70">
              <li><Link href="/support" className="hover:text-[#7D1D1D] transition-colors">Shipping</Link></li>
              <li><Link href="/support" className="hover:text-[#7D1D1D] transition-colors">Returns</Link></li>
              <li><Link href="/faq" className="hover:text-[#7D1D1D] transition-colors">Sizing guide</Link></li>
              <li><Link href="/faq" className="hover:text-[#7D1D1D] transition-colors">FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]">Contact</h3>
            <ul className="space-y-3 text-sm text-[var(--ink)]/70">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[#7D1D1D]" /> 12 Saffron Lane, Bengaluru</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#7D1D1D]" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#7D1D1D]" /> hello@admireboutique.in</li>
            </ul>
          </div>
        </div>

        <div className="mb-0 mt-6 flex flex-col gap-3 border-t border-[var(--ink)]/10 pb-0 pt-4 text-xs uppercase tracking-[0.14em] text-[var(--ink)]/60 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Admire Boutique. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-[#7D1D1D] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#7D1D1D] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#7D1D1D] transition-colors">Payments</Link>
          </div>
        </div>

        {/* Quick Actions Menu - Integrated in Footer */}
        <div className="mt-8 border-t border-[var(--ink)]/10 pt-6">
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Open quick actions"
              onClick={() => setOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-md bg-[#7D1D1D] text-white transition hover:bg-[#671818]"
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
