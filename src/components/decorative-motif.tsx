interface MotifProps {
  className?: string;
  color?: string;
  variant?: "lotus" | "flower" | "diamond" | "star";
}

export function DecorativeMotif({
  className = "w-8 h-8",
  color = "currentColor",
  variant = "lotus",
}: MotifProps) {
  if (variant === "lotus") {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" stroke={color} strokeWidth="1.5">
        {/* Lotus petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <ellipse
            key={angle}
            cx="50"
            cy="50"
            rx="20"
            ry="35"
            transform={`rotate(${angle} 50 50)`}
            opacity="0.8"
          />
        ))}
        {/* Center circle */}
        <circle cx="50" cy="50" r="8" fill={color} />
      </svg>
    );
  }

  if (variant === "flower") {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" stroke={color} strokeWidth="1.5">
        {/* Petals */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="50"
            cy="50"
            rx="16"
            ry="28"
            transform={`rotate(${angle} 50 50)`}
            opacity="0.7"
          />
        ))}
        {/* Center */}
        <circle cx="50" cy="50" r="10" fill={color} opacity="0.6" />
      </svg>
    );
  }

  if (variant === "diamond") {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" stroke={color} strokeWidth="1.5">
        {/* Four petals diamond shape */}
        <path d="M 50 15 L 70 50 L 50 85 L 30 50 Z" />
        {/* Inner details */}
        <line x1="50" y1="30" x2="50" y2="70" />
        <line x1="35" y1="50" x2="65" y2="50" />
        <circle cx="50" cy="50" r="8" fill={color} opacity="0.4" />
      </svg>
    );
  }

  // star variant
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke={color} strokeWidth="1.5">
      {/* Star petals */}
      {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle) => (
        <line
          key={angle}
          x1="50"
          y1="50"
          x2={50 + 30 * Math.cos((angle - 90) * (Math.PI / 180))}
          y2={50 + 30 * Math.sin((angle - 90) * (Math.PI / 180))}
          opacity="0.7"
        />
      ))}
      {/* Center ornament */}
      <circle cx="50" cy="50" r="6" fill={color} />
    </svg>
  );
}

export function MotifDivider({ className = "w-full h-12" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
      <DecorativeMotif className="w-6 h-6" color="#D4AF37" variant="lotus" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
    </div>
  );
}

export function MotifCorner({
  position = "top-left",
  className = "",
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}) {
  const positionClass = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  }[position];

  const rotation = {
    "top-left": "",
    "top-right": "rotate-90",
    "bottom-left": "-rotate-90",
    "bottom-right": "rotate-180",
  }[position];

  return (
    <div className={`absolute ${positionClass} ${rotation} ${className}`}>
      <svg viewBox="0 0 40 40" className="w-12 h-12 opacity-40" fill="none" stroke="#D4AF37" strokeWidth="0.8">
        <path d="M 35 5 L 35 20 M 20 5 L 5 5 L 5 20" strokeLinecap="round" />
        <circle cx="30" cy="10" r="2" fill="#D4AF37" opacity="0.6" />
      </svg>
    </div>
  );
}
