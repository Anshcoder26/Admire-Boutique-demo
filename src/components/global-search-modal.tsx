"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = () => {
    setIsOpen(false);
    router.push("/products");
  };

  return (
    <>
      {/* Modal */}
      {isOpen ? (
        <div
          style={{
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
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "32px",
              padding: "24px",
              maxWidth: "600px",
              width: "calc(100% - 32px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#201614",
                  margin: 0,
                }}
              >
                Search Kurtis
              </h2>
              <button
                onClick={() => setIsOpen(false)}
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

            <p
              style={{
                fontSize: "14px",
                color: "#5a403a",
                marginBottom: "16px",
              }}
            >
              Open the products page to search and filter by category, price, and rating.
            </p>

            <button
              onClick={handleSearch}
              style={{
                width: "100%",
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
              Go to Products
            </button>

            <p
              style={{
                fontSize: "12px",
                color: "#8a6f5f",
                marginTop: "12px",
                textAlign: "center",
              }}
            >
              💡 Tip: Press Ctrl+K (or Cmd+K on Mac) to open search from anywhere
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
