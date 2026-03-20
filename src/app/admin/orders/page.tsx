"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  SquarePen,
  RefreshCw,
} from "lucide-react";

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderType: string;
  status: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  deliveryAddress: { city?: string } | null;
  items: { menuItem: { name: string }; quantity: number }[];
}

const STATUS_BADGE: Record<string, string> = {
  NEW: "bg-gatas text-latik",
  CONFIRMED: "bg-pulot/10 text-pulot",
  PREPARING: "bg-amber-100 text-amber-700",
  READY: "bg-pandan/10 text-pandan",
  OUT_FOR_DELIVERY: "bg-ube/10 text-ube",
  COMPLETED: "bg-pandan/10 text-pandan",
  CANCELLED: "bg-red-900/8 text-red-800/85",
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUSES = ["", "NEW", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"];
const ORDER_TYPES = ["", "DELIVERY", "PICKUP"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (orderTypeFilter) params.set("orderType", orderTypeFilter);

    try {
      const res = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
        setTotalPages(json.totalPages);
        setTotal(json.total);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, orderTypeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  }

  // Quick status update
  async function advanceStatus(orderId: string, currentStatus: string) {
    const next: Record<string, string> = {
      NEW: "CONFIRMED",
      CONFIRMED: "PREPARING",
      PREPARING: "READY",
      READY: "OUT_FOR_DELIVERY",
      OUT_FOR_DELIVERY: "COMPLETED",
    };
    const nextStatus = next[currentStatus];
    if (!nextStatus) return;

    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchOrders();
    } catch {
      /* ignore */
    }
  }

  function timeSince(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-4xl text-kape">Orders</h2>
          <p className="mt-2 text-latik/68">
            {total} total order{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 rounded-full border border-latik/18 bg-gatas/80 px-4 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik transition-all duration-300 ease-in-out hover:bg-gatas"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} /> Refresh
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-latik/45" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, name, email, phone..."
            className="w-full rounded-full border border-latik/18 bg-asukal/88 py-3 pl-11 pr-4 text-sm text-kape placeholder:text-latik/45 focus:border-pandan focus:outline-none focus:ring-2 focus:ring-pandan/20"
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-full border px-4 py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-all duration-300 ease-in-out ${
            showFilters ? "border-pulot/30 bg-pulot/10 text-pulot" : "border-latik/18 bg-asukal/88 text-latik"
          }`}
        >
          <Filter className="h-4 w-4" strokeWidth={1.5} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 flex flex-wrap gap-3 rounded-[1.25rem] border border-latik/12 bg-asukal/88 p-4 shadow-[0_16px_30px_rgba(59,31,14,0.08)]">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-full border border-latik/18 bg-gatas/80 px-4 py-2.5 text-sm text-latik focus:border-pandan focus:outline-none"
          >
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>
            ))}
          </select>
          <select
            value={orderTypeFilter}
            onChange={(e) => { setOrderTypeFilter(e.target.value); setPage(1); }}
            className="rounded-full border border-latik/18 bg-gatas/80 px-4 py-2.5 text-sm text-latik focus:border-pandan focus:outline-none"
          >
            <option value="">All Types</option>
            {ORDER_TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>{t === "DELIVERY" ? "Delivery" : "Pickup"}</option>
            ))}
          </select>
          <button
            onClick={() => { setStatusFilter(""); setOrderTypeFilter(""); setSearch(""); setPage(1); }}
            className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-latik hover:text-pulot"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-[1.5rem] border border-latik/12 bg-asukal/92 shadow-[0_18px_34px_rgba(59,31,14,0.10)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gatas/70">
                <th className="px-6 py-4 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-latik/55">Order</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Items</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Time</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latik/8">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-latik/10" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-latik/48">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-pulot/6">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold">{order.orderNumber}</p>
                      <p className="text-xs text-latik/58">{order.orderType === "PICKUP" ? "Pickup" : "Delivery"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold">{order.customerName}</p>
                      <p className="text-xs text-latik/58">{order.customerEmail}</p>
                    </td>
                    <td className="max-w-[200px] truncate px-6 py-4 text-sm text-latik/72">
                      {order.items.map((i) => `${i.menuItem.name}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(", ")}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.16em] ${STATUS_BADGE[order.status] || "bg-gatas text-latik"}`}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-latik/58">{timeSince(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                          <button
                            onClick={() => advanceStatus(order.id, order.status)}
                            className="rounded-full border border-pulot bg-pulot px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-asukal transition-all duration-300 ease-in-out hover:brightness-110"
                            title="Advance status"
                          >
                            Next →
                          </button>
                        )}
                        <Link href={`/admin/orders/${order.id}`} className="text-latik hover:text-pulot">
                          <SquarePen className="h-4 w-4" strokeWidth={1.5} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-latik/10 px-6 py-4">
            <p className="text-sm text-latik/62">
              Page {page} of {totalPages} ({total} orders)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-full border border-latik/18 bg-gatas/80 p-2 text-latik transition-all duration-300 ease-in-out hover:bg-gatas disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-full border border-latik/18 bg-gatas/80 p-2 text-latik transition-all duration-300 ease-in-out hover:bg-gatas disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
