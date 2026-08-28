"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  fabric: string;
  description: string;
  images: string[];
  colors: Array<{ name: string; hex: string }>;
  stitchType?: string;
}

const CURATED_COLORS: Record<string, string> = {
  "lemon yellow": "#fff44f",
  "mustard": "#e1ad01",
  "maroon": "#7d1d1d",
  "rani pink": "#ff1a8c",
  "rose gold": "#b76e79",
  "peach": "#ffb59e",
  "bottle green": "#006a4e",
  "off white": "#faf9f6",
  "sky blue": "#87ceeb",
  "terracotta": "#c06a4f",
  "wine": "#722f37",
  "saffron": "#f4c430",
  "charcoal": "#36454f",
  "blush": "#de5d83",
  "mauve": "#e0b0ff",
  "emerald": "#046307",
};

const productCategories = ["Premium Cotton", "Georgette", "Pure Mul", "Silk"];
const STITCH_TYPES = ["Stitched", "Unstitched"];

function resolveColorHex(name: string): string | null {
  const key = name.trim().toLowerCase().replace(/\s+/g, " ");
  if (!key) return null;
  return CURATED_COLORS[key] || "#c06a4f";
}

export function ProductEditor({
  token,
  productId,
  onClose,
  onSave,
}: {
  token: string;
  productId: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({});
  const [colorNameInput, setColorNameInput] = useState("");
  const [colorHexInput, setColorHexInput] = useState("#c06a4f");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          
          // Ensure colors and images are arrays
          const colors = Array.isArray(data.colors) ? data.colors : 
                        (typeof data.colors === "string" ? JSON.parse(data.colors) : []);
          const images = Array.isArray(data.images) ? data.images :
                        (typeof data.images === "string" ? JSON.parse(data.images) : []);
          
          setForm({
            name: data.name,
            category: data.category,
            price: data.price,
            stock: data.stock,
            fabric: data.fabric,
            description: data.description,
            images: images || [],
            colors: colors || [],
            stitchType: data.stitch_type || "",
          });
        }
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [token, productId]);

  const handleAddColor = () => {
    if (!colorNameInput.trim()) return;

    const hex = resolveColorHex(colorNameInput) || colorHexInput;
    const newColor = { name: colorNameInput, hex };

    setForm((current) => ({
      ...current,
      colors: [...(current.colors || []), newColor],
    }));

    setColorNameInput("");
    setColorHexInput("#c06a4f");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Product updated successfully!");
        onSave();
        onClose();
      } else {
        alert("Failed to update product");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Error saving product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-[20px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <p className="text-center text-[#8a6f5f]">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-[#1a1612]">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-[#8a6f5f] hover:text-[#5a403a]"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#5a403a] mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b67c60]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#5a403a] mb-2">
                Category
              </label>
              <select
                value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b67c60]"
              >
                {productCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5a403a] mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b67c60]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#5a403a] mb-2">
                Stock
              </label>
              <input
                type="number"
                value={form.stock || ""}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b67c60]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5a403a] mb-2">
                Stitch Type
              </label>
              <select
                value={form.stitchType || ""}
                onChange={(e) => setForm({ ...form, stitchType: e.target.value })}
                className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b67c60]"
              >
                <option value="">Not specified</option>
                {STITCH_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#5a403a] mb-2">
              Fabric
            </label>
            <input
              type="text"
              value={form.fabric || ""}
              onChange={(e) => setForm({ ...form, fabric: e.target.value })}
              className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b67c60]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#5a403a] mb-2">
              Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b67c60]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#5a403a] mb-2">
              Colors
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={colorNameInput}
                onChange={(e) => setColorNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddColor())}
                placeholder="e.g. Lemon Yellow"
                className="flex-1 rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b67c60]"
              />
              <input
                type="color"
                value={colorHexInput}
                onChange={(e) => setColorHexInput(e.target.value)}
                className="h-11 w-12 rounded-xl border border-[#ead9cf] cursor-pointer"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="shrink-0 rounded-full bg-[#4b1f1d] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Add
              </button>
            </div>

            {form.colors && Array.isArray(form.colors) && form.colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.colors.map((color, idx) => (
                  <span
                    key={`${color.name}-${idx}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[#ead9cf] bg-white py-1 pl-1.5 pr-2 text-xs"
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-[#e0d0c3]"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          colors: form.colors?.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-[#c85a4d] hover:text-[#a84640]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full bg-[#4b1f1d] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#ead9cf] px-4 py-3 text-sm font-semibold text-[#5a403a]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
