"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  TrendingUp,
  ShoppingBag,
  Users,
  XCircle,
  DollarSign,
  Truck,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
    fetch(`/api/admin/reports?range=${range}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [range]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#8b4513]" size={28} />
      </div>
    );
  }

  const sortedDays = Object.keys(data.dailyRevenue).sort();
  const maxRevenue = Math.max(...Object.values(data.dailyRevenue), 1);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-[#d7ccc8] pb-4">
        <h1 className="text-2xl font-bold text-[#3e2723]">Analytics</h1>
        <div className="flex gap-4 text-sm">
          {(["7d", "30d", "90d"] as const).map((nextRange) => (
            <button
              key={nextRange}
              onClick={() => {
                setLoading(true);
                setRange(nextRange);
              }}
              className={`border-b px-0 py-1.5 font-medium transition-colors ${
                range === nextRange
                  ? "border-[#8b4513] text-[#8b4513]"
                  : "border-transparent text-[#6d4c41] hover:text-[#3e2723]"
              }`}
            >
              {nextRange === "7d" ? "7 Days" : nextRange === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-10 gap-y-6 border-t border-[#d7ccc8] pt-6">
        <KpiStat icon={<DollarSign size={18} />} label="Total Revenue" value={formatCurrency(data.totalRevenue)} />
        <KpiStat icon={<ShoppingBag size={18} />} label="Total Orders" value={String(data.totalOrders)} />
        <KpiStat icon={<TrendingUp size={18} />} label="Avg Order Value" value={formatCurrency(data.avgOrderValue)} />
        <KpiStat icon={<Users size={18} />} label="New Customers" value={String(data.newCustomers)} />
      </div>

      <section className="border-t border-[#d7ccc8] pt-6">
        <h2 className="mb-4 text-lg font-semibold text-[#3e2723]">Daily Revenue</h2>
        {sortedDays.length === 0 ? (
          <p className="text-sm text-[#a1887f]">No data for this period</p>
        ) : (
          <div className="flex h-40 items-end gap-1 border-b border-[#ece3d8] pb-2">
            {sortedDays.map((day) => {
              const value = data.dailyRevenue[day];
              const pct = (value / maxRevenue) * 100;
              return (
                <div key={day} className="group relative flex flex-1 flex-col items-center">
                  <div className="absolute -top-8 hidden whitespace-nowrap bg-[#3e2723] px-2 py-1 text-xs text-white group-hover:block">
                    {day}: {formatCurrency(value)} ({data.dailyOrders[day]} orders)
                  </div>
                  <div
                    className="min-h-[2px] w-full bg-[#8b4513] transition-colors hover:bg-[#a0522d]"
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
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="border-t border-[#d7ccc8] pt-6">
          <h2 className="mb-4 text-lg font-semibold text-[#3e2723]">Top Selling Items</h2>
          {data.topItems.length === 0 ? (
            <p className="text-sm text-[#a1887f]">No sales data</p>
          ) : (
            <div className="divide-y divide-[#ece3d8]">
              {data.topItems.map((item, index) => (
                <div key={item.menuItemId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#8b4513]">{index + 1}.</span>
                    <div>
                      <p className="text-sm font-medium text-[#3e2723]">{item.name}</p>
                      <p className="text-xs text-[#a1887f]">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#3e2723]">{item.totalQuantity} sold</p>
                    <p className="text-xs text-[#a1887f]">{item.orderCount} orders</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-8">
          <section className="border-t border-[#d7ccc8] pt-6">
            <h2 className="mb-4 text-lg font-semibold text-[#3e2723]">Order Breakdown</h2>
            <div className="space-y-3">
              <BreakdownRow icon={<Truck size={16} />} label="Delivery" value={data.deliveryCount} total={data.totalOrders} />
              <BreakdownRow icon={<Package size={16} />} label="Pickup" value={data.pickupCount} total={data.totalOrders} />
              <BreakdownRow
                icon={<XCircle size={16} />}
                label="Cancelled"
                value={data.cancelledCount}
                total={data.totalOrders + data.cancelledCount}
                color="red"
              />
            </div>
          </section>

          <section className="border-t border-[#d7ccc8] pt-6">
            <h2 className="mb-4 text-lg font-semibold text-[#3e2723]">Payment Methods</h2>
            <div className="space-y-3">
              {Object.entries(data.paymentBreakdown).map(([method, count]) => (
                <BreakdownRow key={method} label={method.replace(/_/g, " ")} value={count} total={data.totalOrders} />
              ))}
              {Object.keys(data.paymentBreakdown).length === 0 && <p className="text-sm text-[#a1887f]">No data</p>}
            </div>
          </section>

          <section className="border-t border-[#d7ccc8] pt-6">
            <h2 className="mb-4 text-lg font-semibold text-[#3e2723]">Financial Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6d4c41]">Delivery Fees</span>
                <span className="font-medium text-[#3e2723]">{formatCurrency(data.totalDeliveryFees)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6d4c41]">Tips</span>
                <span className="font-medium text-[#3e2723]">{formatCurrency(data.totalTips)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6d4c41]">Discounts Given</span>
                <span className="font-medium text-red-600">-{formatCurrency(data.totalDiscounts)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function KpiStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-[180px] flex-1">
      <div className="mb-2 flex items-center gap-2 text-sm text-[#a1887f]">
        <span className="text-[#8b4513]">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#3e2723]">{value}</p>
    </div>
  );
}

function BreakdownRow({
  icon,
  label,
  value,
  total,
  color,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number;
  total: number;
  color?: string;
}) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  const barColor = color === "red" ? "bg-red-400" : "bg-[#8b4513]";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-[#6d4c41]">
          {icon}
          {label}
        </span>
        <span className="font-medium text-[#3e2723]">
          {value} ({pct}%)
        </span>
      </div>
      <div className="h-2 bg-[#f5f0eb]">
        <div className={`h-full ${barColor}`} style={{ width: `${Math.min(Number(pct), 100)}%` }} />
      </div>
    </div>
  );
}
