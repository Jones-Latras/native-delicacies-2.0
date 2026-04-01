"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2, ShoppingBag, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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

  async function openDetail(id: string) {
    setDetailLoading(true);
    setDetail(null);
    const res = await fetch(`/api/admin/customers/${id}`);
    const json = await res.json();
    if (json.success) setDetail(json.data);
    setDetailLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#d7ccc8] pb-4">
        <h1 className="text-2xl font-bold text-[#3e2723]">Customers</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1887f]" />
          <input
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full border border-[#d7ccc8] bg-transparent py-2 pl-9 pr-3 text-sm focus:border-[#8b4513] focus:outline-none"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            setPage(1);
          }}
          className="border border-[#d7ccc8] bg-transparent px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="STAFF">Staff</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="overflow-x-auto border-t border-[#e8e0d8]">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-[#8d6e63]">
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
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Loader2 className="mx-auto animate-spin text-[#a1887f]" size={24} />
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#a1887f]">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="cursor-pointer transition-colors hover:bg-[#faf8f5]"
                  onClick={() => openDetail(customer.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center bg-[#f5f0eb] text-[#8b4513] text-sm font-medium">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[#3e2723]">{customer.name}</p>
                        <p className="text-xs text-[#a1887f]">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6d4c41]">{customer.phone || "-"}</td>
                  <td className="px-4 py-3 text-center text-[#6d4c41]">{customer._count.orders}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[customer.role] || ""}`}>
                      {customer.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8d6e63]">{new Date(customer.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[#8d6e63]">
          <span>
            {total} total customers - page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="border border-[#d7ccc8] p-1.5 hover:bg-[#f5f0eb] disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="border border-[#d7ccc8] p-1.5 hover:bg-[#f5f0eb] disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => { setDetail(null); setDetailLoading(false); }}>
          <div className="w-full max-w-md overflow-y-auto border-l border-[#e8e0d8] bg-[#fffaf2]" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e8e0d8] px-6 py-4">
              <h2 className="text-lg font-bold text-[#3e2723]">Customer Detail</h2>
              <button onClick={() => { setDetail(null); setDetailLoading(false); }} className="p-1 hover:bg-[#f5f0eb]">
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#8b4513]" size={28} />
              </div>
            ) : detail ? (
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center bg-[#f5f0eb] text-xl font-bold text-[#8b4513]">
                    {detail.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#3e2723]">{detail.name}</p>
                    <p className="text-sm text-[#a1887f]">{detail.email}</p>
                    {detail.phone && <p className="text-sm text-[#a1887f]">{detail.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 border-y border-[#e8e0d8] py-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-[#3e2723]">{detail._count.orders}</p>
                    <p className="text-xs text-[#a1887f]">Orders</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#3e2723]">{formatCurrency(detail.totalSpent)}</p>
                    <p className="text-xs text-[#a1887f]">Total Spent</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#3e2723]">{new Date(detail.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-[#a1887f]">Joined</p>
                  </div>
                </div>

                {detail.addresses.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-[#5d4037]">Addresses</h3>
                    <div className="divide-y divide-[#e8e0d8]">
                      {detail.addresses.map((address) => (
                        <div key={address.id} className="py-3 text-sm text-[#6d4c41] first:pt-0 last:pb-0">
                          <span className="font-medium">{address.label}</span> - {address.street}, {address.city} {address.postalCode}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-[#5d4037]">Recent Orders</h3>
                  {detail.orders.length === 0 ? (
                    <p className="text-sm text-[#a1887f]">No orders yet</p>
                  ) : (
                    <div className="divide-y divide-[#e8e0d8]">
                      {detail.orders.map((order) => (
                        <a
                          key={order.id}
                          href={`/admin/orders/${order.id}`}
                          className="flex items-center justify-between py-3 text-sm transition-colors hover:bg-[#faf8f5] first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag size={14} className="text-[#a1887f]" />
                            <span className="font-medium text-[#3e2723]">#{order.orderNumber}</span>
                            <span className="text-[#a1887f]">{order.orderType}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[#6d4c41]">{formatCurrency(order.total)}</span>
                            <span className="rounded-full bg-[#f5f0eb] px-2 py-0.5 text-xs text-[#8b4513]">{order.status}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
