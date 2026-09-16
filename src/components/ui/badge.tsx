import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeTone = "maroon" | "gold" | "taupe" | "neutral" | "soldout";

const tones: Record<BadgeTone, string> = {
  maroon: "bg-[#7D1D1D] text-white",
  gold: "bg-[linear-gradient(120deg,#B8912D,#E6C866_50%,#B8912D)] text-[#3A2410]",
  taupe: "bg-[#8B7355] text-white",
  neutral: "bg-[#F5ECE2] text-[#7D1D1D] border border-[#7D1D1D]/12",
  soldout: "bg-[#8a1f1f] text-white",
};

export function Badge({
  children,
  tone = "maroon",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] shadow-sm",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
