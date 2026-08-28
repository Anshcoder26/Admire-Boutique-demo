"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductsSearch } from "@/components/products-search";
import { ProductGrid } from "@/components/product-grid";
import type { Product } from "@/data/products";

interface ProductsPageContentProps {
  initialProducts: Product[];
  initialCategory?: string;
}

export function ProductsPageContent({ initialProducts, initialCategory }: ProductsPageContentProps) {
  const router = useRouter();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory);

  // Apply initial category filter on mount
  useEffect(() => {
    if (initialCategory) {
      const categoryFiltered = initialProducts.filter(p => p.category === initialCategory);
      setFilteredProducts(categoryFiltered);
    } else {
      setFilteredProducts(initialProducts);
    }
  }, [initialCategory, initialProducts]);

  const handleFilter = (filtered: Product[]) => {
    setFilteredProducts(filtered);
  };

  const handleClearAll = () => {
    // Navigate back to /products without category parameter
    router.push("/products");
  };

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
