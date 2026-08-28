import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Leaf } from "lucide-react";
import { categories } from "@/data/products";

export function CategorySection() {
  return (
    <section className="px-4 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">
              <Leaf className="h-3.5 w-3.5 text-[#577053]" />
              Curated categories
            </p>
            <h2 className="font-serif text-4xl text-[#201614]">Shop by mood</h2>
          </div>
          <Link href="/products" className="hidden items-center gap-2 text-sm font-medium text-[#5d2a25] md:inline-flex">
            Explore all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.name} href={`/products?category=${encodeURIComponent(category.name)}`} className="group block overflow-hidden rounded-[28px] border border-[#e9e0d8] bg-white shadow-[0_12px_30px_rgba(86,65,55,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(86,65,55,0.08)]">
              <div className="relative overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={800}
                  height={1040}
                  className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#190f0d]/75 via-[#190f0d]/20 to-transparent p-4 text-white">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#f1d8c4]">{category.subtitle}</p>
                  <h3 className="mt-2 font-serif text-3xl">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
