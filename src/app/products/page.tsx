import { LotusOrnament } from "@/components/lotus-ornament";
import { ProductFilters } from "@/components/product-filters";
import { ProductGrid } from "@/components/product-grid";
import { getCatalogProducts } from "@/lib/catalog-store";

export default async function ProductsPage() {
  const products = await getCatalogProducts();
  return (
    <main className="px-4 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-3">
          <LotusOrnament className="h-12 w-12 rounded-full border border-[#d7c1af] bg-white/80 p-2" />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Curated edit</p>
            <h1 className="mt-1 font-serif text-5xl text-[#201614]">Kurtis for every mood</h1>
          </div>
        </div>

        <div className="mb-6">
          <ProductFilters />
        </div>

        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="rounded-[30px] border border-[#eadcd3] bg-[#fffaf6] p-5 shadow-[0_12px_26px_rgba(84,58,45,0.04)]">
            <div className="space-y-6 text-sm text-[#4d362d]">
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7d645a]">Category</h3>
                <div className="space-y-2">
                  {['Cotton Kurtis', 'Printed Kurtis', 'Anarkali Kurtis', 'Office Wear', 'Festive Kurtis'].map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-[#d6b9a8]" />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7d645a]">Price range</h3>
                <input type="range" className="w-full accent-[#4b1f1d]" defaultValue={75} />
                <div className="mt-2 flex items-center justify-between text-xs text-[#735d55]">
                  <span>₹799</span>
                  <span>₹2999+</span>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7d645a]">Fabric</h3>
                <div className="space-y-2">
                  {['Cotton', 'Rayon', 'Silk', 'Linen', 'Georgette'].map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-[#d6b9a8]" />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex items-center justify-between gap-2 rounded-[22px] border border-[#eadcd3] bg-[#fffaf6] p-3 text-sm text-[#5a403a]">
              <span>Showing 7 products</span>
              <select className="rounded-full border border-[#e2ccbc] bg-white px-3 py-2 outline-none">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
              </select>
            </div>
            <ProductGrid products={products} />
          </div>
        </div>
      </div>
    </main>
  );
}
