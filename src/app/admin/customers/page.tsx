"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, ChevronLeft, ChevronRight, Loader2, User, ShoppingBag, X,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

interface CustomerDetail extends Customer {
  totalSpent: number;
  addresses: { id: string; label: string; street: string; city: string; postalCode: string }[];
  orders: { id: string; orderNumber: string; status: string; total: number; createdAt: string; orderType: string }[];
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  MANAGER: "bg-purple-100 text-purple-700",
  STAFF: "bg-blue-100 text-blue-700",
  CUSTOMER: "bg-[#f5f0eb] text-[#8b4513]",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    if (filterRole) params.set("role", filterRole);
    const res = await fetch(`/api/admin/customers?${params}`);
    const json = await res.json();
    if (json.success) {
      setCustomers(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    }
    setLoading(false);
  }, [page, search, filterRole]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCustomers();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    const res = await fetch(`/api/admin/customers/${id}`);
    const json = await res.json();
    if (json.success) setDetail(json.data);
    setDetailLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#3e2723]">Customers</h1>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1887f]" />
          <input
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-[#d7ccc8] bg-white py-2 pl-9 pr-3 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
          className="rounded-lg border border-[#d7ccc8] bg-white px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="STAFF">Staff</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#e8e0d8] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f8f7f6] text-left text-xs uppercase text-[#8d6e63]">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-center">Orders</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ebe6]">
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="mx-auto animate-spin text-[#a1887f]" size={24} /></td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-[#a1887f]">No customers found</td></tr>
            ) : customers.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-[#faf8f5] transition-colors" onClick={() => openDetail(c.id)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f0eb] text-[#8b4513] font-medium text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[#3e2723]">{c.name}</p>
                      <p className="text-xs text-[#a1887f]">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#6d4c41]">{c.phone || "—"}</td>
                <td className="px-4 py-3 text-center text-[#6d4c41]">{c._count.orders}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[c.role] || ""}`}>{c.role}</span>
                </td>
                <td className="px-4 py-3 text-[#8d6e63]">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[#8d6e63]">
          <span>{total} total customers — page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-md border border-[#d7ccc8] p-1.5 hover:bg-[#f5f0eb] disabled:opacity-40"><ChevronLeft size={16} /></button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-md border border-[#d7ccc8] p-1.5 hover:bg-[#f5f0eb] disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Detail Slide-Over */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => { setDetail(null); setDetailLoading(false); }}>
          <div className="w-full max-w-md bg-white shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e8e0d8] bg-white px-6 py-4">
              <h2 className="text-lg font-bold text-[#3e2723]">Customer Detail</h2>
              <button onClick={() => { setDetail(null); setDetailLoading(false); }} className="rounded-md p-1 hover:bg-[#f5f0eb]"><X size={18} /></button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[#8b4513]" size={28} /></div>
            ) : detail && (
              <div className="space-y-6 p-6">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f0eb] text-[#8b4513] text-xl font-bold">
                    {detail.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#3e2723]">{detail.name}</p>
                    <p className="text-sm text-[#a1887f]">{detail.email}</p>
                    {detail.phone && <p className="text-sm text-[#a1887f]">{detail.phone}</p>}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-[#f8f7f6] p-3 text-center">
                    <p className="text-lg font-bold text-[#3e2723]">{detail._count.orders}</p>
                    <p className="text-xs text-[#a1887f]">Orders</p>
                  </div>
                  <div className="rounded-lg bg-[#f8f7f6] p-3 text-center">
                    <p className="text-lg font-bold text-[#3e2723]">₱{detail.totalSpent.toFixed(0)}</p>
                    <p className="text-xs text-[#a1887f]">Total Spent</p>
                  </div>
                  <div className="rounded-lg bg-[#f8f7f6] p-3 text-center">
                    <p className="text-lg font-bold text-[#3e2723]">{new Date(detail.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-[#a1887f]">Joined</p>
                  </div>
                </div>

                {/* Addresses */}
                {detail.addresses.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-[#5d4037]">Addresses</h3>
                    <div className="space-y-2">
                      {detail.addresses.map((a) => (
                        <div key={a.id} className="rounded-lg border border-[#e8e0d8] p-3 text-sm text-[#6d4c41]">
                          <span className="font-medium">{a.label}</span> — {a.street}, {a.city} {a.postalCode}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Orders */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-[#5d4037]">Recent Orders</h3>
                  {detail.orders.length === 0 ? (
                    <p className="text-sm text-[#a1887f]">No orders yet</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.orders.map((o) => (
                        <a
                          key={o.id}
                          href={`/admin/orders/${o.id}`}
                          className="flex items-center justify-between rounded-lg border border-[#e8e0d8] p-3 text-sm hover:bg-[#faf8f5] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag size={14} className="text-[#a1887f]" />
                            <span className="font-medium text-[#3e2723]">#{o.orderNumber}</span>
                            <span className="text-[#a1887f]">{o.orderType}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[#6d4c41]">₱{o.total.toFixed(2)}</span>
                            <span className="rounded-full bg-[#f5f0eb] px-2 py-0.5 text-xs text-[#8b4513]">{o.status}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
