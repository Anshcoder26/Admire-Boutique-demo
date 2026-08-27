"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import type { Product } from "@/data/products";

interface ProductsSearchProps {
  products: Product[];
  onFilter: (filtered: Product[]) => void;
}

export function ProductsSearch({ products, onFilter }: ProductsSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating">("featured");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filtered = useMemo(() => {
    let result = products;

    // Text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Sorting
    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Notify parent of filtered results
  useMemo(() => {
    onFilter(filtered);
  }, [filtered, onFilter]);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="rounded-[22px] border border-[#eadcd3] bg-white p-3 shadow-sm hover:border-[#d4a894] transition">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-[#8a6f5f]" />
          <input
            type="text"
            placeholder="Search kurtis by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#2b2b2b]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-1 hover:bg-[#f5ede5] rounded-full transition"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-[#8a6f5f]" />
            </button>
          )}
        </div>
      </div>

      {/* Filters and sorting row */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Category filter */}
        <div className="rounded-[22px] border border-[#eadcd3] bg-white p-3">
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="w-full bg-transparent outline-none text-sm text-[#5a403a] accent-[#7D1D1D] hover:border-[#7D1D1D] transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sort dropdown */}
        <div className="rounded-[22px] border border-[#eadcd3] bg-white p-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full bg-transparent outline-none text-sm text-[#5a403a] accent-[#7D1D1D] hover:border-[#7D1D1D] transition-colors"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Results summary */}
      <div className="text-sm text-[#5a403a]">
        {searchTerm || selectedCategory ? (
          <span>Found <strong>{filtered.length}</strong> product{filtered.length !== 1 ? 's' : ''}</span>
        ) : (
          <span>Showing <strong>{filtered.length}</strong> product{filtered.length !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
}
