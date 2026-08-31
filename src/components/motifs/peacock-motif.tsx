'use client';

import { motifSize, motifColors } from './motif-utils';

interface PeacockMotifProps {
  className?: string;
  color?: string;
  size?: 'md' | 'lg' | 'xl';
  variant?: 'simple' | 'detailed'; // simple = silhouette, detailed = with feathers
}

/**
 * Peacock Motif Component
 * Elegant Indian peacock in line art style - textile/embroidery inspired
 * Use sparingly as a statement piece (1-2 places max)
 * Perfect for festive collections or premium banners
 */
export function PeacockMotif({
  className = '',
  color = motifColors.primary,
  size = 'lg',
  variant = 'detailed',
}: PeacockMotifProps) {
  const sizeValue = motifSize[size];

  if (variant === 'simple') {
    // Silhouette peacock - more minimalist
    return (
      <div
        aria-hidden="true"
        className={`motif-peacock-simple ${className}`}
        style={{
          width: sizeValue,
          height: sizeValue,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Head and neck */}
          <circle cx="50" cy="30" r="6" />
          <line x1="50" y1="36" x2="50" y2="50" strokeWidth="2" />

          {/* Crest on head */}
          <path d="M 48 26 L 46 18 L 50 24 L 54 18 L 52 26" />

          {/* Body */}
          <ellipse cx="50" cy="60" rx="12" ry="16" />

          {/* Legs */}
          <line x1="46" y1="76" x2="46" y2="90" />
          <line x1="54" y1="76" x2="54" y2="90" />

          {/* Tail feathers - simplified arc pattern */}
          <path d="M 62 55 Q 75 45, 85 35" />
          <path d="M 62 60 Q 80 60, 90 55" />
          <path d="M 62 65 Q 75 75, 85 85" />

          {/* Feather eye spots on tail */}
          <circle cx="75" cy="45" r="2" opacity="0.6" />
          <circle cx="82" cy="55" r="2" opacity="0.6" />
          <circle cx="75" cy="75" r="2" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // Detailed peacock with more ornate feathers
  return (
    <div
      aria-hidden="true"
      className={`motif-peacock-detailed ${className}`}
      style={{
        width: sizeValue,
        height: sizeValue,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full"
        fill="none"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Head and neck */}
        <circle cx="60" cy="35" r="7" />
        <line x1="60" y1="42" x2="60" y2="58" strokeWidth="2" />

        {/* Crest feathers */}
        <path d="M 58 31 L 55 18 M 60 28 L 60 15 M 62 31 L 65 18" strokeWidth="1.2" />

        {/* Body */}
        <ellipse cx="60" cy="70" rx="14" ry="18" />

        {/* Legs with feet */}
        <line x1="54" y1="88" x2="54" y2="108" />
        <line x1="66" y1="88" x2="66" y2="108" />
        <path d="M 52 108 L 54 108 L 56 108" strokeLinecap="round" />
        <path d="M 64 108 L 66 108 L 68 108" strokeLinecap="round" />

        {/* Decorative body pattern */}
        <circle cx="60" cy="70" r="8" opacity="0.5" />

        {/* Elaborate tail feathers with eye spots */}
        {/* Upper tail arc */}
        <path d="M 74 65 Q 95 35, 105 20" opacity="0.7" />
        <circle cx="95" cy="35" r="3" opacity="0.6" />
        <circle cx="103" cy="22" r="2.5" opacity="0.5" />

        {/* Middle tail arc */}
        <path d="M 74 70 Q 100 70, 115 75" opacity="0.7" />
        <circle cx="100" cy="68" r="3" opacity="0.6" />
        <circle cx="113" cy="75" r="2.5" opacity="0.5" />

        {/* Lower tail arc */}
        <path d="M 74 75 Q 95 105, 105 120" opacity="0.7" />
        <circle cx="95" cy="105" r="3" opacity="0.6" />
        <circle cx="103" cy="118" r="2.5" opacity="0.5" />

        {/* Wing suggestion */}
        <path d="M 60 60 Q 48 65, 45 80" opacity="0.5" strokeWidth="1" />

        {/* Decorative dots on body */}
        <circle cx="55" cy="75" r="1.5" opacity="0.4" />
        <circle cx="65" cy="75" r="1.5" opacity="0.4" />
        <circle cx="60" cy="65" r="1.5" opacity="0.4" />
      </svg>
    </div>
  );
}

/**
 * Peacock Statement Banner
 * Container component for featuring peacock in prominent location
 */
export function PeacockStatementBanner({
  children,
  className = '',
  peacockSize = 'xl' as const,
  peacockColor = motifColors.primary,
  peacockPosition = 'left' as const,
}: {
  children: React.ReactNode;
  className?: string;
  peacockSize?: 'md' | 'lg' | 'xl';
  peacockColor?: string;
  peacockPosition?: 'left' | 'right' | 'center';
}) {
  const alignClass = {
    left: 'flex-row',
    right: 'flex-row-reverse',
    center: 'flex-col',
  }[peacockPosition];

  return (
    <div
      className={`flex items-center justify-center gap-8 ${alignClass} ${className}`}
    >
      <PeacockMotif
        size={peacockSize}
        color={peacockColor}
        variant="detailed"
        className="flex-shrink-0"
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}

/**
 * Festive collection header with peacock
 */
export function FestiveCollectionHeader({
  title,
  subtitle,
  className = '',
  peacockColor = motifColors.saffron,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  peacockColor?: string;
}) {
  return (
    <div
      className={`text-center py-12 ${className}`}
    >
      <div className="flex justify-center mb-6">
        <PeacockMotif
          size="xl"
          color={peacockColor}
          variant="detailed"
        />
      </div>

      <h2 className="text-4xl md:text-5xl font-serif text-[#201614] mb-2">
        {title}
      </h2>

      {subtitle && (
        <p className="text-[#8a6f5f] tracking-wider uppercase text-sm">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Premium collection badge with peacock
 */
export function PremiumCollectionBadge({
  label = 'Premium Collection',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#D4AF37] rounded-full ${className}`}
      style={{
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
      }}
    >
      <PeacockMotif
        size="sm"
        color={motifColors.gold}
        variant="simple"
      />
      <span className="font-serif text-sm font-medium text-[#7D1D1D]">
        {label}
      </span>
      <PeacockMotif
        size="sm"
        color={motifColors.gold}
        variant="simple"
      />
    </div>
  );
}
