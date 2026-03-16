"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, Loader2, Tag, X,
} from "lucide-react";

interface Promo {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  expiryDate: string | null;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  _count: { redemptions: number };
  createdAt: string;
}

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Promo | null>(null);

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    if (filterActive) params.set("active", filterActive);
    const res = await fetch(`/api/admin/promotions?${params}`);
    const json = await res.json();
    if (json.success) {
      setPromos(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    }
    setLoading(false);
  }, [page, search, filterActive]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPromos();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchPromos]);

  const toggleActive = async (p: Promo) => {
    await fetch(`/api/admin/promotions/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    fetchPromos();
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
    fetchPromos();
  };

  const isExpired = (d: string | null) => d ? new Date(d) < new Date() : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3e2723]">Promotions</h1>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 rounded-lg bg-[#8b4513] px-4 py-2 text-sm font-medium text-white hover:bg-[#a0522d] transition-colors"
        >
          <Plus size={16} /> New Promo Code
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1887f]" />
          <input
            placeholder="Search by code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-[#d7ccc8] bg-white py-2 pl-9 pr-3 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
          />
        </div>
        <select
          value={filterActive}
          onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}
          className="rounded-lg border border-[#d7ccc8] bg-white px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#e8e0d8] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f8f7f6] text-left text-xs uppercase text-[#8d6e63]">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3 text-center">Used</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ebe6]">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="mx-auto animate-spin text-[#a1887f]" size={24} /></td></tr>
            ) : promos.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-[#a1887f]">No promotions found</td></tr>
            ) : promos.map((p) => (
              <tr key={p.id} className="hover:bg-[#faf8f5] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-[#a1887f]" />
                    <span className="font-mono font-medium text-[#3e2723]">{p.code}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#6d4c41]">
                  {p.discountType === "PERCENTAGE" ? `${p.discountValue}%` : `₱${p.discountValue.toFixed(2)}`}
                  {p.maxDiscount ? ` (max ₱${p.maxDiscount})` : ""}
                </td>
                <td className="px-4 py-3 text-[#6d4c41]">{p.minOrderAmount ? `₱${p.minOrderAmount}` : "—"}</td>
                <td className="px-4 py-3 text-center text-[#6d4c41]">
                  {p.usedCount}{p.usageLimit ? `/${p.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3">
                  {p.expiryDate ? (
                    <span className={isExpired(p.expiryDate) ? "text-red-500" : "text-[#6d4c41]"}>
                      {new Date(p.expiryDate).toLocaleDateString()}
                      {isExpired(p.expiryDate) && " (expired)"}
                    </span>
                  ) : (
                    <span className="text-[#a1887f]">Never</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleActive(p)} className="inline-flex">
                    {p.isActive
                      ? <ToggleRight size={24} className="text-green-600" />
                      : <ToggleLeft size={24} className="text-gray-400" />
                    }
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setEditing(p); setShowModal(true); }} className="rounded-md p-1.5 text-[#8d6e63] hover:bg-[#f5f0eb] hover:text-[#8b4513]"><Pencil size={15} /></button>
                    <button onClick={() => deletePromo(p.id)} className="rounded-md p-1.5 text-[#8d6e63] hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[#8d6e63]">
          <span>{total} total — page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-md border border-[#d7ccc8] p-1.5 hover:bg-[#f5f0eb] disabled:opacity-40"><ChevronLeft size={16} /></button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-md border border-[#d7ccc8] p-1.5 hover:bg-[#f5f0eb] disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Promo Modal */}
      {showModal && (
        <PromoModal
          promo={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchPromos(); }}
        />
      )}
    </div>
  );
}

function PromoModal({ promo, onClose, onSaved }: { promo: Promo | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!promo;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: promo?.code ?? "",
    discountType: promo?.discountType ?? "PERCENTAGE",
    discountValue: promo?.discountValue ?? 10,
    minOrderAmount: promo?.minOrderAmount ?? "",
    maxDiscount: promo?.maxDiscount ?? "",
    expiryDate: promo?.expiryDate ? promo.expiryDate.split("T")[0] : "",
    isActive: promo?.isActive ?? true,
    usageLimit: promo?.usageLimit ?? "",
  });

  const set = (key: string, val: unknown) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount === "" ? null : Number(form.minOrderAmount),
      maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),
      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
    };

    const url = isEdit ? `/api/admin/promotions/${promo!.id}` : "/api/admin/promotions";
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
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#e8e0d8] px-6 py-4">
          <h2 className="text-lg font-bold text-[#3e2723]">{isEdit ? "Edit" : "New"} Promo Code</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-[#f5f0eb]"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Code *</label>
            <input required value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="e.g. SAVE20" className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 font-mono text-sm uppercase focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Type</label>
              <select value={form.discountType} onChange={(e) => set("discountType", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₱)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Value *</label>
              <input required type="number" step="0.01" min="0" value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Min Order (₱)</label>
              <input type="number" step="0.01" min="0" value={form.minOrderAmount} onChange={(e) => set("minOrderAmount", e.target.value)} placeholder="No minimum" className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Max Discount (₱)</label>
              <input type="number" step="0.01" min="0" value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} placeholder="No max" className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Expiry Date</label>
              <input type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Usage Limit</label>
              <input type="number" min="1" value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} placeholder="Unlimited" className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#5d4037]">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="rounded" />
            Active
          </label>

          <div className="flex justify-end gap-3 border-t border-[#e8e0d8] pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-[#d7ccc8] px-4 py-2 text-sm font-medium text-[#5d4037] hover:bg-[#f5f0eb]">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#8b4513] px-4 py-2 text-sm font-medium text-white hover:bg-[#a0522d] disabled:opacity-50">
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
