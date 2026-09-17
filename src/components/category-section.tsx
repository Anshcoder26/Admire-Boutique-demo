import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/products";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ArtMotif } from "@/components/motifs/art-motif";

export function CategorySection() {
  return (
    <Section spacing="md" className="relative overflow-hidden">
      {/* Designer peacock guarding the category grid (desktop only) */}
      <ArtMotif
        motif="peacock"
        size={360}
        opacity={0.5}
        flip
        className="absolute left-[-120px] top-24 z-0 hidden xl:block"
      />
      <div className="relative z-10">
      <SectionHeader
        eyebrow="Curated categories"
        title="Shop by mood"
        action={
          <ButtonLink href="/products" variant="ghost" size="sm" className="hidden md:inline-flex">
            Explore all
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category, i) => (
          <Reveal key={category.name} variant="up" delay={i * 80}>
          <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="group block h-full overflow-hidden rounded-lg border border-[var(--ink)]/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#7D1D1D]/30 hover:shadow-[var(--shadow-lg)]">
            <div className="relative overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                width={800}
                height={1040}
                className="h-64 md:h-80 w-full object-cover transition duration-[900ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#190f0d] via-[#190f0d]/35 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/95 text-[#7D1D1D] opacity-0 shadow-[var(--shadow-sm)] transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-4 pt-10 text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/85">{category.subtitle}</p>
                <h3 className="mt-1.5 font-serif text-2xl md:text-3xl font-semibold text-white">{category.name}</h3>
                <span className="mt-2 inline-block h-0.5 w-8 origin-left scale-x-0 bg-[#E6C866] transition-transform duration-300 group-hover:scale-x-100" />
              </div>
            </div>
          </Link>
          </Reveal>
        ))}
      </div>
      </div>
    </Section>
  );
}
