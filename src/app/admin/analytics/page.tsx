"use client";

import { useState, useEffect } from "react";
import {
  Loader2, TrendingUp, ShoppingBag, Users, XCircle,
  DollarSign, Truck, Package,
} from "lucide-react";

interface ReportData {
  range: string;
  days: number;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalDeliveryFees: number;
  totalTips: number;
  totalDiscounts: number;
  deliveryCount: number;
  pickupCount: number;
  paymentBreakdown: Record<string, number>;
  dailyRevenue: Record<string, number>;
  dailyOrders: Record<string, number>;
  topItems: { menuItemId: string; name: string; price: number; totalQuantity: number; orderCount: number }[];
  newCustomers: number;
  cancelledCount: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/reports?range=${range}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
        setLoading(false);
      });
  }, [range]);

  if (loading || !data) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[#8b4513]" size={28} /></div>;
  }

  const sortedDays = Object.keys(data.dailyRevenue).sort();
  const maxRevenue = Math.max(...Object.values(data.dailyRevenue), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3e2723]">Analytics</h1>
        <div className="flex gap-1 rounded-lg bg-[#f5f0eb] p-1">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                range === r ? "bg-white text-[#8b4513] shadow-sm" : "text-[#6d4c41] hover:text-[#3e2723]"
              }`}
            >
              {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<DollarSign size={20} />} label="Total Revenue" value={`₱${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
        <KpiCard icon={<ShoppingBag size={20} />} label="Total Orders" value={String(data.totalOrders)} />
        <KpiCard icon={<TrendingUp size={20} />} label="Avg Order Value" value={`₱${data.avgOrderValue.toFixed(2)}`} />
        <KpiCard icon={<Users size={20} />} label="New Customers" value={String(data.newCustomers)} />
      </div>

      {/* Revenue Chart (simple bar chart) */}
      <div className="rounded-xl border border-[#e8e0d8] bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#3e2723]">Daily Revenue</h2>
        {sortedDays.length === 0 ? (
          <p className="text-sm text-[#a1887f]">No data for this period</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {sortedDays.map((day) => {
              const val = data.dailyRevenue[day];
              const pct = (val / maxRevenue) * 100;
              return (
                <div key={day} className="flex-1 flex flex-col items-center group relative">
                  <div className="absolute -top-8 hidden group-hover:block rounded bg-[#3e2723] px-2 py-1 text-xs text-white whitespace-nowrap z-10">
                    {day}: ₱{val.toFixed(0)} ({data.dailyOrders[day]} orders)
                  </div>
                  <div
                    className="w-full rounded-t bg-[#8b4513] hover:bg-[#a0522d] transition-colors min-h-[2px]"
                    style={{ height: `${pct}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}
        {sortedDays.length > 0 && (
          <div className="mt-2 flex justify-between text-xs text-[#a1887f]">
            <span>{sortedDays[0]}</span>
            <span>{sortedDays[sortedDays.length - 1]}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Items */}
        <div className="rounded-xl border border-[#e8e0d8] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#3e2723]">Top Selling Items</h2>
          <div className="space-y-3">
            {data.topItems.length === 0 ? (
              <p className="text-sm text-[#a1887f]">No sales data</p>
            ) : data.topItems.map((item, i) => (
              <div key={item.menuItemId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f0eb] text-xs font-bold text-[#8b4513]">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-[#3e2723]">{item.name}</p>
                    <p className="text-xs text-[#a1887f]">₱{item.price.toFixed(2)} each</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#3e2723]">{item.totalQuantity} sold</p>
                  <p className="text-xs text-[#a1887f]">{item.orderCount} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-6">
          {/* Order Types */}
          <div className="rounded-xl border border-[#e8e0d8] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#3e2723]">Order Breakdown</h2>
            <div className="space-y-3">
              <BreakdownRow icon={<Truck size={16} />} label="Delivery" value={data.deliveryCount} total={data.totalOrders} />
              <BreakdownRow icon={<Package size={16} />} label="Pickup" value={data.pickupCount} total={data.totalOrders} />
              <BreakdownRow icon={<XCircle size={16} />} label="Cancelled" value={data.cancelledCount} total={data.totalOrders + data.cancelledCount} color="red" />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-xl border border-[#e8e0d8] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#3e2723]">Payment Methods</h2>
            <div className="space-y-3">
              {Object.entries(data.paymentBreakdown).map(([method, count]) => (
                <BreakdownRow key={method} label={method.replace(/_/g, " ")} value={count} total={data.totalOrders} />
              ))}
              {Object.keys(data.paymentBreakdown).length === 0 && <p className="text-sm text-[#a1887f]">No data</p>}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="rounded-xl border border-[#e8e0d8] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#3e2723]">Financial Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#6d4c41]">Delivery Fees</span><span className="font-medium text-[#3e2723]">₱{data.totalDeliveryFees.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[#6d4c41]">Tips</span><span className="font-medium text-[#3e2723]">₱{data.totalTips.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[#6d4c41]">Discounts Given</span><span className="font-medium text-red-600">-₱{data.totalDiscounts.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e8e0d8] bg-white p-5">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f0eb] text-[#8b4513]">{icon}</div>
      <p className="text-2xl font-bold text-[#3e2723]">{value}</p>
      <p className="text-sm text-[#a1887f]">{label}</p>
    </div>
  );
}

function BreakdownRow({ icon, label, value, total, color }: { icon?: React.ReactNode; label: string; value: number; total: number; color?: string }) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  const barColor = color === "red" ? "bg-red-400" : "bg-[#8b4513]";
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="flex items-center gap-2 text-[#6d4c41]">{icon}{label}</span>
        <span className="font-medium text-[#3e2723]">{value} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-[#f5f0eb]">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(Number(pct), 100)}%` }} />
      </div>
    </div>
  );
}
