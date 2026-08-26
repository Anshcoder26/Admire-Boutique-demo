import { notFound } from "next/navigation";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ProductDetail } from "@/components/product-detail";
import { ProductGrid } from "@/components/product-grid";
import { getCatalogProducts } from "@/lib/catalog-store";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getCatalogProducts();
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);

  return (
    <>
      <ProductDetail product={product} />
      <section className="px-4 pb-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LotusOrnament className="h-10 w-10 rounded-full border border-[#d7c1af] bg-white/80 p-2" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Complete the look</p>
                <h2 className="font-serif text-4xl text-[#201614]">Related products</h2>
              </div>
            </div>
          </div>
          <ProductGrid products={related} />
        </div>
      </section>
    </>
  );
}
