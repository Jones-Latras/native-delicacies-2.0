"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, FolderOpen, Loader2, Upload, X,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  isVisible: boolean;
  displayOrder: number;
  _count: { menuItems: number };
}

interface MenuItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  isAvailable: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
  categoryId: string;
  category: { id: string; name: string };
  dailyLimit: number | null;
  soldToday: number;
  originRegion?: "Luzon" | "Visayas" | "Mindanao" | null;
  storageInstructions?: string | null;
  heritageStory?: string | null;
}

type Tab = "items" | "categories";

export default function MenuManagementPage() {
  const [tab, setTab] = useState<Tab>("items");
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    const json = await res.json();
    if (json.success) setCategories(json.data);
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "15" });
    if (search) params.set("search", search);
    if (filterCategory) params.set("categoryId", filterCategory);
    const res = await fetch(`/api/admin/menu-items?${params}`);
    const json = await res.json();
    if (json.success) {
      setItems(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    }
    setLoading(false);
  }, [page, search, filterCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCategories();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchItems();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchItems]);

  const toggleAvailability = async (item: MenuItem) => {
    await fetch(`/api/admin/menu-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this menu item? This cannot be undone.")) return;
    await fetch(`/api/admin/menu-items/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const toggleCatVisibility = async (cat: Category) => {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !cat.isVisible }),
    });
    fetchCategories();
  };

  const deleteCat = async (cat: Category) => {
    if (cat._count.menuItems > 0) {
      alert("Cannot delete a category that has menu items. Remove or reassign items first.");
      return;
    }
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    fetchCategories();
  };

  const filterFieldClass =
    "w-full border-b border-[#d7ccc8] bg-transparent py-2 text-sm text-[#3e2723] focus:border-[#8b4513] focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-[#e8e0d8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3e2723]">Menu Management</h1>
          <p className="mt-1 text-sm text-[#8d6e63]">
            Manage items and categories in a cleaner, divider-led layout.
          </p>
        </div>
        <button
          onClick={() => {
            if (tab === "items") { setEditingItem(null); setShowItemModal(true); }
            else { setEditingCat(null); setShowCatModal(true); }
          }}
          className="inline-flex items-center gap-2 border-b-2 border-[#8b4513] pb-1 text-sm font-semibold text-[#8b4513] transition-colors hover:border-[#a0522d] hover:text-[#a0522d]"
        >
          <Plus size={16} /> Add {tab === "items" ? "Item" : "Category"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-6 border-b border-[#e8e0d8]">
        <button
          onClick={() => setTab("items")}
          className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${tab === "items" ? "border-[#8b4513] text-[#8b4513]" : "border-transparent text-[#6d4c41] hover:text-[#3e2723]"}`}
        >
          Menu Items ({total})
        </button>
        <button
          onClick={() => setTab("categories")}
          className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${tab === "categories" ? "border-[#8b4513] text-[#8b4513]" : "border-transparent text-[#6d4c41] hover:text-[#3e2723]"}`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {tab === "items" ? (
        <>
          {/* Search & Filter */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1887f]" />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className={`${filterFieldClass} pl-9 pr-3`}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="border-b border-[#d7ccc8] bg-transparent px-3 py-2 text-sm text-[#3e2723] focus:border-[#8b4513] focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto border-t border-[#e8e0d8] pt-4">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-[#8d6e63]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                  <th className="px-4 py-3 text-center font-semibold">Available</th>
                  <th className="px-4 py-3 text-center font-semibold">Stock Left</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ebe6]">
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-[#a1887f]"><Loader2 className="mx-auto animate-spin" size={24} /></td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-[#a1887f]">No items found</td></tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5f0eb]">
                            <FolderOpen size={16} className="text-[#a1887f]" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#3e2723]">{item.name}</p>
                          {item.isFeatured && <span className="text-xs text-[#e65100] font-medium">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6d4c41]">{item.category.name}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#3e2723]">₱{item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleAvailability(item)} className="inline-flex">
                        {item.isAvailable
                          ? <ToggleRight size={24} className="text-green-600" />
                          : <ToggleLeft size={24} className="text-gray-400" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center text-[#6d4c41]">
                      {item.dailyLimit == null ? "Unlimited" : Math.max(item.dailyLimit - item.soldToday, 0)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingItem(item); setShowItemModal(true); }}
                          className="rounded-md p-1.5 text-[#8d6e63] hover:bg-[#f5f0eb] hover:text-[#8b4513] transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="rounded-md p-1.5 text-[#8d6e63] hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-[#8d6e63]">
              <span>Showing page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-md border border-[#d7ccc8] p-1.5 hover:bg-[#f5f0eb] disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-md border border-[#d7ccc8] p-1.5 hover:bg-[#f5f0eb] disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Categories Tab */
        <div className="overflow-x-auto border-t border-[#e8e0d8] pt-4">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-[#8d6e63]">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 text-center font-semibold">Items</th>
                <th className="px-4 py-3 text-center font-semibold">Visible</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ebe6]">
              {categories.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-[#a1887f]">No categories</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#faf8f5] transition-colors">
                  <td className="px-4 py-3 text-[#8d6e63]">{cat.displayOrder}</td>
                  <td className="px-4 py-3 font-medium text-[#3e2723]">{cat.name}</td>
                  <td className="px-4 py-3 text-center text-[#6d4c41]">{cat._count.menuItems}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleCatVisibility(cat)} className="inline-flex">
                      {cat.isVisible
                        ? <ToggleRight size={24} className="text-green-600" />
                        : <ToggleLeft size={24} className="text-gray-400" />
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditingCat(cat); setShowCatModal(true); }}
                        className="rounded-md p-1.5 text-[#8d6e63] hover:bg-[#f5f0eb] hover:text-[#8b4513] transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteCat(cat)}
                        className="rounded-md p-1.5 text-[#8d6e63] hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <ItemModal
          item={editingItem}
          categories={categories}
          onClose={() => setShowItemModal(false)}
          onSaved={() => { setShowItemModal(false); fetchItems(); }}
        />
      )}

      {/* Category Modal */}
      {showCatModal && (
        <CategoryModal
          category={editingCat}
          onClose={() => setShowCatModal(false)}
          onSaved={() => { setShowCatModal(false); fetchCategories(); }}
        />
      )}
    </div>
  );
}

/* ── Item Create/Edit Modal ── */
function ItemModal({
  item,
  categories,
  onClose,
  onSaved,
}: {
  item: MenuItem | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!item;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: item?.name ?? "",
    description: "",
    categoryId: item?.categoryId ?? (categories[0]?.id ?? ""),
    price: item?.price ?? 0,
    imageUrl: item?.imageUrl ?? "",
    isAvailable: item?.isAvailable ?? true,
    isFeatured: item?.isFeatured ?? false,
    originRegion: "",
    storageInstructions: "",
    heritageStory: "",
    dailyLimit: item?.dailyLimit ?? "",
    soldToday: item?.soldToday ?? 0,
    dietaryTags: [] as string[],
  });
  const fieldClass =
    "w-full border-b border-[#d7ccc8] bg-transparent px-0 py-2 text-sm text-[#3e2723] focus:border-[#8b4513] focus:outline-none";
  const actionClass =
    "border-b-2 border-transparent px-1 py-2 text-sm font-medium transition-colors";

  // Load full item data for edit
  useEffect(() => {
    if (item) {
      fetch(`/api/admin/menu-items/${item.id}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.success) {
            const d = json.data;
            setForm({
              name: d.name,
              description: d.description ?? "",
              categoryId: d.categoryId,
              price: d.price,
              imageUrl: d.imageUrl ?? "",
              isAvailable: d.isAvailable,
              isFeatured: d.isFeatured,
              originRegion: d.originRegion ?? "",
              storageInstructions: d.storageInstructions ?? "",
              heritageStory: d.heritageStory ?? "",
              dailyLimit: d.dailyLimit ?? "",
              soldToday: d.soldToday ?? 0,
              dietaryTags: d.dietaryTags ?? [],
            });
          }
        });
    }
  }, [item]);

  const set = (key: string, val: unknown) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload: Record<string, unknown> = {
      ...form,
      price: Number(form.price),
      dailyLimit: form.dailyLimit === "" ? null : Number(form.dailyLimit),
      imageUrl: form.imageUrl.trim() || (isEdit ? null : undefined),
      originRegion: form.originRegion || (isEdit ? null : undefined),
      storageInstructions: form.storageInstructions.trim() || (isEdit ? null : undefined),
      heritageStory: form.heritageStory.trim() || (isEdit ? null : undefined),
      dietaryTags: form.dietaryTags,
    };

    if (isEdit) {
      payload.soldToday = Number(form.soldToday);
    }

    const url = isEdit ? `/api/admin/menu-items/${item!.id}` : "/api/admin/menu-items";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    setSaving(false);

    if (!json.success) {
      setError(json.error || "Failed to save");
      return;
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[#d7ccc8] bg-[#fffaf2]" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-[#e8e0d8] px-6 py-4">
          <h2 className="text-lg font-bold text-[#3e2723]">{isEdit ? "Edit" : "Add"} Menu Item</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Name *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={fieldClass} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Description *</label>
            <textarea required rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={fieldClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Category *</label>
              <select required value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={fieldClass}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Price (₱) *</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Location / Region</label>
            <select value={form.originRegion} onChange={(e) => set("originRegion", e.target.value)} className={fieldClass}>
              <option value="">Do not show a location</option>
              <option value="Luzon">Luzon</option>
              <option value="Visayas">Visayas</option>
              <option value="Mindanao">Mindanao</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Product Image</label>
            {/* Preview */}
            {form.imageUrl && (
              <div className="relative mb-2 inline-block">
                <img src={form.imageUrl} alt="Preview" className="h-24 w-24 rounded-lg border border-[#d7ccc8] object-cover" />
                <button
                  type="button"
                  onClick={() => set("imageUrl", "")}
                  className="absolute -right-2 -top-2 border border-red-300 bg-[#fffaf2] p-0.5 text-red-600 transition-colors hover:border-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {/* Upload button */}
            <div className="flex items-center gap-2">
              <label className={`flex cursor-pointer items-center gap-2 border-b border-[#d7ccc8] px-1 py-2 text-sm font-medium text-[#5d4037] transition-colors hover:text-[#8b4513] ${uploading ? "pointer-events-none opacity-50" : ""}`}>
                <Upload size={16} />
                {uploading ? "Uploading..." : "Upload Photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    setError("");
                    try {
                      const fd = new FormData();
                      fd.append("file", file);
                      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                      const json = await res.json();
                      if (json.success) {
                        set("imageUrl", json.data.url);
                      } else {
                        setError(json.error || "Upload failed");
                      }
                    } catch {
                      setError("Upload failed. Please try again.");
                    } finally {
                      setUploading(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
              <span className="text-xs text-[#a1887f]">or</span>
              <input
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="Paste image URL..."
                className={`flex-1 ${fieldClass}`}
              />
            </div>
            <p className="mt-1 text-xs text-[#a1887f]">JPEG, PNG, WebP or AVIF. Max 5 MB.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Daily Limit</label>
              <input type="number" min="1" value={form.dailyLimit} onChange={(e) => set("dailyLimit", e.target.value)} placeholder="No limit" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Sold Today</label>
              <input type="number" min="0" value={form.soldToday} onChange={(e) => set("soldToday", e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Heritage Story</label>
            <textarea value={form.heritageStory} onChange={(e) => set("heritageStory", e.target.value)} rows={4} placeholder="Share the product's story, roots, or cultural background..." className={fieldClass} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Storage Instructions</label>
            <textarea value={form.storageInstructions} onChange={(e) => set("storageInstructions", e.target.value)} rows={3} placeholder="Example: Refrigerate after opening. Best consumed within 7 days." className={fieldClass} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Dietary Tags</label>
            <div className="flex flex-wrap gap-2">
              {["Vegetarian", "Vegan", "Gluten-Free", "Nut-Free", "Contains Coconut", "Contains Egg", "Contains Dairy"].map((tag) => (
                <label key={tag} className="flex items-center gap-1.5 text-sm text-[#5d4037]">
                  <input
                    type="checkbox"
                    checked={form.dietaryTags.includes(tag)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set("dietaryTags", [...form.dietaryTags, tag]);
                      } else {
                        set("dietaryTags", form.dietaryTags.filter((t: string) => t !== tag));
                      }
                    }}
                    className="rounded border-[#d7ccc8]"
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-[#5d4037]">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => set("isAvailable", e.target.checked)} className="rounded border-[#d7ccc8]" />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-[#5d4037]">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="rounded border-[#d7ccc8]" />
              Featured
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#e8e0d8] pt-4">
            <button type="button" onClick={onClose} className={`${actionClass} text-[#5d4037] hover:border-[#d7ccc8] hover:text-[#3e2723]`}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={`${actionClass} border-[#8b4513] text-[#8b4513] hover:border-[#a0522d] hover:text-[#a0522d] disabled:opacity-50`}>
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Category Create/Edit Modal ── */
function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!category;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: category?.name ?? "",
    isVisible: category?.isVisible ?? true,
  });
  const fieldClass =
    "w-full border-b border-[#d7ccc8] bg-transparent px-0 py-2 text-sm text-[#3e2723] focus:border-[#8b4513] focus:outline-none";
  const actionClass =
    "border-b-2 border-transparent px-1 py-2 text-sm font-medium transition-colors";

  const set = (key: string, val: unknown) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEdit ? `/api/admin/categories/${category!.id}` : "/api/admin/categories";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    setSaving(false);

    if (!json.success) {
      setError(json.error || "Failed to save");
      return;
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md border border-[#d7ccc8] bg-[#fffaf2]" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-[#e8e0d8] px-6 py-4">
          <h2 className="text-lg font-bold text-[#3e2723]">{isEdit ? "Edit" : "Add"} Category</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Name *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={fieldClass} />
          </div>

          <label className="flex items-center gap-2 text-sm text-[#5d4037]">
            <input type="checkbox" checked={form.isVisible} onChange={(e) => set("isVisible", e.target.checked)} className="rounded border-[#d7ccc8]" />
            Visible on menu
          </label>

          <div className="flex justify-end gap-3 border-t border-[#e8e0d8] pt-4">
            <button type="button" onClick={onClose} className={`${actionClass} text-[#5d4037] hover:border-[#d7ccc8] hover:text-[#3e2723]`}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={`${actionClass} border-[#8b4513] text-[#8b4513] hover:border-[#a0522d] hover:text-[#a0522d] disabled:opacity-50`}>
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
