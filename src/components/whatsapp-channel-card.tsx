import { MessageCircleMore } from "lucide-react";
import { WHATSAPP_CHANNEL_URL } from "@/lib/site-contact";

/** Invites customers to follow the store's WhatsApp Channel. Hidden until the link is set. */
export function WhatsAppChannelCard({ compact = false }: { compact?: boolean }) {
  if (!WHATSAPP_CHANNEL_URL) return null;

  if (compact) {
    return (
      <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#7D1D1D] transition-colors">
        <MessageCircleMore className="h-4 w-4 text-[#7D1D1D]" /> Follow our WhatsApp Channel
      </a>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-[#25D366]/40 bg-[#f0fbf4] p-4 text-left sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--ink)]/75">
        <span className="font-semibold text-[var(--ink)]">Get new arrivals and offers first.</span> Follow Admire Boutique on WhatsApp.
      </p>
      <a
        href={WHATSAPP_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1ebe5a]"
      >
        <MessageCircleMore className="h-4 w-4" /> Follow on WhatsApp
      </a>
    </div>
  );
}
