"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  CheckCircle2,
  Clock,
  ChefHat,
  Truck,
  RefreshCw,
  XCircle,
  Search,
  MapPin,
  CreditCard,
  ClipboardList,
  Bike,
  Headset,
} from "lucide-react";
import { Button } from "@/components/ui";

type OrderStatus = "NEW" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED";

interface StatusHistoryEntry {
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

interface OrderItem {
  id: string;
  menuItemName: string;
  menuItemImage: string | null;
  quantity: number;
  priceAtOrder: number;
}

interface TrackedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: "DELIVERY" | "PICKUP";
  status: OrderStatus;
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
  isGift: boolean;
  giftMessage: string | null;
  specialInstructions: string | null;
  estimatedReadyTime: string | null;
  createdAt: string;
  items: OrderItem[];
  statusHistory: StatusHistoryEntry[];
}

const POLL_INTERVAL = 30_000;

// ── Progress Helpers ──

const STATUS_PROGRESS: Record<OrderStatus, number> = {
  NEW: 10,
  CONFIRMED: 25,
  PREPARING: 45,
  READY: 70,
  OUT_FOR_DELIVERY: 85,
  COMPLETED: 100,
  CANCELLED: 0,
};

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  NEW: "We've received your order and are getting it ready.",
  CONFIRMED: "Your order has been confirmed and sent to the kitchen.",
  PREPARING: "Kitchen is busy crafting your delicacies",
  READY: "Your order is ready and waiting!",
  OUT_FOR_DELIVERY: "Your order is on its way to you!",
  COMPLETED: "Your order has been delivered. Enjoy!",
  CANCELLED: "This order has been cancelled.",
};

// ── Timeline Steps ──

