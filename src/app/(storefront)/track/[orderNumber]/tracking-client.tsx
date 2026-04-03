"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Bike,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Clock,
  Headset,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Smartphone,
  XCircle,
} from "lucide-react";

type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

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

interface TimelineStep {
  key: OrderStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PICKUP_STEPS: TimelineStep[] = [
  {
    key: "NEW",
    label: "Order Received",
    description: "We've confirmed your order and sent it to the kitchen.",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    description: "Your order has been accepted and queued for preparation.",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  {
    key: "PREPARING",
    label: "Preparing",
    description: "Chef is working on your traditional J&J Native Delicacies.",
    icon: <ChefHat className="h-5 w-5" />,
  },
  {
    key: "READY",
    label: "Ready for Pickup",
    description: "Your order is ready! Come pick it up at our store.",
    icon: <Package className="h-5 w-5" />,
  },
  {
    key: "COMPLETED",
    label: "Completed",
    description: "Enjoy your authentic native feast!",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
];

const DELIVERY_STEPS: TimelineStep[] = [
  {
    key: "NEW",
    label: "Order Received",
    description: "We've confirmed your order and sent it to the kitchen.",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    description: "Your order has been accepted and queued for preparation.",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  {
    key: "PREPARING",
    label: "Preparing",
    description: "Chef is working on your traditional J&J Native Delicacies.",
    icon: <ChefHat className="h-5 w-5" />,
  },
  {
    key: "READY",
    label: "Ready",
    description: "Your order is packed and waiting for a rider.",
    icon: <Package className="h-5 w-5" />,
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    description: "A rider has picked up your order and is on the way.",
    icon: <Bike className="h-5 w-5" />,
  },
  {
    key: "COMPLETED",
    label: "Delivered",
    description: "Enjoy your authentic native feast!",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
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
    case "CARD":
      return "GCash";
    case "CASH_ON_DELIVERY":
      return "Cash on Delivery";
    case "CASH_AT_PICKUP":
      return "Cash at Pickup";
    default:
      return method;
  }
}

const panelClass =
  "rounded-[24px] border border-[#C9A87C] bg-[#FFFDF8] p-6 shadow-[0_18px_40px_rgba(90,50,20,0.06)]";

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

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#A0522D] border-t-transparent" />
          <p className="font-[family-name:var(--font-label)] text-[#7A6A55]">
            Loading order details...
          </p>
        </div>
      </PageShell>
    );
  }

  if (!order && !error) {
    return (
      <PageShell>
        <HeaderSection />
        <SearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
        />
        <div className={`${panelClass} mt-6 text-center`}>
          <Package className="mx-auto h-16 w-16 text-[#A0522D]" />
          <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
            Enter your order number above
          </h3>
          <p className="mt-2 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
            Use the search bar to track your order in real time.
          </p>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <HeaderSection />
        <SearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
        />
        <div className={`${panelClass} mt-6 text-center`}>
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
            {error}
          </h3>
          <p className="mt-2 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
            Please check your order number and try again.
          </p>
        </div>
      </PageShell>
    );
  }

  if (!order) return null;

  const trackedOrder = order;
  const steps = order.orderType === "DELIVERY" ? DELIVERY_STEPS : PICKUP_STEPS;
  const currentIndex = steps.findIndex((s) => s.key === order.status);
  const progress = STATUS_PROGRESS[order.status] ?? 0;
  const statusMessage = STATUS_MESSAGES[order.status] ?? "";

  function getStepTime(stepKey: OrderStatus): string | null {
    const entry = trackedOrder.statusHistory.find((h) => h.status === stepKey);
    return entry ? formatTime(entry.createdAt) : null;
  }

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
            Live Status
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.25rem] leading-tight text-[#3E2012]">
            Track Your Order
          </h1>
          <p className="mt-2 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
            Order ID:{" "}
            <span className="font-mono font-semibold text-[#3E2012]">{order.orderNumber}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
            <button
              type="button"
              onClick={() => fetchOrder(order.orderNumber)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C9A87C] bg-[#FFFDF8] text-[#A0522D] transition-all duration-200 ease-in-out hover:border-[#A0522D] hover:bg-[#A0522D] hover:text-white"
              title="Refresh status"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          )}
          <a
            href="tel:+639000000000"
            className="inline-flex items-center gap-2 rounded-full bg-[#A0522D] px-5 py-3 font-[family-name:var(--font-label)] text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-[#7D3D1A]"
          >
            <Headset className="h-4 w-4" />
            Contact Support
          </a>
        </div>
      </div>

      <SearchBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
      />

      {order.status === "CANCELLED" && (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 shrink-0 text-red-600" />
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl text-red-800">
                Order Cancelled
              </p>
              <p className="font-[family-name:var(--font-label)] text-sm text-red-700">
                This order has been cancelled.
                {order.paymentStatus === "REFUNDED" &&
                  " A refund has been processed to your original payment method."}
              </p>
            </div>
          </div>
        </div>
      )}

