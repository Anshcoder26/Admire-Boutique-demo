import type { ReactNode } from "react";
import Link from "next/link";
import { STORE_ADDRESS_LINES, WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site-contact";

export const POLICY_LAST_UPDATED = "11 October 2026";

export type PolicySection = { heading: string; body: ReactNode };

export const POLICY_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/refund-policy", label: "Cancellation & Refunds" },
  { href: "/shipping-policy", label: "Shipping & Delivery" },
  { href: "/contact", label: "Contact Us" },
];

export function PolicyPage({
  title,
  intro,
  sections,
  currentHref,
}: {
  title: string;
  intro?: ReactNode;
  sections: PolicySection[];
  currentHref: string;
}) {
  return (
    <main className="relative z-10 mx-auto max-w-4xl px-4 py-10 md:px-8 lg:px-10">
      <nav aria-label="Store policies" className="mb-8 flex flex-wrap gap-2">
        {POLICY_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={link.href === currentHref ? "page" : undefined}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
              link.href === currentHref
                ? "border-[#7D1D1D] bg-[#7D1D1D] text-white"
                : "border-[var(--ink)]/15 bg-white text-[var(--ink)]/70 hover:border-[#7D1D1D] hover:text-[#7D1D1D]"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <article className="rounded-xl border border-[var(--ink)]/10 bg-white p-6 shadow-[var(--shadow-sm)] md:p-10">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--ink)] md:text-5xl">{title}</h1>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--ink)]/50">Last updated: {POLICY_LAST_UPDATED}</p>
        {intro ? <div className="mt-6 text-sm leading-7 text-[var(--ink)]/75">{intro}</div> : null}

        <div className="mt-8 space-y-8">
          {sections.map((section, index) => (
            <section key={section.heading}>
              <h2 className="mb-3 text-lg font-semibold text-[var(--ink)]">
                {index + 1}. {section.heading}
              </h2>
              <div className="space-y-3 text-sm leading-7 text-[var(--ink)]/75 [&_a]:font-medium [&_a]:text-[#7D1D1D] [&_a]:underline [&_li]:ml-5 [&_li]:list-disc">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}

/** Store name, address and WhatsApp, for policy pages. */
export function StoreContactDetails() {
  return (
    <address className="not-italic">
      <strong className="text-[var(--ink)]">Admire Boutique</strong>
      <br />
      {STORE_ADDRESS_LINES.map((line) => (
        <span key={line}>
          {line}
          <br />
        </span>
      ))}
      India
      <br />
      WhatsApp / Phone:{" "}
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
        {WHATSAPP_DISPLAY}
      </a>
    </address>
  );
}
