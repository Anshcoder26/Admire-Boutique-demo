"use client";

import { useEffect } from "react";

/**
 * Global error boundary — catches errors thrown in the root layout itself.
 * Must render its own <html>/<body> because it replaces the whole document.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Root-level failures may occur before app providers mount, so log directly.
    console.error("[APP] Global error:", error?.message ?? error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          textAlign: "center",
          backgroundColor: "#f4ece6",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#7D1D1D",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#D4AF37",
          }}
        >
          Something went wrong
        </p>
        <h1 style={{ marginTop: "0.75rem", fontSize: "2rem", fontWeight: 700 }}>
          We hit a snag
        </h1>
        <p style={{ marginTop: "1rem", maxWidth: "28rem", color: "#8B7355", fontSize: "0.9rem" }}>
          An unexpected error occurred. Please try again in a moment.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "2rem",
            border: "none",
            borderRadius: "9999px",
            backgroundColor: "#7D1D1D",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
