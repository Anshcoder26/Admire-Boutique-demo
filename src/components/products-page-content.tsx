"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductsSearch } from "@/components/products-search";
import { ProductGrid } from "@/components/product-grid";
import { SectionDivider } from "@/components/ui/section-divider";
import type { Product } from "@/data/products";

interface ProductsPageContentProps {
  initialProducts: Product[];
  initialCategory?: string;
}

function filterByCategory(products: Product[], category?: string): Product[] {
  return category ? products.filter((p) => p.category === category) : products;
}

export function ProductsPageContent({ initialProducts, initialCategory }: ProductsPageContentProps) {
  const router = useRouter();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(() =>
    filterByCategory(initialProducts, initialCategory)
  );
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory);

  // Re-derive the category filter during render when the incoming category
  // changes (e.g. navigating between category links). Adjusting state during
  // render is the React-recommended alternative to a setState-in-effect.
  const [prevCategory, setPrevCategory] = useState<string | undefined>(initialCategory);
  if (initialCategory !== prevCategory) {
    setPrevCategory(initialCategory);
    setSelectedCategory(initialCategory);
    setFilteredProducts(filterByCategory(initialProducts, initialCategory));
  }

  const handleFilter = (filtered: Product[]) => {
    setFilteredProducts(filtered);
  };

  const handleClearAll = () => {
    // Navigate back to /products without category parameter
    router.push("/products");
  };

  // When a category is selected, keep its products first and show all other
  // catalog products below the decorative divider.
  const remainingProducts = selectedCategory
    ? initialProducts.filter((product) => product.category !== selectedCategory)
    : [];

  return (
    <div className="space-y-8">
      {/* Search and filters */}
      <ProductsSearch
        products={initialProducts}
        onFilter={handleFilter}
        initialCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onClearAll={handleClearAll}
      />

      {/* Selected category results */}
      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-[#7D1D1D]/20 bg-white/60 py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#7D1D1D]/8 text-2xl">🔍</div>
          <div className="mb-1 font-serif text-2xl text-[#201614]">No products found</div>
          <p className="text-sm text-[#6b5f57]">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Show the rest of the catalog only on a category-specific view. */}
      {selectedCategory && remainingProducts.length > 0 && (
        <section aria-label="More suits from the collection" className="pt-2">
          <SectionDivider spacing="lg" />
          <div className="mb-6 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]">
              Explore the collection
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[var(--ink)] md:text-3xl">
              More Suits to Discover
            </h2>
          </div>
          <ProductGrid products={remainingProducts} />
        </section>
      )}
    </div>
  );
}
