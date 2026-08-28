import { getCatalogProducts } from "@/lib/catalog-store";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ProductsPageContent } from "@/components/products-page-content";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params.category ? decodeURIComponent(params.category) : undefined;
  const products = await getCatalogProducts();

  return (
    <main className="px-4 py-8 md:px-8 lg:px-10 relative overflow-hidden">
      {/* Decorative lotus motifs */}
      <div className="absolute top-16 right-12 w-14 h-14 opacity-20 animate-float hidden lg:block" style={{ animationDelay: '0.5s' }}>
        <svg viewBox="0 0 60 60" className="h-full w-full">
          <path d="M30 10 C 40 15, 45 25, 45 35 C 40 40, 35 41, 30 37 C 25 41, 20 40, 15 35 C 15 25, 20 15, 30 10 Z" fill="none" stroke="#7D1D1D" strokeWidth="1" opacity="0.8" />
          <path d="M30 10 C 35 18, 38 25, 38 35 C 34 39, 30 40, 30 35" fill="none" stroke="#D4AF37" strokeWidth="0.8" opacity="0.6" />
          <circle cx="30" cy="30" r="2" fill="#8b6b47" />
        </svg>
      </div>

      <div className="absolute bottom-32 left-8 w-16 h-16 opacity-15 animate-float-elegant hidden lg:block" style={{ animationDelay: '2s' }}>
        <svg viewBox="0 0 60 60" className="h-full w-full">
          <path d="M30 10 C 40 15, 45 25, 45 35 C 40 40, 35 41, 30 37 C 25 41, 20 40, 15 35 C 15 25, 20 15, 30 10 Z" fill="none" stroke="#8b6b47" strokeWidth="1.2" opacity="0.7" />
          <circle cx="30" cy="30" r="2.5" fill="#7D1D1D" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="mb-6 flex items-center gap-2 md:gap-3 group hover:animate-glow-pulse">
          <LotusOrnament className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-[#d7c1af] bg-white/80 p-2 group-hover:scale-110 transition-transform" />
          <div>
            <p className="text-[9px] md:text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Curated edit</p>
            <h1 className="mt-1 font-serif text-3xl md:text-5xl text-[#201614]">
              {selectedCategory ? selectedCategory : "Kurtis for every mood"}
            </h1>
          </div>
        </div>

        {/* Client-side search and filters */}
        <ProductsPageContent initialProducts={products} initialCategory={selectedCategory} />
      </div>
    </main>
  );
}
