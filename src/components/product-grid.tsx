import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/ui/reveal";
import type { Product } from "@/data/products";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product, i) => (
        <Reveal key={product.id} variant="up" delay={i * 90}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  );
}
