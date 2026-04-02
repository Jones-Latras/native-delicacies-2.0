"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Smartphone,
  ChefHat,
  Bike,
  MessageSquare,
} from "lucide-react";

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: "DELIVERY" | "PICKUP";
  status: string;
  deliveryAddress: { street?: string; city?: string; postalCode?: string } | null;
  scheduledTime: string | null;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  stripePaymentIntentId: string | null;
  isGift: boolean;
  giftMessage: string | null;
  specialInstructions: string | null;
  estimatedReadyTime: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string | null } | null;
  items: {
    id: string;
    quantity: number;
    priceAtOrder: number;
    customizations: unknown;
    specialInstructions: string | null;
    menuItem: { name: string; imageUrl: string | null; slug: string };
    menuItemName: string;
  }[];
  statusHistory: {
    id: string;
    status: string;
    changedBy: string | null;
    note: string | null;
    createdAt: string;
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
  NEW: "New",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const NEXT_STATUS: Record<string, string> = {
  NEW: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "COMPLETED",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  NEW: <Package className="h-4 w-4" />,
  CONFIRMED: <CheckCircle2 className="h-4 w-4" />,
  PREPARING: <ChefHat className="h-4 w-4" />,
  READY: <Package className="h-4 w-4" />,
  OUT_FOR_DELIVERY: <Bike className="h-4 w-4" />,
  COMPLETED: <CheckCircle2 className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
};

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [noteText, setNoteText] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const json = await res.json();
      if (json.success) setOrder(json.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  async function updateStatus(status: string) {
    if (updating || !order) return;
    setUpdating(true);
    try {
      const body: Record<string, string> = { status };
      if (noteText.trim()) body.note = noteText.trim();
      await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setNoteText("");
      fetchOrder();
    } catch {
      /* ignore */
    } finally {
      setUpdating(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">Order not found</p>
        <Link href="/admin/orders" className="mt-4 text-sm font-bold text-primary hover:underline">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const nextStatus = NEXT_STATUS[order.status];
  const canCancel = ["NEW", "CONFIRMED"].includes(order.status);
  const sectionClass = "border-t border-primary/10 pt-6";
  const sectionHeadingClass = "mb-4 text-sm font-bold uppercase tracking-wider text-slate-500";

  return (
    <>
      {/* Back + Header */}
      <div className="mb-6 border-b border-primary/10 pb-6">
        <Link
          href="/admin/orders"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Order {order.orderNumber}
            </h2>
            <p className="text-sm text-slate-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase ${STATUS_BADGE[order.status] || "bg-slate-100 text-slate-700"}`}
            >
              {STATUS_LABEL[order.status] || order.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status Actions */}
          {(nextStatus || canCancel) && (
            <div className={sectionClass}>
              <h3 className={sectionHeadingClass}>Update Status</h3>
              <div className="mb-4">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note (optional)..."
                  className="w-full border-b border-slate-200 bg-transparent pb-3 text-sm focus:border-primary focus:outline-none"
                  rows={2}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {nextStatus && (
                  <button
                    onClick={() => updateStatus(nextStatus)}
                    disabled={updating}
                    className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {updating ? "Updating..." : `Move to ${STATUS_LABEL[nextStatus]}`}
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => {
                      if (window.confirm("Cancel this order?")) updateStatus("CANCELLED");
                    }}
                    disabled={updating}
                    className="rounded-lg border border-red-200 px-6 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className={sectionClass}>
            <div className="mb-4">
              <h3 className="text-lg font-bold">Order Items</h3>
            </div>
            <div className="divide-y divide-primary/5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="h-14 w-14 flex-shrink-0 rounded-lg bg-primary/5 bg-cover bg-center"
                      style={
                        item.menuItem.imageUrl
                          ? { backgroundImage: `url(${item.menuItem.imageUrl})` }
                          : undefined
                      }
                    >
                      {!item.menuItem.imageUrl && (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.menuItemName || item.menuItem.name}</p>
                      <p className="text-sm text-slate-500">
                        {formatCurrency(item.priceAtOrder)} × {item.quantity}
                      </p>
                      {item.specialInstructions && (
                        <p className="mt-1 text-xs italic text-slate-400">
                          &ldquo;{item.specialInstructions}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-slate-900">
                    {formatCurrency(item.priceAtOrder * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-primary/10 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(order.deliveryFee)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                )}
                {order.tip > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tip</span>
                    <span>{formatCurrency(order.tip)}</span>
                  </div>
                )}
                <hr className="border-primary/10" />
                <div className="flex justify-between text-lg font-black text-primary">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className={sectionClass}>
            <h3 className="mb-4 text-lg font-bold">Status Timeline</h3>
            <div className="space-y-4">
              {order.statusHistory.map((entry, i) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        i === order.statusHistory.length - 1
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {STATUS_ICONS[entry.status] || <Clock className="h-4 w-4" />}
                    </div>
                    {i < order.statusHistory.length - 1 && (
                      <div className="mt-1 h-8 w-px bg-slate-200" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-bold text-slate-900">
                      {STATUS_LABEL[entry.status] || entry.status}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(entry.createdAt)}</p>
                    {entry.note && (
                      <p className="mt-1 text-xs italic text-slate-500">
                        Note: {entry.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className={sectionClass}>
            <h3 className={sectionHeadingClass}>Customer</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-bold">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <a href={`mailto:${order.customerEmail}`} className="text-sm text-primary hover:underline">
                  {order.customerEmail}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-400" />
                <a href={`tel:${order.customerPhone}`} className="text-sm text-primary hover:underline">
                  {order.customerPhone}
                </a>
              </div>
              {order.user && (
                <p className="text-xs text-slate-400">Registered User ID: {order.user.id}</p>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className={sectionClass}>
            <h3 className={sectionHeadingClass}>
              {order.orderType === "DELIVERY" ? "Delivery" : "Pickup"} Details
            </h3>
            <div className="space-y-3">
              {order.orderType === "DELIVERY" && order.deliveryAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div className="text-sm">
                    <p className="font-bold">
                      {(order.deliveryAddress as { street?: string }).street}
                    </p>
                    <p className="text-slate-500">
                      {(order.deliveryAddress as { city?: string }).city}
                      {(order.deliveryAddress as { postalCode?: string }).postalCode
                        ? `, ${(order.deliveryAddress as { postalCode?: string }).postalCode}`
                        : ""}
                    </p>
                  </div>
                </div>
              )}
              {order.orderType === "PICKUP" && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                  <p className="text-sm font-bold">Store Pickup</p>
                </div>
              )}
              {order.scheduledTime && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm">Scheduled: {formatDate(order.scheduledTime)}</span>
                </div>
              )}
              {order.estimatedReadyTime && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm">Est. Ready: {formatDate(order.estimatedReadyTime)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className={sectionClass}>
            <h3 className={sectionHeadingClass}>Payment</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-bold">
                  {order.paymentMethod === "CARD"
                    ? "GCash"
                    : order.paymentMethod === "CASH_ON_DELIVERY"
                      ? "Cash on Delivery"
                      : "Cash at Pickup"}
                </span>
              </div>
              <div>
                <span
                  className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${
                    order.paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-700"
                      : order.paymentStatus === "REFUNDED"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.stripePaymentIntentId && (
                <p className="break-all text-xs text-slate-400">
                  Payment Reference: {order.stripePaymentIntentId}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          {(order.specialInstructions || order.isGift) && (
            <div className={sectionClass}>
              <h3 className={sectionHeadingClass}>Notes</h3>
              <div className="space-y-3">
                {order.specialInstructions && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="mt-0.5 h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-700">{order.specialInstructions}</p>
                  </div>
                )}
                {order.isGift && order.giftMessage && (
                  <div className="border-l-2 border-primary/20 pl-4">
                    <p className="text-xs font-bold text-primary">🎁 Gift Message</p>
                    <p className="mt-1 text-sm italic text-slate-700">
                      &ldquo;{order.giftMessage}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
