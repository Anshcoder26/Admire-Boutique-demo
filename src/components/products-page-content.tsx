"use client";

import { useState } from "react";
import { ProductsSearch } from "@/components/products-search";
import { ProductGrid } from "@/components/product-grid";
import type { Product } from "@/data/products";

interface ProductsPageContentProps {
  initialProducts: Product[];
}

export function ProductsPageContent({ initialProducts }: ProductsPageContentProps) {
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);

  return (
    <div className="space-y-8">
      {/* Search and filters */}
      <ProductsSearch products={initialProducts} onFilter={setFilteredProducts} />

      {/* Results */}
      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-[#8a6f5f] text-lg font-medium mb-2">No products found</div>
          <p className="text-[#6b5f57] text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
