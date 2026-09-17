import Image from "next/image";

/**
 * Hand-illustrated brand motifs supplied by our designer. These are real
 * artwork (painted lotus + peacock) rather than the line-art SVG bootis, so we
 * render them as decorative <Image> layers.
 *
 * The source PNGs have a transparent background (the original cream ground was
 * chroma-keyed out), so they render correctly on any section colour — light
 * ivory or dark maroon — with a plain `normal` blend. A radial feather mask
 * softens the edges so there is never a hard square boundary.
 */
export type ArtMotifName = "lotus" | "peacock";

const SRC: Record<ArtMotifName, string> = {
  lotus: "/motifs/lotus-emblem.png",
  peacock: "/motifs/peacock.png",
};

const ALT: Record<ArtMotifName, string> = {
  lotus: "Hand-painted lotus motif",
  peacock: "Hand-painted peacock motif",
};

interface ArtMotifProps {
  motif: ArtMotifName;
  /** Rendered box size in px (square) on md+ screens. */
  size?: number;
  /** Optional smaller box size in px on mobile (< md). Defaults to `size`. */
  mobileSize?: number;
  /** Final visible opacity (keep these visible: 0.4–0.9). */
  opacity?: number;
  /** Blend against the section background. Transparent art uses "normal". */
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
  mobileSize,
  opacity = 0.6,
  blend = "normal",
  feather = true,
  className = "",
  flip = false,
  priority = false,
}: ArtMotifProps) {
  const featherMask = feather
    ? "radial-gradient(closest-side, #000 62%, transparent 100%)"
    : undefined;

  const mSize = mobileSize ?? size;

  return (
    <div
      aria-hidden="true"
      className={`art-motif pointer-events-none select-none ${className}`}
      style={{
        // Consumed by the .art-motif rule in globals.css: smaller on mobile,
        // full size on md+ screens.
        ["--am-size" as string]: `${size}px`,
        ["--am-msize" as string]: `${mSize}px`,
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
