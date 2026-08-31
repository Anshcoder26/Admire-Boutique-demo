'use client';

import { PaisleyMotif } from '../motifs/paisley-motif';
import { LotusOrnament } from '../lotus-ornament';
import { motifOpacity, motifColors } from '../motifs/motif-utils';

interface MotifHeadingProps {
  children: React.ReactNode;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  motif?: 'paisley' | 'lotus' | 'none';
  motifPosition?: 'left' | 'right' | 'both';
  motifColor?: string;
  motifOpacity?: number;
  className?: string;
  subtitle?: React.ReactNode;
}

/**
 * Heading with Motif Accents
 * Provides consistent heading styling with optional decorative motifs
 * Common use case: Section titles, collection headers
 */
export function MotifHeading({
  children,
  level = 'h2',
  motif = 'paisley',
  motifPosition = 'left',
  motifColor = motifColors.currentColor,
  motifOpacity: opacity = motifOpacity.light,
  className = '',
  subtitle,
}: MotifHeadingProps) {
  const HeadingTag = level;

  const headingSizeClass = {
    h1: 'text-4xl md:text-5xl lg:text-6xl',
    h2: 'text-3xl md:text-4xl lg:text-5xl',
    h3: 'text-2xl md:text-3xl lg:text-4xl',
    h4: 'text-xl md:text-2xl lg:text-3xl',
    h5: 'text-lg md:text-xl lg:text-2xl',
    h6: 'text-base md:text-lg lg:text-xl',
  }[level];

  const motifElement = motif === 'paisley' ? (
    <PaisleyMotif
      size="sm"
      opacity={opacity}
      color={motifColor}
      variant="outline"
    />
  ) : motif === 'lotus' ? (
    <div className="w-6 h-6" style={{ opacity }}>
      <LotusOrnament className="w-full h-full" />
    </div>
  ) : null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {(motifPosition === 'left' || motifPosition === 'both') && motifElement}

        <HeadingTag className={`font-serif text-[#201614] font-medium ${headingSizeClass}`}>
          {children}
        </HeadingTag>

        {(motifPosition === 'right' || motifPosition === 'both') && motifElement}
      </div>

      {subtitle && (
        <p className="text-center text-sm md:text-base text-[#8a6f5f] tracking-wider uppercase font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Section Heading with Decorative Underline
 * Combines heading with floral bel underline
 */
export function SectionHeading({
  children,
  subtitle,
  className = '',
  level = 'h2' as const,
}: {
  children: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4';
}) {
  const HeadingTag = level;

  const headingSizeClass = {
    h1: 'text-5xl md:text-6xl',
    h2: 'text-4xl md:text-5xl',
    h3: 'text-3xl md:text-4xl',
    h4: 'text-2xl md:text-3xl',
  }[level];

  return (
    <div className={`text-center space-y-4 ${className}`}>
      <HeadingTag className={`font-serif text-[#201614] ${headingSizeClass}`}>
        {children}
      </HeadingTag>

      {subtitle && (
        <p className="text-[#8a6f5f] tracking-wider uppercase text-xs md:text-sm font-medium">
          {subtitle}
        </p>
      )}

      {/* Decorative underline - simple line */}
      <div className="flex justify-center">
        <div
          className="h-px w-16 md:w-24"
          style={{
            background: 'linear-gradient(to right, transparent, #D4AF37, transparent)',
          }}
        />
      </div>
    </div>
  );
}

/**
 * Category Label with Motif
 * Used for collection/category names with leading motif
 */
export function CategoryLabel({
  label,
  motifColor = motifColors.currentColor,
  className = '',
}: {
  label: string;
  motifColor?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <PaisleyMotif
        size="xs"
        opacity={motifOpacity.medium}
        color={motifColor}
        variant="filled"
      />
      <span className="text-xs md:text-sm font-medium uppercase tracking-[0.15em] text-[#8a6f5f]">
        {label}
      </span>
    </div>
  );
}

/**
 * Featured Section Title
 * Larger, more prominent title with multiple motifs
 */
export function FeaturedTitle({
  children,
  description,
  className = '',
}: {
  children: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-6 text-center py-8 ${className}`}>
      <div className="flex justify-center gap-4">
        <PaisleyMotif
          size="md"
          opacity={motifOpacity.medium}
          color={motifColors.gold}
        />
        <div className="flex flex-col justify-center">
          <h2 className="font-serif text-4xl md:text-5xl text-[#201614]">
            {children}
          </h2>
        </div>
        <PaisleyMotif
          size="md"
          opacity={motifOpacity.medium}
          color={motifColors.gold}
        />
      </div>

      {description && (
        <p className="text-[#8a6f5f] max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
