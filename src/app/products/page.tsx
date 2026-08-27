import { LotusOrnament } from "@/components/lotus-ornament";
import { ProductFilters } from "@/components/product-filters";
import { ProductGrid } from "@/components/product-grid";
import { getCatalogProducts } from "@/lib/catalog-store";

export default async function ProductsPage() {
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
            <h1 className="mt-1 font-serif text-3xl md:text-5xl text-[#201614]">Kurtis for every mood</h1>
          </div>
        </div>

        <div className="mb-6">
          <ProductFilters />
        </div>

        <div className="grid gap-4 md:gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="hidden xl:block rounded-[30px] border border-[#eadcd3] bg-[#fffaf6] p-5 shadow-[0_12px_26px_rgba(84,58,45,0.04)] hover:shadow-[0_16px_32px_rgba(201,74,106,0.08)] transition-shadow">
            <div className="space-y-6 text-sm text-[#4d362d]">
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7d645a]">Category</h3>
                <div className="space-y-2">
                  {['Cotton Kurtis', 'Printed Kurtis', 'Anarkali Kurtis', 'Office Wear', 'Festive Kurtis'].map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="h-4 w-4 rounded border-[#d6b9a8] accent-[#7D1D1D]" />
                      <span className="group-hover:text-[#7D1D1D] transition-colors">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7d645a]">Price range</h3>
                <input type="range" className="w-full accent-[#7D1D1D]" defaultValue={75} />
                <div className="mt-2 flex items-center justify-between text-xs text-[#735d55]">
                  <span>₹799</span>
                  <span>₹2999+</span>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7d645a]">Fabric</h3>
                <div className="space-y-2">
                  {['Cotton', 'Rayon', 'Silk', 'Linen', 'Georgette'].map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="h-4 w-4 rounded border-[#d6b9a8] accent-[#7D1D1D]" />
                      <span className="group-hover:text-[#7D1D1D] transition-colors">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex items-center justify-between gap-2 rounded-[22px] border border-[#eadcd3] bg-[#fffaf6] p-3 text-sm text-[#5a403a] hover:border-[#d4a894] hover:shadow-[0_6px_16px_rgba(84,58,45,0.06)] transition">
              <span>Showing 7 products</span>
              <select className="rounded-full border border-[#e2ccbc] bg-white px-3 py-2 outline-none accent-[#7D1D1D] hover:border-[#7D1D1D] transition-colors">
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