interface TimelineStep {
  key: OrderStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PICKUP_STEPS: TimelineStep[] = [
  { key: "NEW", label: "Order Received", description: "We've confirmed your order and sent it to the kitchen.", icon: <CheckCircle2 className="h-5 w-5" /> },
  { key: "CONFIRMED", label: "Confirmed", description: "Your order has been accepted and queued for preparation.", icon: <CheckCircle2 className="h-5 w-5" /> },
  { key: "PREPARING", label: "Preparing", description: "Chef is working on your traditional native delicacies.", icon: <ChefHat className="h-5 w-5" /> },
  { key: "READY", label: "Ready for Pickup", description: "Your order is ready! Come pick it up at our store.", icon: <Package className="h-5 w-5" /> },
  { key: "COMPLETED", label: "Completed", description: "Enjoy your authentic native feast!", icon: <CheckCircle2 className="h-5 w-5" /> },
];

const DELIVERY_STEPS: TimelineStep[] = [
  { key: "NEW", label: "Order Received", description: "We've confirmed your order and sent it to the kitchen.", icon: <CheckCircle2 className="h-5 w-5" /> },
  { key: "CONFIRMED", label: "Confirmed", description: "Your order has been accepted and queued for preparation.", icon: <CheckCircle2 className="h-5 w-5" /> },
  { key: "PREPARING", label: "Preparing", description: "Chef is working on your traditional native delicacies.", icon: <ChefHat className="h-5 w-5" /> },
  { key: "READY", label: "Ready", description: "Your order is packed and waiting for a rider.", icon: <Package className="h-5 w-5" /> },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", description: "A rider has picked up your order and is on the way.", icon: <Bike className="h-5 w-5" /> },
  { key: "COMPLETED", label: "Delivered", description: "Enjoy your authentic native feast!", icon: <CheckCircle2 className="h-5 w-5" /> },
];

function getStepState(stepIndex: number, currentIndex: number): "completed" | "active" | "pending" {
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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

function paymentLabel(method: string) {
  switch (method) {
    case "CARD": return "Card Payment";
    case "CASH_ON_DELIVERY": return "Cash on Delivery";
    case "CASH_AT_PICKUP": return "Cash at Pickup";
    default: return method;
  }
}

// ── Main Component ──

export default function TrackingClient({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async (num: string) => {
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(num)}`);
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
        setError(null);
        setLastUpdated(new Date());
      } else {
        setError(json.error ?? "Order not found");
        setOrder(null);
      }
    } catch {
      setError("Failed to load order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder(orderNumber);
    } else {
      setLoading(false);
    }
  }, [orderNumber, fetchOrder]);

  useEffect(() => {
    if (!order || order.status === "COMPLETED" || order.status === "CANCELLED") return;
    const interval = setInterval(() => fetchOrder(order.orderNumber), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [order, fetchOrder]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      setLoading(true);
      setError(null);
      window.history.replaceState(null, "", `/track/${encodeURIComponent(trimmed)}`);
      fetchOrder(trimmed);
    }
  }

  async function handleCancel() {
    if (!order || cancelling) return;
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        fetchOrder(order.orderNumber);
      } else {
        alert(json.error ?? "Failed to cancel order");
      }
    } catch {
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="flex flex-1 justify-center py-12">
        <div className="flex max-w-[960px] flex-1 flex-col items-center justify-center gap-4 px-4 py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-slate-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  // No order / search state
  if (!order && !error) {
    return (
      <div className="flex flex-1 justify-center py-8">
        <div className="flex max-w-[960px] flex-1 flex-col gap-6 px-4 lg:px-0">
          <HeaderSection />
          <SearchBar searchInput={searchInput} setSearchInput={setSearchInput} onSearch={handleSearch} />
          <div className="flex flex-col items-center gap-4 rounded-xl border border-primary/10 bg-white p-12">
            <Package className="h-16 w-16 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-900">Enter your order number above</h3>
            <p className="text-sm text-slate-500">Use the search bar to track your order in real time.</p>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-1 justify-center py-8">
        <div className="flex max-w-[960px] flex-1 flex-col gap-6 px-4 lg:px-0">
          <HeaderSection />
          <SearchBar searchInput={searchInput} setSearchInput={setSearchInput} onSearch={handleSearch} />
          <div className="flex flex-col items-center gap-4 rounded-xl border border-primary/10 bg-white p-12">
            <XCircle className="h-16 w-16 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-900">{error}</h3>
            <p className="text-sm text-slate-500">Please check your order number and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Order Data Rendering ──

  if (!order) return null;

  const steps = order.orderType === "DELIVERY" ? DELIVERY_STEPS : PICKUP_STEPS;
  const currentIndex = steps.findIndex((s) => s.key === order.status);
  const progress = STATUS_PROGRESS[order.status] ?? 0;
  const statusMessage = STATUS_MESSAGES[order.status] ?? "";

  function getStepTime(stepKey: OrderStatus): string | null {
    const entry = order!.statusHistory.find((h) => h.status === stepKey);
    return entry ? formatTime(entry.createdAt) : null;
  }

  return (
    <div className="flex flex-1 justify-center py-8">
      <div className="flex max-w-[960px] flex-1 flex-col gap-6 px-4 lg:px-0">

        {/* ── Header Section ── */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Live Status</p>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Track Your Order
            </h1>
            <p className="text-base text-slate-600">
              Order ID: <span className="font-mono font-bold">{order.orderNumber}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
              <button
                onClick={() => fetchOrder(order.orderNumber)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                title="Refresh status"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            )}
            <a
              href="tel:+639000000000"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white transition-transform hover:scale-105"
            >
              <Headset className="h-5 w-5" />
              Contact Support
            </a>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <SearchBar searchInput={searchInput} setSearchInput={setSearchInput} onSearch={handleSearch} />

        {/* ── Cancelled State ── */}
        {order.status === "CANCELLED" && (
          <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
              <div>
                <p className="text-lg font-bold text-red-800">Order Cancelled</p>
                <p className="text-sm text-red-600">
                  This order has been cancelled.
                  {order.paymentStatus === "REFUNDED" && " A refund has been processed to your original payment method."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Summary Cards ── */}
        {order.status !== "CANCELLED" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Estimated Time */}
            <div className="flex flex-1 flex-col gap-2 rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5" />
                <p className="text-base font-medium">
                  {order.orderType === "DELIVERY" ? "Estimated Arrival" : "Estimated Ready Time"}
                </p>
              </div>
              {order.estimatedReadyTime ? (
                <>
                  <p className="text-3xl font-bold leading-tight text-slate-900">
                    {formatTime(order.estimatedReadyTime)}
                  </p>
                  <p className="text-sm italic text-slate-500">
                    Expected by {formatDate(order.estimatedReadyTime)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold leading-tight text-slate-900">
                    {order.status === "COMPLETED" ? "Completed" : "Preparing..."}
                  </p>
                  <p className="text-sm italic text-slate-500">
                    {order.status === "COMPLETED"
                      ? `Completed at ${formatTime(order.statusHistory.find((h) => h.status === "COMPLETED")?.createdAt || order.createdAt)}`
                      : "We'll update the estimate shortly"}
                  </p>
                </>
              )}
            </div>

            {/* Address */}
            <div className="flex flex-1 flex-col gap-2 rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="h-5 w-5" />
                <p className="text-base font-medium">
                  {order.orderType === "DELIVERY" ? "Delivery Address" : "Pickup Location"}
                </p>
              </div>
              {order.orderType === "DELIVERY" && order.deliveryAddress ? (
                <>
                  <p className="text-lg font-bold leading-tight text-slate-900">
                    {order.deliveryAddress.street || "Delivery Address"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {[order.deliveryAddress.city, order.deliveryAddress.postalCode].filter(Boolean).join(", ")}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold leading-tight text-slate-900">
                    J&J Native Delicacies Store
                  </p>
                  <p className="text-sm text-slate-500">Ready for pickup at our store</p>
                </>
              )}
              {order.scheduledTime && (
                <p className="text-sm text-slate-500">Scheduled: {formatDate(order.scheduledTime)}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Visual Progress Bar ── */}
        {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
          <div className="flex flex-col gap-4 rounded-xl border border-primary/10 bg-primary/5 p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <ChefHat className={`h-6 w-6 text-primary ${order.status === "PREPARING" ? "animate-pulse" : ""}`} />
                <p className="text-lg font-bold text-slate-900">{statusMessage}</p>
              </div>
              <p className="text-lg font-black text-primary">{progress}%</p>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-slate-600">
              {order.statusHistory.length > 0
                ? `Your order was accepted at ${formatTime(order.statusHistory[0].createdAt)}.`
                : `Order placed at ${formatTime(order.createdAt)}.`}
              {lastUpdated && (
                <span className="text-slate-400"> • Auto-refreshes every 30s</span>
              )}
            </p>
          </div>
        )}

        {/* ── Completed Banner ── */}
        {order.status === "COMPLETED" && (
          <div className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <p className="text-lg font-bold text-emerald-900">
                  {order.orderType === "DELIVERY" ? "Order Delivered!" : "Order Completed!"}
                </p>
              </div>
              <p className="text-lg font-black text-emerald-600">100%</p>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-200">
              <div className="h-full w-full rounded-full bg-emerald-500" />
            </div>
            <p className="text-sm text-emerald-700">
              Thank you for your order! We hope you enjoy your delicacies. 🙏
            </p>
          </div>
        )}

        {/* ── Order Journey Timeline ── */}
        {order.status !== "CANCELLED" && (
          <div className="rounded-xl border border-primary/10 bg-white p-6">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
              <ClipboardList className="h-5 w-5 text-primary" />
              Order Journey
            </h3>
            <div className="grid grid-cols-[48px_1fr] gap-x-4">
              {steps.map((step, i) => {
                const state = getStepState(i, currentIndex);
                const time = getStepTime(step.key);
                const isLast = i === steps.length - 1;

                return (
                  <div key={step.key} className="contents">
                    {/* Icon + Connector */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          state === "completed"
                            ? "bg-primary text-white"
                            : state === "active"
                              ? "border-2 border-primary bg-primary/20 text-primary"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {state === "completed" ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
                      </div>
                      {!isLast && (
                        <div className={`h-12 w-1 ${i < currentIndex ? "bg-primary" : "bg-slate-200"}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className={isLast ? "flex flex-col" : "flex flex-col pb-8"}>
                      <p className={`text-lg font-bold leading-none ${state === "pending" ? "text-slate-400" : "text-slate-900"}`}>
                        {step.label}
                      </p>
                      <p className={`mt-1 text-sm ${state === "pending" ? "text-slate-400" : "text-slate-500"}`}>
                        {step.description}
                      </p>
                      <p className={`mt-1 text-sm font-bold ${state === "pending" ? "text-slate-400" : "text-primary"}`}>
                        {state === "active"
                          ? `In Progress${time ? ` • ${time}` : ""}`
                          : state === "completed"
                            ? time ?? "Done"
                            : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Order Details ── */}
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white">
          <div className="border-b border-primary/10 p-6">
            <h3 className="text-xl font-bold text-slate-900">Order Details</h3>
          </div>
          <div className="flex flex-col gap-4 p-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="h-16 w-16 flex-shrink-0 rounded-lg bg-primary/5 bg-cover bg-center"
                    style={item.menuItemImage ? { backgroundImage: `url(${item.menuItemImage})` } : undefined}
                  >
                    {!item.menuItemImage && (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.menuItemName}</p>
                    <p className="text-sm text-slate-500">{formatCurrency(item.priceAtOrder)} each</p>
                  </div>
                </div>
                <p className="font-bold text-slate-900">x{item.quantity}</p>
              </div>
            ))}

            <hr className="my-2 border-primary/10" />

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              )}
              {order.tip > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tip</span>
                  <span>{formatCurrency(order.tip)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between text-lg font-black text-primary">
                <span>Total Amount</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info Bar */}
          <div className="flex items-center justify-between bg-primary/5 px-6 py-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-slate-700">
                {paymentLabel(order.paymentMethod)}
                {order.paymentStatus === "PAID" && " — Paid ✓"}
                {order.paymentStatus === "PENDING" && " — Pending"}
                {order.paymentStatus === "REFUNDED" && " — Refunded"}
              </span>
            </div>
            <Link
              href={`/order/${order.id}/confirmation`}
              className="text-sm font-bold text-primary underline"
            >
              View Receipt
            </Link>
          </div>
        </div>

        {/* ── Gift Message ── */}
        {order.isGift && order.giftMessage && (
          <div className="rounded-xl border border-primary/10 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">🎁 Gift Message</p>
            <p className="mt-2 italic text-slate-700">&ldquo;{order.giftMessage}&rdquo;</p>
          </div>
        )}

        {/* ── Special Instructions ── */}
        {order.specialInstructions && (
          <div className="rounded-xl border border-primary/10 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">📝 Special Instructions</p>
            <p className="mt-2 text-sm text-slate-700">{order.specialInstructions}</p>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {(order.status === "NEW" || order.status === "CONFIRMED") && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-6 py-3 font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              <XCircle className="h-5 w-5" />
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
          <Link
            href="/menu"
            className="flex items-center justify-center gap-2 rounded-lg border border-primary/10 bg-white px-6 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Browse Menu
          </Link>
        </div>

        {/* Timestamp */}
        <p className="text-center text-sm text-slate-400">
          Order placed on {formatDate(order.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ── Shared Sub-Components ──

function HeaderSection() {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">Live Status</p>
      <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
        Track Your Order
      </h1>
    </div>
  );
}

function SearchBar({
  searchInput,
  setSearchInput,
  onSearch,
}: {
  searchInput: string;
  setSearchInput: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSearch} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter order number (e.g. ND-20250101-ABCD)"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
      </div>
      <Button type="submit" size="sm">
        Track
      </Button>
    </form>
  );
}
