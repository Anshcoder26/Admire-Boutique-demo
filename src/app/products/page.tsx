import { getCatalogProducts } from "@/lib/catalog-store";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ProductsPageContent } from "@/components/products-page-content";
import { ArtMotif } from "@/components/motifs/art-motif";

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
      <ArtMotif motif="peacock" size={400} opacity={0.4} className="absolute -right-28 top-32 z-0 hidden xl:block" />
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="mb-6 flex items-center gap-2 md:gap-3">
          <LotusOrnament className="h-10 w-10 md:h-11 md:w-11 rounded-full border border-[#7D1D1D]/25 bg-[#fff5f0] p-2" />
          <div>
            <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]">Curated edit</p>
            <h1 className="mt-1 font-serif text-3xl md:text-5xl font-semibold tracking-tight text-[var(--ink)]">
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
