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
