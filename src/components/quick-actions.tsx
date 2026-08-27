"use client";

import Link from "next/link";
import { Camera, MessageCircle, Video } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export function QuickActionsMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 left-4 z-50 md:bottom-8 md:left-8">
      <div className={`mb-3 flex flex-col gap-2 transition-all ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}>
        <Link href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30">
          <MessageCircle className="h-4 w-4" />
        </Link>
        <Link href="https://instagram.com" target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E1306C] text-white shadow-lg shadow-[#E1306C]/30">
          <Camera className="h-4 w-4" />
        </Link>
        <Link href="https://facebook.com" target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg shadow-[#1877F2]/30">
          <Video className="h-4 w-4" />
        </Link>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3e7db] text-[#402320] shadow-lg shadow-[#d7bca7]/20">
          <ThemeToggle />
        </div>
      </div>

      <button
        type="button"
        aria-label="Open quick actions"
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4b1f1d] text-white shadow-[0_16px_35px_rgba(75,31,29,0.25)] transition hover:scale-[1.02]"
      >
        <div className="flex flex-col gap-1.5">
          <span className="block h-0.5 w-5 rounded-full bg-white" />
          <span className="block h-0.5 w-5 rounded-full bg-white" />
          <span className="block h-0.5 w-5 rounded-full bg-white" />
        </div>
      </button>
    </div>
  );
}
