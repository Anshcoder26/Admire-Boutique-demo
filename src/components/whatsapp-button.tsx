import Link from "next/link";
import { MessageCircleMore } from "lucide-react";

export function WhatsAppButton() {
  return (
    <Link
      href="https://wa.me/919999999999"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-8 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1a5d3f] text-white shadow-[0_18px_45px_rgba(26,93,63,0.4)] transition-transform hover:scale-105 md:bottom-8 md:right-8"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircleMore className="h-6 w-6" />
    </Link>
  );
}
