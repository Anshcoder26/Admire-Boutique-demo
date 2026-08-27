export function LotusOrnament({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`lotus-ornament ${className}`}>
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <path d="M60 18 C 78 25, 90 42, 90 58 C 80 66, 68 67, 60 60 C 52 67, 40 66, 30 58 C 30 42, 42 25, 60 18 Z" className="lotus-petal" />
        <path d="M60 30 C 70 40, 76 50, 76 60 C 70 66, 64 68, 60 64 C 56 68, 50 66, 44 60 C 44 50, 50 40, 60 30 Z" className="lotus-petal warm" />
        <path d="M60 44 C 66 57, 68 74, 60 88 C 52 74, 54 57, 60 44 Z" className="lotus-center" />
        <path d="M18 62 C 34 55, 46 58, 60 72 C 46 78, 35 82, 18 82 C 20 73, 18 68, 18 62 Z" className="lotus-petal soft" />
        <path d="M102 62 C 86 55, 74 58, 60 72 C 74 78, 85 82, 102 82 C 100 73, 102 68, 102 62 Z" className="lotus-petal soft" />
      </svg>
    </div>
  );
}
