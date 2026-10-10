import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, MessageCircleMore } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/social-icons";
import { POLICY_LINKS } from "@/components/policy-page";
import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  STORE_ADDRESS_LINES,
  STORE_MAPS_URL,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "Contact Us | Admire Boutique",
  description: "Contact Admire Boutique, Civil Lines, Moradabad: WhatsApp, Instagram, Facebook and store address.",
};

const cardClass =
  "flex items-start gap-4 rounded-lg border border-[var(--ink)]/10 bg-white p-5 transition hover:border-[#7D1D1D] hover:shadow-[var(--shadow-sm)]";

export default function ContactPage() {
  return (
    <main className="relative z-10 mx-auto max-w-4xl px-4 py-10 md:px-8 lg:px-10">
      <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-6 shadow-[var(--shadow-sm)] md:p-10">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--ink)] md:text-5xl">Contact Us</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--ink)]/70">
          Questions about an order, sizing, returns or anything else? Message us on WhatsApp for the quickest reply.
          Please share your order number if your question is about an order.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={cardClass}>
            <MessageCircleMore className="mt-0.5 h-6 w-6 shrink-0 text-[#25D366]" />
            <div>
              <div className="font-semibold text-[var(--ink)]">WhatsApp / Phone</div>
              <div className="text-sm text-[var(--ink)]/70">{WHATSAPP_DISPLAY}</div>
            </div>
          </a>

          <a href={STORE_MAPS_URL} target="_blank" rel="noopener noreferrer" className={cardClass}>
            <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-[#7D1D1D]" />
            <div>
              <div className="font-semibold text-[var(--ink)]">Store address</div>
              <div className="text-sm text-[var(--ink)]/70">
                Admire Boutique
                {STORE_ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </div>
            </div>
          </a>

          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={cardClass}>
            <InstagramIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#E1306C]" />
            <div>
              <div className="font-semibold text-[var(--ink)]">Instagram</div>
              <div className="text-sm text-[var(--ink)]/70">@admire_boutique.ab</div>
            </div>
          </a>

          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className={cardClass}>
            <FacebookIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#1877F2]" />
            <div>
              <div className="font-semibold text-[var(--ink)]">Facebook</div>
              <div className="text-sm text-[var(--ink)]/70">Admire Boutique</div>
            </div>
          </a>
        </div>

        <div className="mt-10 border-t border-[var(--ink)]/10 pt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ink)]/60">Store policies</h2>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {POLICY_LINKS.filter((link) => link.href !== "/contact").map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-[#7D1D1D] hover:underline">
                {link.label}
              </Link>
            ))}
            <Link href="/faq" className="font-medium text-[#7D1D1D] hover:underline">FAQs</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
