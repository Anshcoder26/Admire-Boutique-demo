import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Seamless horizontal marquee. Renders the item set twice so the CSS
 * translateX(-50%) loop is continuous. Pauses on hover and honours
 * reduced-motion (see globals.css).
 */
export function Marquee({
  items,
  duration = 32,
  className,
  separator,
}: {
  items: ReactNode[];
  duration?: number;
  className?: string;
  separator?: ReactNode;
}) {
  const row = (
    <div className="marquee__track" aria-hidden={false}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-10">
          {item}
          {separator ?? <span aria-hidden className="opacity-40">✦</span>}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn("marquee", className)}
      style={{ ["--marquee-duration" as string]: `${duration}s` }}
    >
      {row}
      <div className="marquee__track" aria-hidden>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            {item}
            {separator ?? <span aria-hidden className="opacity-40">✦</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
