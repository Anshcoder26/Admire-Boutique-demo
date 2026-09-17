import Image from "next/image";

export function LotusOrnament({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`lotus-ornament relative ${className}`}>
      <Image
        src="/motifs/lotus-emblem.png"
        alt=""
        fill
        sizes="48px"
        className="object-contain"
      />
    </div>
  );
}
