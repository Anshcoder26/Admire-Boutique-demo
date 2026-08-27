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
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
        <button
          onClick={() => {
            console.log("Search button clicked, opening modal");
            setIsModalOpen(true);
          }}
          style={{
            flex: 1,
            borderRadius: "22px",
            border: "1px solid #eadcd3",
            backgroundColor: "white",
            padding: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#8a6f5f",
            cursor: "pointer",
            fontSize: "14px",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#d4a894";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#eadcd3";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
          }}
          aria-label="Open search"
        >
          <Search size={20} />
          <span>Search kurtis...</span>
        </button>
        
        <button
          onClick={() => {
            console.log("Filter button clicked, opening modal");
            setIsModalOpen(true);
          }}
          style={{
            borderRadius: "22px",
            border: "1px solid #eadcd3",
            backgroundColor: "white",
            padding: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8a6f5f",
            cursor: "pointer",
            width: "44px",
            height: "44px",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#d4a894";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#eadcd3";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
          }}
          aria-label="Open filters"
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Active filters display */}
      {(searchTerm || selectedCategory || sortBy !== "featured") && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "16px",
          alignItems: "center",
        }}>
          {searchTerm && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#f5e9e4",
              borderRadius: "9999px",
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "4px",
              paddingBottom: "4px",
              fontSize: "14px",
              color: "#5a403a",
            }}>
              Search: <strong>{searchTerm}</strong>
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#5a403a",
                  padding: "0 4px",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#4b1f1d"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#5a403a"}
              >
                <X size={14} />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#f5e9e4",
              borderRadius: "9999px",
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "4px",
              paddingBottom: "4px",
              fontSize: "14px",
              color: "#5a403a",
            }}>
              Category: <strong>{selectedCategory}</strong>
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#5a403a",
                  padding: "0 4px",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#4b1f1d"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#5a403a"}
              >
                <X size={14} />
              </button>
            </span>
          )}
          {sortBy !== "featured" && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#f5e9e4",
              borderRadius: "9999px",
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "4px",
              paddingBottom: "4px",
              fontSize: "14px",
              color: "#5a403a",
            }}>
              Sort: <strong>{sortBy}</strong>
              <button
                onClick={() => setSortBy("featured")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#5a403a",
                  padding: "0 4px",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#4b1f1d"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#5a403a"}
              >
                <X size={14} />
              </button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#7D1D1D",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#4b1f1d"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#7D1D1D"}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen ? (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "32px",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            {/* Modal header */}
            <div style={{
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#201614",
                fontFamily: "Georgia, serif",
                margin: 0,
              }}>Search & Filter</h2>
              <button
                onClick={() => {
                  console.log("Close button clicked");
                  setIsModalOpen(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#8a6f5f",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5e9e4";
                  e.currentTarget.style.borderRadius = "50%";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Search input */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#5a403a",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>Search</label>
                <div style={{ position: "relative" }}>
                  <Search style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#8a6f5f",
                  }} size={20} />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      paddingLeft: "40px",
                      paddingRight: "16px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      borderRadius: "16px",
                      border: "1px solid #eadcd3",
                      backgroundColor: "white",
                      outline: "none",
                      fontSize: "16px",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#7D1D1D"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#eadcd3"}
                  />
                </div>
              </div>

              {/* Category filter */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#5a403a",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>Category</label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  style={{
                    width: "100%",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    borderRadius: "16px",
                    border: "1px solid #eadcd3",
                    backgroundColor: "white",
                    outline: "none",
                    fontSize: "16px",
                    fontFamily: "inherit",
                    color: "#5a403a",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#7D1D1D"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#eadcd3"}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sort dropdown */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#5a403a",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  style={{
                    width: "100%",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    borderRadius: "16px",
                    border: "1px solid #eadcd3",
                    backgroundColor: "white",
                    outline: "none",
                    fontSize: "16px",
                    fontFamily: "inherit",
                    color: "#5a403a",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#7D1D1D"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#eadcd3"}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Results info */}
              <div style={{
                fontSize: "14px",
                color: "#5a403a",
                backgroundColor: "#fffaf6",
                borderRadius: "16px",
                padding: "12px",
                border: "1px solid #eadcd3",
              }}>
                Found <strong>{filtered.length}</strong> product{filtered.length !== 1 ? 's' : ''}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => {
                    console.log("View Results clicked, closing modal");
                    setIsModalOpen(false);
                  }}
                  style={{
                    flex: 1,
                    borderRadius: "9999px",
                    backgroundColor: "#4b1f1d",
                    color: "white",
                    padding: "12px 24px",
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(75, 31, 29, 0.15)",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#341514"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4b1f1d"}
                >
                  View Results
                </button>
                <button
                  onClick={handleClearFilters}
                  style={{
                    flex: 1,
                    borderRadius: "9999px",
                    border: "1px solid #eadcd3",
                    backgroundColor: "white",
                    color: "#5a403a",
                    padding: "12px 24px",
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fffaf6"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
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