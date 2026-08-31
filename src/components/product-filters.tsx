"use client";

import { SlidersHorizontal } from "lucide-react";
import { PaisleyMotif } from "./motifs/paisley-motif";
import { motifOpacity, motifColors } from "./motifs/motif-utils";

const filters = [
  "All Kurtis",
  "Cotton",
  "Printed",
  "Anarkali",
  "Office",
  "Festive",
  "Under ₹1,999",
  "New Arrivals",
];

export function ProductFilters() {
  return (
    <div className="rounded-[26px] border border-[#eadfd5] bg-[#fffaf6] p-3 shadow-[0_10px_30px_rgba(84,58,45,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2 text-[#4a2d27]">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <button className="text-xs font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Reset</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`rounded-full border px-3 py-2 text-xs font-medium transition inline-flex items-center gap-2 ${
              filter === "All Kurtis"
                ? "border-[#4b1f1d] bg-[#4b1f1d] text-white"
                : "border-[#e4d3c7] bg-white text-[#4d362d] hover:border-[#d5b9a6]"
            }`}
          >
            {filter !== "All Kurtis" && (
              <div className="w-3 h-3">
                <PaisleyMotif
                  size="xs"
                  opacity={motifOpacity.light}
                  color={filter === "All Kurtis" ? motifColors.cream : motifColors.secondary}
                  variant="filled"
                />
              </div>
            )}
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
