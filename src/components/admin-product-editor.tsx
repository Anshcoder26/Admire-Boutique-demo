"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { categories } from "@/data/products";

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

const productCategories = categories.map((category) => category.name);
const STITCH_TYPES = ["Stitched", "Unstitched"];

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
  const toast = useToast();
  const [form, setForm] = useState<Partial<Product>>({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${productId}`, {
          credentials: "include",
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Product updated successfully!");
        onSave();
        onClose();
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error("Error saving product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <p className="text-center text-[var(--ink)]/60">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-[var(--ink)]">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-[var(--ink)]/60 hover:text-[var(--ink)]/70"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]/70 mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#7D1D1D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)]/70 mb-2">
                Category
              </label>
              <select
                value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#7D1D1D]"
              >
                {/* Keep a product's existing category selectable even if it's no longer in the list. */}
                {(form.category && !productCategories.includes(form.category)
                  ? [form.category, ...productCategories]
                  : productCategories
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--ink)]/70 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#7D1D1D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)]/70 mb-2">
                Stock
              </label>
              <input
                type="number"
                value={form.stock || ""}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#7D1D1D]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--ink)]/70 mb-2">
                Stitch Type
              </label>
              <select
                value={form.stitchType || ""}
                onChange={(e) => setForm({ ...form, stitchType: e.target.value })}
                className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#7D1D1D]"
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
            <label className="block text-sm font-semibold text-[var(--ink)]/70 mb-2">
              Fabric
            </label>
            <input
              type="text"
              value={form.fabric || ""}
              onChange={(e) => setForm({ ...form, fabric: e.target.value })}
              className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#7D1D1D]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]/70 mb-2">
              Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-[var(--ink)]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#7D1D1D]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-[#7D1D1D] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-[var(--ink)]/12 px-4 py-3 text-sm font-semibold text-[var(--ink)]/70"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
