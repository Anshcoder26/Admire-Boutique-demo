import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/products";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";

export function CategorySection() {
  return (
    <Section spacing="md">
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
        {categories.map((category) => (
          <Link key={category.name} href={`/products?category=${encodeURIComponent(category.name)}`} className="group block overflow-hidden rounded-[28px] border border-[#e9e0d8] bg-white shadow-[0_12px_30px_rgba(86,65,55,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(86,65,55,0.08)]">
            <div className="relative overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                width={800}
                height={1040}
                className="h-60 md:h-72 w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#190f0d]/90 via-[#190f0d]/45 to-transparent p-4 pt-10 text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#f5e3d3]">{category.subtitle}</p>
                <h3 className="mt-1.5 font-serif text-2xl md:text-3xl">{category.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
