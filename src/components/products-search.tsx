"use client";

import { useState, useMemo } from "react";
import { Search, X, Filter } from "lucide-react";
import type { Product } from "@/data/products";

interface ProductsSearchProps {
  products: Product[];
  onFilter: (filtered: Product[]) => void;
}

export function ProductsSearch({ products, onFilter }: ProductsSearchProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSortBy("featured");
  };

  return (
    <>
      {/* Search and Filter Bar - Mobile Friendly */}
      <div className="flex gap-3 items-center mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-1 rounded-[22px] border border-[#eadcd3] bg-white p-3 shadow-sm hover:border-[#d4a894] transition-all hover:shadow-md flex items-center gap-2 text-[#8a6f5f]"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
          <span className="text-sm">Search kurtis...</span>
        </button>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-[22px] border border-[#eadcd3] bg-white p-3 shadow-sm hover:border-[#d4a894] transition-all hover:shadow-md"
          aria-label="Open filters"
        >
          <Filter className="h-5 w-5 text-[#8a6f5f]" />
        </button>
      </div>

      {/* Active filters display */}
      {(searchTerm || selectedCategory || sortBy !== "featured") && (
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {searchTerm && (
            <span className="inline-flex items-center gap-2 bg-[#f5e9e4] rounded-full px-3 py-1 text-sm text-[#5a403a]">
              Search: <strong>{searchTerm}</strong>
              <button onClick={() => setSearchTerm("")} className="hover:text-[#4b1f1d]">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-2 bg-[#f5e9e4] rounded-full px-3 py-1 text-sm text-[#5a403a]">
              Category: <strong>{selectedCategory}</strong>
              <button onClick={() => setSelectedCategory(null)} className="hover:text-[#4b1f1d]">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          {sortBy !== "featured" && (
            <span className="inline-flex items-center gap-2 bg-[#f5e9e4] rounded-full px-3 py-1 text-sm text-[#5a403a]">
              Sort: <strong>{sortBy}</strong>
              <button onClick={() => setSortBy("featured")} className="hover:text-[#4b1f1d]">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="text-xs font-medium text-[#7D1D1D] hover:text-[#4b1f1d] underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full md:w-full md:max-w-2xl rounded-t-[32px] md:rounded-[32px] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-serif text-[#201614]">Search & Filter</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-[#f5e9e4] rounded-full transition"
                aria-label="Close modal"
              >
                <X className="h-6 w-6 text-[#8a6f5f]" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Search input */}
              <div>
                <label className="block text-sm font-semibold text-[#5a403a] mb-2 uppercase tracking-wide">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8a6f5f]" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-[16px] border border-[#eadcd3] bg-white outline-none focus:border-[#7D1D1D] transition"
                  />
                </div>
              </div>

              {/* Category filter */}
              <div>
                <label className="block text-sm font-semibold text-[#5a403a] mb-2 uppercase tracking-wide">Category</label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-4 py-3 rounded-[16px] border border-[#eadcd3] bg-white outline-none focus:border-[#7D1D1D] accent-[#7D1D1D] transition text-[#5a403a]"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sort dropdown */}
              <div>
                <label className="block text-sm font-semibold text-[#5a403a] mb-2 uppercase tracking-wide">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full px-4 py-3 rounded-[16px] border border-[#eadcd3] bg-white outline-none focus:border-[#7D1D1D] accent-[#7D1D1D] transition text-[#5a403a]"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Results info */}
              <div className="text-sm text-[#5a403a] bg-[#fffaf6] rounded-[16px] p-3 border border-[#eadcd3]">
                Found <strong>{filtered.length}</strong> product{filtered.length !== 1 ? 's' : ''}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-full bg-[#4b1f1d] px-6 py-3 text-center text-sm font-medium text-white shadow-lg shadow-[#4b1f1d]/15 transition hover:bg-[#341514]"
                >
                  View Results
                </button>
                <button
                  onClick={handleClearFilters}
                  className="flex-1 rounded-full border border-[#eadcd3] bg-white px-6 py-3 text-center text-sm font-medium text-[#5a403a] transition hover:bg-[#fffaf6]"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }