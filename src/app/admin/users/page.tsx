"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Trash2, Loader2, Shield, ChevronLeft, ChevronRight, X,
} from "lucide-react";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  MANAGER: "bg-purple-100 text-purple-700",
  STAFF: "bg-blue-100 text-blue-700",
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params}`);
    const json = await res.json();
    if (json.success) {
      setUsers(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const changeRole = async (id: string, role: string) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    fetchUsers();
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from staff? This cannot be undone.`)) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3e2723]">Staff Management</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-[#8b4513] px-4 py-2 text-sm font-medium text-white hover:bg-[#a0522d] transition-colors"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1887f]" />
        <input
          placeholder="Search staff..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-[#d7ccc8] bg-white py-2 pl-9 pr-3 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#e8e0d8] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f8f7f6] text-left text-xs uppercase text-[#8d6e63]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ebe6]">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="mx-auto animate-spin text-[#a1887f]" size={24} /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-[#a1887f]">No staff found</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-[#faf8f5] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f0eb] text-[#8b4513] font-medium text-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-[#3e2723]">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#6d4c41]">{u.email}</td>
                <td className="px-4 py-3 text-[#6d4c41]">{u.phone || "—"}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className={`rounded-full border-0 px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[u.role] || ""}`}
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-[#8d6e63]">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => deleteUser(u.id, u.name)}
                    className="rounded-md p-1.5 text-[#8d6e63] hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
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

      {/* Create Staff Modal */}
      {showCreate && (
        <CreateStaffModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchUsers(); }}
        />
      )}
    </div>
  );
}

function CreateStaffModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "STAFF",
    password: "",
  });

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);

    if (!json.success) {
      setError(json.error || "Failed to create user");
      return;
    }
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#e8e0d8] px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#3e2723]"><Shield size={18} /> Add Staff Member</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-[#f5f0eb]"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Name *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Email *</label>
            <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Phone</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Role *</label>
            <select value={form.role} onChange={(e) => set("role", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none">
              <option value="STAFF">Staff</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5d4037]">Password *</label>
            <input required type="password" minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min 8 characters" className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
          </div>

          <div className="flex justify-end gap-3 border-t border-[#e8e0d8] pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-[#d7ccc8] px-4 py-2 text-sm font-medium text-[#5d4037] hover:bg-[#f5f0eb]">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#8b4513] px-4 py-2 text-sm font-medium text-white hover:bg-[#a0522d] disabled:opacity-50">
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
