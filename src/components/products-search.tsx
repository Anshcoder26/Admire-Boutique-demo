"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
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

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortBy]);

  useMemo(() => {
    onFilter(filtered);
  }, [filtered, onFilter]);

  return (
    <>
      {/* Search Bar */}
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "16px",
          borderRadius: "22px",
          border: "1px solid #eadcd3",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          fontSize: "14px",
          color: "#8a6f5f",
          fontFamily: "inherit",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Search size={20} />
        <span>Search kurtis...</span>
      </button>

      {/* Active Filters Display */}
      {(searchTerm || selectedCategory || sortBy !== "featured") && (
        <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          {searchTerm && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#f5e9e4",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "12px",
              color: "#5a403a",
            }}>
              {searchTerm}
              <button onClick={() => setSearchTerm("")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                <X size={14} />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#f5e9e4",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "12px",
              color: "#5a403a",
            }}>
              {selectedCategory}
              <button onClick={() => setSelectedCategory(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                <X size={14} />
              </button>
            </span>
          )}
          {sortBy !== "featured" && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#f5e9e4",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "12px",
              color: "#5a403a",
            }}>
              {sortBy}
              <button onClick={() => setSortBy("featured")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                <X size={14} />
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory(null);
              setSortBy("featured");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#7D1D1D",
              fontSize: "12px",
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: "600",
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen ? (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "32px",
            padding: "24px",
            maxWidth: "600px",
            width: "calc(100% - 32px)",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          }}>
            {/* Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#201614",
                margin: 0,
                fontFamily: "Georgia, serif",
              }}>
                Search & Filter
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#8a6f5f",
                  padding: "8px",
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Search */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#5a403a",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  Search
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #eadcd3",
                    backgroundColor: "white",
                    fontSize: "16px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#5a403a",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  Category
                </label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #eadcd3",
                    backgroundColor: "white",
                    fontSize: "16px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    color: "#5a403a",
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#5a403a",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #eadcd3",
                    backgroundColor: "white",
                    fontSize: "16px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    color: "#5a403a",
                  }}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Results */}
              <div style={{
                backgroundColor: "#fffaf6",
                borderRadius: "12px",
                padding: "12px",
                border: "1px solid #eadcd3",
                fontSize: "14px",
                color: "#5a403a",
              }}>
                Found <strong>{filtered.length}</strong> product{filtered.length !== 1 ? 's' : ''}
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    borderRadius: "50px",
                    backgroundColor: "#4b1f1d",
                    color: "white",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  View Results
                </button>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory(null);
                    setSortBy("featured");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    borderRadius: "50px",
                    backgroundColor: "white",
                    color: "#5a403a",
                    border: "1px solid #eadcd3",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
