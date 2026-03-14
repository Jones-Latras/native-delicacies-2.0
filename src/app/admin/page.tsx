"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  Star,
  TrendingUp,
  TrendingDown,
  Package,
  Headset,
  SquarePen,
} from "lucide-react";

interface DashboardData {
  todayRevenue: number;
  revenueChange: number;
  todayOrderCount: number;
  orderChange: number;
  mostPopular: string;
  statusCounts: Record<string, number>;
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    orderType: string;
    status: string;
    total: number;
    paymentStatus: string;
    createdAt: string;
    deliveryAddress: { city?: string } | null;
    items: { menuItemName: string; quantity: number }[];
  }[];
  products: {
    id: string;
    name: string;
    isAvailable: boolean;
    isFeatured: boolean;
    dailyLimit: number | null;
    soldToday: number;
  }[];
}

const STATUS_BADGE: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-orange-100 text-orange-700",
  READY: "bg-amber-100 text-amber-700",
  OUT_FOR_DELIVERY: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
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

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      /* silently retry next interval */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return <p className="py-12 text-center text-slate-500">Failed to load dashboard data.</p>;
  }

  return (
    <>
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Dashboard Overview</h2>
        <p className="mt-1 text-slate-500">
          Welcome back! Here&apos;s what&apos;s happening today at J&J Native Delicacies.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <ChangeBadge value={data.revenueChange} />
          </div>
          <p className="text-sm font-medium text-slate-500">Today&apos;s Sales</p>
          <h3 className="mt-1 text-2xl font-black">{formatCurrency(data.todayRevenue)}</h3>
        </div>

        {/* Orders */}
        <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <ChangeBadge value={data.orderChange} />
          </div>
          <p className="text-sm font-medium text-slate-500">Total Orders</p>
          <h3 className="mt-1 text-2xl font-black">{data.todayOrderCount}</h3>
        </div>

        {/* Popular */}
        <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
              <Star className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-bold text-slate-400">
              Popular
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Most Popular</p>
          <h3 className="mt-1 text-2xl font-black">{data.mostPopular}</h3>
        </div>

        {/* Active Orders */}
        <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Active Orders</p>
          <h3 className="mt-1 text-2xl font-black">
            {(data.statusCounts["NEW"] || 0) +
              (data.statusCounts["CONFIRMED"] || 0) +
              (data.statusCounts["PREPARING"] || 0) +
              (data.statusCounts["READY"] || 0) +
              (data.statusCounts["OUT_FOR_DELIVERY"] || 0)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-primary/10 p-6">
            <h3 className="text-lg font-bold">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm font-bold text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Items
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-primary/5">
                    <td className="px-6 py-4 text-sm font-medium">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold">{order.customerName}</div>
                      <div className="text-xs text-slate-500">
                        {order.deliveryAddress
                          ? (order.deliveryAddress as { city?: string }).city ?? order.orderType
                          : order.orderType === "PICKUP"
                            ? "Pickup"
                            : "Delivery"}
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate px-6 py-4 text-sm">
                      {order.items.map((i) => `${i.menuItemName}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(", ")}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${STATUS_BADGE[order.status] || "bg-slate-100 text-slate-700"}`}
                      >
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="text-primary hover:text-primary/70">
                        <SquarePen className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                      No orders yet today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Quick Look */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
          <div className="border-b border-primary/10 p-6">
            <h3 className="text-lg font-bold">Product Quick Look</h3>
            <p className="mt-1 text-xs text-slate-500">Toggle item availability</p>
          </div>
          <div className="flex-1 space-y-4 p-6">
            {data.products.map((product) => (
              <ProductToggle key={product.id} product={product} />
            ))}
            {data.products.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">No products found</p>
            )}
          </div>
          <div className="p-6">
            <Link
              href="/admin/menu"
              className="block w-full rounded-lg bg-slate-100 py-2 text-center text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Manage Full Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 grid grid-cols-1 gap-8 pb-12 md:grid-cols-3">
        {/* Order Hotspots Placeholder */}
        <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm md:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Order Hotspots</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-primary" /> High
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-primary/30" /> Low
              </span>
            </div>
          </div>
          <div className="flex aspect-[21/9] items-center justify-center overflow-hidden rounded-xl border border-primary/5 bg-primary/5">
            <div className="text-center">
              <Package className="mx-auto mb-2 h-10 w-10 text-primary/40" />
              <p className="text-sm font-medium text-slate-400">Interactive Delivery Heatmap</p>
              <p className="text-xs text-slate-400">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
            <Headset className="h-8 w-8" />
          </div>
          <h4 className="mb-2 text-lg font-bold">Need Assistance?</h4>
          <p className="mb-6 text-sm text-slate-600">
            Having trouble with an order or the dashboard? Contact our support team.
          </p>
          <button className="w-full rounded-lg border-2 border-primary py-2 font-bold text-primary transition-all hover:bg-primary hover:text-white">
            Chat with Support
          </button>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ──

function ChangeBadge({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
        <TrendingUp className="h-3 w-3" />+{value}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-500">
        <TrendingDown className="h-3 w-3" />{value}%
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-bold text-slate-400">0%</span>
  );
}

function ProductToggle({
  product,
}: {
  product: {
    id: string;
    name: string;
    isAvailable: boolean;
    isFeatured: boolean;
    dailyLimit: number | null;
    soldToday: number;
  };
}) {
  const [available, setAvailable] = useState(product.isAvailable);
  const [toggling, setToggling] = useState(false);

  async function toggle() {
    setToggling(true);
    const next = !available;
    try {
      const res = await fetch(`/api/admin/menu-items/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: next }),
      });
      const json = await res.json();
      if (json.success) setAvailable(next);
    } catch {
      /* revert silently */
    } finally {
      setToggling(false);
    }
  }

  const subtitle = !available
    ? "Out of Stock"
    : product.isFeatured
      ? "Best Seller"
      : product.dailyLimit
        ? `Limit: ${product.soldToday}/${product.dailyLimit}`
        : "Available";

  return (
    <div className={`flex items-center justify-between ${!available ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold">{product.name}</p>
          <p className={`text-xs ${!available ? "text-red-500" : "text-slate-500"}`}>{subtitle}</p>
        </div>
      </div>
      <label className="inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={available}
          onChange={toggle}
          disabled={toggling}
        />
        <div className="peer relative h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:start-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full" />
      </label>
    </div>
  );
}
