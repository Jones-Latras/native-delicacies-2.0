"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, FolderOpen, Loader2,
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

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3e2723]">Menu Management</h1>
        <button
          onClick={() => {
            if (tab === "items") { setEditingItem(null); setShowItemModal(true); }
            else { setEditingCat(null); setShowCatModal(true); }
          }}
          className="flex items-center gap-2 rounded-lg bg-[#8b4513] px-4 py-2 text-sm font-medium text-white hover:bg-[#a0522d] transition-colors"
        >
          <Plus size={16} /> Add {tab === "items" ? "Item" : "Category"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-[#f5f0eb] p-1 w-fit">
        <button
          onClick={() => setTab("items")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "items" ? "bg-white text-[#8b4513] shadow-sm" : "text-[#6d4c41] hover:text-[#3e2723]"}`}
        >
          Menu Items ({total})
        </button>
        <button
          onClick={() => setTab("categories")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "categories" ? "bg-white text-[#8b4513] shadow-sm" : "text-[#6d4c41] hover:text-[#3e2723]"}`}
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
                className="w-full rounded-lg border border-[#d7ccc8] bg-white py-2 pl-9 pr-3 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="rounded-lg border border-[#d7ccc8] bg-white px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Items Table */}
          <div className="overflow-hidden rounded-xl border border-[#e8e0d8] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#f8f7f6] text-left text-xs uppercase text-[#8d6e63]">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-center">Available</th>
                  <th className="px-4 py-3 text-center">Sold Today</th>
                  <th className="px-4 py-3 text-right">Actions</th>
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
                      {item.soldToday}{item.dailyLimit ? `/${item.dailyLimit}` : ""}
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
        <div className="overflow-hidden rounded-xl border border-[#e8e0d8] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#f8f7f6] text-left text-xs uppercase text-[#8d6e63]">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-center">Visible</th>
                <th className="px-4 py-3 text-right">Actions</th>
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

  const [form, setForm] = useState({
    name: item?.name ?? "",
    description: "",
    categoryId: item?.categoryId ?? (categories[0]?.id ?? ""),
    price: item?.price ?? 0,
    imageUrl: item?.imageUrl ?? "",
    isAvailable: item?.isAvailable ?? true,
    isFeatured: item?.isFeatured ?? false,
    dailyLimit: item?.dailyLimit ?? "",
  });

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
              dailyLimit: d.dailyLimit ?? "",
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

    const payload = {
      ...form,
      price: Number(form.price),
      dailyLimit: form.dailyLimit === "" ? null : Number(form.dailyLimit),
      imageUrl: form.imageUrl || undefined,
    };

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
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-[#e8e0d8] px-6 py-4">
          <h2 className="text-lg font-bold text-[#3e2723]">{isEdit ? "Edit" : "Add"} Menu Item</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Name *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Description *</label>
            <textarea required rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Category *</label>
              <select required value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Price (₱) *</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Image URL</label>
            <input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Daily Limit</label>
            <input type="number" min="1" value={form.dailyLimit} onChange={(e) => set("dailyLimit", e.target.value)} placeholder="No limit" className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
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
            <button type="button" onClick={onClose} className="rounded-lg border border-[#d7ccc8] px-4 py-2 text-sm font-medium text-[#5d4037] hover:bg-[#f5f0eb]">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#8b4513] px-4 py-2 text-sm font-medium text-white hover:bg-[#a0522d] disabled:opacity-50">
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
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-[#e8e0d8] px-6 py-4">
          <h2 className="text-lg font-bold text-[#3e2723]">{isEdit ? "Edit" : "Add"} Category</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Name *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
          </div>

          <label className="flex items-center gap-2 text-sm text-[#5d4037]">
            <input type="checkbox" checked={form.isVisible} onChange={(e) => set("isVisible", e.target.checked)} className="rounded border-[#d7ccc8]" />
            Visible on menu
          </label>

          <div className="flex justify-end gap-3 border-t border-[#e8e0d8] pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-[#d7ccc8] px-4 py-2 text-sm font-medium text-[#5d4037] hover:bg-[#f5f0eb]">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#8b4513] px-4 py-2 text-sm font-medium text-white hover:bg-[#a0522d] disabled:opacity-50">
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
