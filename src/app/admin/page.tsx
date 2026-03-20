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
    items: { menuItem: { name: string }; quantity: number }[];
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
    return <p className="py-12 text-center text-latik/62">Failed to load dashboard data.</p>;
  }

  return (
    <>
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="font-[family-name:var(--font-display)] text-4xl text-kape">Dashboard Overview</h2>
        <p className="mt-2 text-latik/68">
          Welcome back! Here&apos;s what&apos;s happening today at J&J Native Delicacies.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="rounded-[1.35rem] border border-latik/12 bg-asukal/90 p-6 shadow-[0_16px_30px_rgba(59,31,14,0.10)]">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-full bg-pandan/12 p-2 text-pandan">
              <DollarSign className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <ChangeBadge value={data.revenueChange} />
          </div>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-latik/55">Today&apos;s Sales</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-kape">{formatCurrency(data.todayRevenue)}</h3>
        </div>

        {/* Orders */}
        <div className="rounded-[1.35rem] border border-latik/12 bg-asukal/90 p-6 shadow-[0_16px_30px_rgba(59,31,14,0.10)]">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-full bg-pulot/12 p-2 text-pulot">
              <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <ChangeBadge value={data.orderChange} />
          </div>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-latik/55">Total Orders</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-kape">{data.todayOrderCount}</h3>
        </div>

        {/* Popular */}
        <div className="rounded-[1.35rem] border border-latik/12 bg-asukal/90 p-6 shadow-[0_16px_30px_rgba(59,31,14,0.10)]">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-full bg-amber-100 p-2 text-amber-700">
              <Star className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <span className="rounded-full bg-gatas px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-latik/55">
              Popular
            </span>
          </div>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-latik/55">Most Popular</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-kape">{data.mostPopular}</h3>
        </div>

        {/* Active Orders */}
        <div className="rounded-[1.35rem] border border-latik/12 bg-asukal/90 p-6 shadow-[0_16px_30px_rgba(59,31,14,0.10)]">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-full bg-ube/10 p-2 text-ube">
              <Package className="h-5 w-5" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-latik/55">Active Orders</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-kape">
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
        <div className="overflow-hidden rounded-[1.5rem] border border-latik/12 bg-asukal/92 shadow-[0_18px_34px_rgba(59,31,14,0.10)] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-latik/10 p-6">
            <h3 className="font-[family-name:var(--font-display)] text-2xl text-kape">Recent Orders</h3>
            <Link href="/admin/orders" className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik hover:text-pulot">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gatas/70">
                  <th className="px-6 py-4 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-latik/55">
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
              <tbody className="divide-y divide-latik/8">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-pulot/6">
                    <td className="px-6 py-4 text-sm font-medium">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold">{order.customerName}</div>
                      <div className="text-xs text-latik/58">
                        {order.deliveryAddress
                          ? (order.deliveryAddress as { city?: string }).city ?? order.orderType
                          : order.orderType === "PICKUP"
                            ? "Pickup"
                            : "Delivery"}
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate px-6 py-4 text-sm">
                      {order.items.map((i) => `${i.menuItem.name}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(", ")}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.16em] ${STATUS_BADGE[order.status] || "bg-gatas text-latik"}`}
                      >
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="text-latik hover:text-pulot">
                        <SquarePen className="h-5 w-5" strokeWidth={1.5} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-latik/48">
                      No orders yet today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Quick Look */}
        <div className="flex flex-col overflow-hidden rounded-[1.5rem] border border-latik/12 bg-asukal/92 shadow-[0_18px_34px_rgba(59,31,14,0.10)]">
          <div className="border-b border-latik/10 p-6">
            <h3 className="font-[family-name:var(--font-display)] text-2xl text-kape">Product Quick Look</h3>
            <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-latik/52">Toggle item availability</p>
          </div>
          <div className="flex-1 space-y-4 p-6">
            {data.products.map((product) => (
              <ProductToggle key={product.id} product={product} />
            ))}
            {data.products.length === 0 && (
              <p className="py-4 text-center text-sm text-latik/48">No products found</p>
            )}
          </div>
          <div className="p-6">
            <Link
              href="/admin/menu"
              className="block w-full rounded-full border border-latik/18 bg-gatas/75 py-3 text-center text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik transition-all duration-300 ease-in-out hover:bg-gatas"
            >
              Manage Full Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 grid grid-cols-1 gap-8 pb-12 md:grid-cols-3">
        {/* Order Hotspots Placeholder */}
        <div className="rounded-[1.5rem] border border-latik/12 bg-asukal/92 p-6 shadow-[0_18px_34px_rgba(59,31,14,0.10)] md:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-display)] text-2xl text-kape">Order Hotspots</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-latik/55">
                <span className="h-2 w-2 rounded-full bg-pulot" /> High
              </span>
              <span className="flex items-center gap-1 text-xs text-latik/55">
                <span className="h-2 w-2 rounded-full bg-pulot/30" /> Low
              </span>
            </div>
          </div>
          <div className="flex aspect-[21/9] items-center justify-center overflow-hidden rounded-[1.25rem] border border-latik/10 bg-gatas/70">
            <div className="text-center">
              <Package className="mx-auto mb-2 h-10 w-10 text-latik/28" strokeWidth={1.5} />
              <p className="text-sm font-medium text-latik/52">Interactive Delivery Heatmap</p>
              <p className="text-xs uppercase tracking-[0.16em] text-latik/40">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-pulot/20 bg-pulot/10 p-6 text-center shadow-[0_18px_34px_rgba(59,31,14,0.10)]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pulot text-asukal">
            <Headset className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h4 className="mb-2 font-[family-name:var(--font-display)] text-2xl text-kape">Need Assistance?</h4>
          <p className="mb-6 text-sm leading-6 text-latik/72">
            Having trouble with an order or the dashboard? Contact our support team.
          </p>
          <button className="w-full rounded-full border border-latik bg-asukal py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik transition-all duration-300 ease-in-out hover:-translate-y-px hover:bg-latik hover:text-asukal">
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
        <TrendingUp className="h-3 w-3" strokeWidth={1.5} />+{value}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-500">
        <TrendingDown className="h-3 w-3" strokeWidth={1.5} />{value}%
      </span>
    );
  }
  return (
    <span className="rounded-full bg-gatas px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-latik/55">0%</span>
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
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pulot/12">
          <Package className="h-5 w-5 text-pulot" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-semibold text-kape">{product.name}</p>
          <p className={`text-xs ${!available ? "text-red-800/75" : "text-latik/60"}`}>{subtitle}</p>
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
        <div className="peer relative h-6 w-11 rounded-full bg-latik/15 after:absolute after:top-[2px] after:start-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-asukal after:bg-asukal after:transition-all peer-checked:bg-pulot peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full" />
      </label>
    </div>
  );
}