      {order.status !== "CANCELLED" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className={panelClass}>
            <div className="flex items-center gap-2 text-[#A0522D]">
              <Clock className="h-5 w-5" />
              <p className="font-[family-name:var(--font-label)] text-sm font-medium">
                {order.orderType === "DELIVERY" ? "Estimated Arrival" : "Estimated Ready Time"}
              </p>
            </div>
            {order.estimatedReadyTime ? (
              <>
                <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[#3E2012]">
                  {formatTime(order.estimatedReadyTime)}
                </p>
                <p className="mt-2 font-[family-name:var(--font-label)] text-sm italic text-[#7A6A55]">
                  Expected by {formatDate(order.estimatedReadyTime)}
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[#3E2012]">
                  {order.status === "COMPLETED" ? "Completed" : "Preparing..."}
                </p>
                <p className="mt-2 font-[family-name:var(--font-label)] text-sm italic text-[#7A6A55]">
                  {order.status === "COMPLETED"
                    ? `Completed at ${formatTime(
                        order.statusHistory.find((h) => h.status === "COMPLETED")?.createdAt ||
                          order.createdAt
                      )}`
                    : "We'll update the estimate shortly"}
                </p>
              </>
            )}
          </div>

          <div className={panelClass}>
            <div className="flex items-center gap-2 text-[#A0522D]">
              <MapPin className="h-5 w-5" />
              <p className="font-[family-name:var(--font-label)] text-sm font-medium">
                {order.orderType === "DELIVERY" ? "Delivery Address" : "Pickup Location"}
              </p>
            </div>
            {order.orderType === "DELIVERY" && order.deliveryAddress ? (
              <>
                <p className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
                  {order.deliveryAddress.street || "Delivery Address"}
                </p>
                <p className="mt-2 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
                  {[order.deliveryAddress.city, order.deliveryAddress.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
                  J&J Native Delicacies Store
                </p>
                <p className="mt-2 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
                  Ready for pickup at our store
                </p>
              </>
            )}
            {order.scheduledTime && (
              <p className="mt-2 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
                Scheduled: {formatDate(order.scheduledTime)}
              </p>
            )}
          </div>
        </div>
      )}

      {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
        <div className={panelClass}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ChefHat
                className={`h-6 w-6 text-[#A0522D] ${order.status === "PREPARING" ? "animate-pulse" : ""}`}
              />
              <p className="font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
                {statusMessage}
              </p>
            </div>
            <p className="font-[family-name:var(--font-display)] text-2xl text-[#A0522D]">
              {progress}%
            </p>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[#F5E6C8]">
            <div
              className="h-full rounded-full bg-[#A0522D] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
            {order.statusHistory.length > 0
              ? `Your order was accepted at ${formatTime(order.statusHistory[0].createdAt)}.`
              : `Order placed at ${formatTime(order.createdAt)}.`}
            {lastUpdated && <span className="text-[#A58A69]"> • Auto-refreshes every 30s</span>}
          </p>
        </div>
      )}

      {order.status === "COMPLETED" && (
        <div className="rounded-[20px] border border-[#B7D7A8] bg-[#EEF5E7] px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-[#3A6A1E]" />
              <p className="font-[family-name:var(--font-display)] text-2xl text-[#3A6A1E]">
                {order.orderType === "DELIVERY" ? "Order Delivered!" : "Order Completed!"}
              </p>
            </div>
            <p className="font-[family-name:var(--font-display)] text-2xl text-[#3A6A1E]">100%</p>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[#D8E9CD]">
            <div className="h-full w-full rounded-full bg-[#3A6A1E]" />
          </div>
          <p className="mt-3 font-[family-name:var(--font-label)] text-sm text-[#3A6A1E]">
            Thank you for your order! We hope you enjoy your delicacies.
          </p>
        </div>
      )}

      {order.status !== "CANCELLED" && (
        <div className={panelClass}>
          <h3 className="mb-6 flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
            <ClipboardList className="h-5 w-5 text-[#A0522D]" />
            Order Journey
          </h3>
          <div className="grid grid-cols-[48px_1fr] gap-x-4">
            {steps.map((step, i) => {
              const state = getStepState(i, currentIndex);
              const time = getStepTime(step.key);
              const isLast = i === steps.length - 1;

              return (
                <div key={step.key} className="contents">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        state === "completed"
                          ? "bg-[#A0522D] text-white"
                          : state === "active"
                            ? "border-2 border-[#A0522D] bg-[#F5E6C8] text-[#A0522D]"
                            : "bg-[#F5EFE6] text-[#A58A69]"
                      }`}
                    >
                      {state === "completed" ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
                    </div>
                    {!isLast && (
                      <div
                        className={`h-12 w-1 ${i < currentIndex ? "bg-[#A0522D]" : "bg-[#E8D8BD]"}`}
                      />
                    )}
                  </div>

                  <div className={isLast ? "flex flex-col" : "flex flex-col pb-8"}>
                    <p
                      className={`font-[family-name:var(--font-display)] text-xl ${
                        state === "pending" ? "text-[#A58A69]" : "text-[#3E2012]"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`mt-1 font-[family-name:var(--font-label)] text-sm ${
                        state === "pending" ? "text-[#A58A69]" : "text-[#7A6A55]"
                      }`}
                    >
                      {step.description}
                    </p>
                    <p
                      className={`mt-1 font-[family-name:var(--font-label)] text-sm font-medium ${
                        state === "pending" ? "text-[#A58A69]" : "text-[#A0522D]"
                      }`}
                    >
                      {state === "active"
                        ? `In Progress${time ? ` • ${time}` : ""}`
                        : state === "completed"
                          ? (time ?? "Done")
                          : "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={panelClass}>
        <h3 className="mb-6 font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
          Order Details
        </h3>
        <div className="flex flex-col gap-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-[18px] border border-[#E8D8BD] bg-[#FAF6F0] p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-16 w-16 shrink-0 rounded-[12px] bg-[#F5E6C8] bg-cover bg-center"
                  style={
                    item.menuItemImage
                      ? { backgroundImage: `url(${item.menuItemImage})` }
                      : undefined
                  }
                >
                  {!item.menuItemImage && (
                    <div className="flex h-full w-full items-center justify-center text-[#A58A69]">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-xl text-[#3E2012]">
                    {item.menuItemName}
                  </p>
                  <p className="font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
                    {formatCurrency(item.priceAtOrder)} each
                  </p>
                </div>
              </div>
              <p className="font-[family-name:var(--font-display)] text-xl text-[#3E2012]">
                x{item.quantity}
              </p>
            </div>
          ))}

          <div className="mt-2 border-t border-[#E8D8BD] pt-4">
            <div className="flex flex-col gap-2 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#3A6A1E]">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              )}
              {order.tip > 0 && (
                <div className="flex justify-between">
                  <span>Tip</span>
                  <span>{formatCurrency(order.tip)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between font-[family-name:var(--font-display)] text-2xl text-[#A0522D]">
                <span>Total Amount</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8D8BD] pt-4">
            <div className="flex items-center gap-2 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
              <Smartphone className="h-5 w-5 text-[#A0522D]" />
              <span>
                {paymentLabel(order.paymentMethod)}
                {order.paymentStatus === "PAID" && " — Paid ✓"}
                {order.paymentStatus === "PENDING" && " — Pending"}
                {order.paymentStatus === "REFUNDED" && " — Refunded"}
              </span>
            </div>
            <Link
              href={`/order/${order.id}/confirmation`}
              className="font-[family-name:var(--font-label)] text-sm text-[#A0522D] underline decoration-[#A0522D]/45 underline-offset-4 transition-colors duration-200 ease-in-out hover:text-[#7D3D1A]"
            >
              View Receipt
            </Link>
          </div>
        </div>
      </div>

      {order.isGift && order.giftMessage && (
        <div className={panelClass}>
          <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
            Gift Message
          </p>
          <p className="mt-3 font-[family-name:var(--font-label)] text-base italic text-[#7A6A55]">
            “{order.giftMessage}”
          </p>
        </div>
      )}

      {order.specialInstructions && (
        <div className={panelClass}>
          <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
            Special Instructions
          </p>
          <p className="mt-3 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
            {order.specialInstructions}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {(order.status === "NEW" || order.status === "CONFIRMED") && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-6 py-3 font-[family-name:var(--font-label)] text-sm font-medium text-red-600 transition-all duration-200 ease-in-out hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircle className="h-4 w-4" />
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 rounded-full border border-[#C9A87C] bg-[#FAF6F0] px-6 py-3 font-[family-name:var(--font-label)] text-sm font-medium text-[#5C3D1E] transition-all duration-200 ease-in-out hover:border-[#A0522D] hover:text-[#A0522D]"
        >
          Browse Menu
        </Link>
      </div>

      <p className="text-center font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
        Order placed on {formatDate(order.createdAt)}
      </p>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFDF8_0%,#FAF6F0_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C9A87C]/60" />
      <div className="pointer-events-none absolute left-[10%] top-20 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(245,230,200,0.65),transparent_72%)]" />
      <div className="pointer-events-none absolute bottom-10 right-[8%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(160,82,45,0.10),transparent_72%)]" />
      <div className="relative mx-auto flex max-w-[960px] flex-col gap-6">{children}</div>
    </section>
  );
}

function HeaderSection() {
  return (
    <div className="text-center">
      <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
        Live Status
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.25rem] leading-tight text-[#3E2012]">
        Track Your Order
      </h1>
      <div className="mx-auto mt-4 h-[2px] w-[60px] rounded-full bg-[#A0522D]" />
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
    <form
      onSubmit={onSearch}
      className="rounded-[24px] border border-[#C9A87C] bg-[#FFFDF8] p-5 shadow-[0_18px_40px_rgba(90,50,20,0.06)]"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6A55]"
            strokeWidth={1.7}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter order number (e.g. ND-20250101-ABCD)"
            className="w-full rounded-[14px] border border-[#C9A87C] bg-[#FAF6F0] py-3 pl-11 pr-4 font-[family-name:var(--font-label)] text-sm text-[#3E2012] placeholder:text-[#7A6A55] focus:border-[#A0522D] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-[#A0522D] px-5 py-3 font-[family-name:var(--font-label)] text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-[#7D3D1A]"
        >
          Track
        </button>
      </div>
    </form>
  );
}
