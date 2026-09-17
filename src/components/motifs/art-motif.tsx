import Image from "next/image";

/**
 * Hand-illustrated brand motifs supplied by our designer. These are real
 * artwork (painted lotus + peacock) rather than the line-art SVG bootis, so we
 * render them as decorative <Image> layers.
 *
 * The source PNGs sit on a warm cream ground. On light/ivory sections we use
 * `mix-blend-mode: multiply` so that cream ground drops away and only the
 * painted motif remains, and we feather the edges with a radial mask so there
 * is never a hard square boundary.
 */
export type ArtMotifName = "lotus" | "peacock";

const SRC: Record<ArtMotifName, string> = {
  lotus: "/motifs/lotus.png",
  peacock: "/motifs/peacock.png",
};

const ALT: Record<ArtMotifName, string> = {
  lotus: "Hand-painted lotus motif",
  peacock: "Hand-painted peacock motif",
};

interface ArtMotifProps {
  motif: ArtMotifName;
  /** Rendered box size in px (square). */
  size?: number;
  /** Final visible opacity (keep these visible: 0.4–0.9). */
  opacity?: number;
  /** Blend against the section background. Use "multiply" on light grounds. */
  blend?: "multiply" | "normal";
  /** Feather the edges into the background so the cream ground has no hard edge. */
  feather?: boolean;
  /** Extra positioning / sizing classes (absolute placement, responsive hiding). */
  className?: string;
  /** Flip horizontally (useful to mirror the peacock to the other side). */
  flip?: boolean;
  priority?: boolean;
}

export function ArtMotif({
  motif,
  size = 220,
  opacity = 0.6,
  blend = "multiply",
  feather = true,
  className = "",
  flip = false,
  priority = false,
}: ArtMotifProps) {
  const featherMask = feather
    ? "radial-gradient(closest-side, #000 62%, transparent 100%)"
    : undefined;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{
        width: size,
        height: size,
        opacity,
        mixBlendMode: blend,
        transform: flip ? "scaleX(-1)" : undefined,
        WebkitMaskImage: featherMask,
        maskImage: featherMask,
      }}
    >
      <Image
        src={SRC[motif]}
        alt={ALT[motif]}
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full object-contain"
        sizes={`${size}px`}
      />
    </div>
  );
}
