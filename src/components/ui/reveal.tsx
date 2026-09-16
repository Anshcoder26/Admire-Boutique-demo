"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type RevealVariant = "up" | "left" | "right" | "scale";

const variantClass: Record<RevealVariant, string> = {
  up: "",
  left: "reveal-left",
  right: "reveal-right",
  scale: "reveal-scale",
};

/**
 * Scroll-reveal wrapper — fades and eases its children into view using an
 * IntersectionObserver. Pairs with the `.reveal` utilities in globals.css and
 * respects the user's reduced-motion preference (CSS neutralises the effect).
 */
export function Reveal({
  children,
  className,
  variant = "up",
  delay = 0,
  amount = 0.15,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  amount?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: amount, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [amount, once]);

  return (
    <div
      ref={ref}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      className={cn("reveal", variantClass[variant], visible && "is-visible", className)}
    >
      {children}
    </div>
  );
}
