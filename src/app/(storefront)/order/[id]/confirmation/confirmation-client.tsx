"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Gift,
  Printer,
  ChevronRight,
  ShoppingBag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: "DELIVERY" | "PICKUP";
  status: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    deliveryInstructions?: string;
  };
  scheduledTime?: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  isGift: boolean;
  giftMessage?: string;
  specialInstructions?: string;
  estimatedReadyTime?: string;
  createdAt: string;
  items: {
    id: string;
    menuItemName: string;
    menuItemImage?: string;
    quantity: number;
    priceAtOrder: number;
    customizations?: Record<string, unknown>;
    specialInstructions?: string;
  }[];
}

export function ConfirmationClient() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;

    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setOrder(res.data);
        } else {
          setError(res.error || "Failed to load order");
        }
      })
      .catch(() => setError("Failed to load order"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brown-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h1 className="mt-4 text-xl font-bold text-stone-900">
          Order Not Found
        </h1>
        <p className="mt-2 text-stone-500">{error}</p>
        <Link
          href="/menu"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brown-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brown-700"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  const paymentIcon =
    order.paymentMethod === "CARD" ? (
      <CreditCard className="h-4 w-4" />
    ) : (
      <Banknote className="h-4 w-4" />
    );

  const paymentLabel =
    order.paymentMethod === "CARD"
      ? "Credit / Debit Card"
      : order.paymentMethod === "CASH_ON_DELIVERY"
        ? "Cash on Delivery"
        : "Cash at Pickup";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-stone-900">
          Order Confirmed!
        </h1>
        <p className="mt-2 text-stone-500">
          Thank you, {order.customerName}. Your order has been placed
          successfully.
        </p>
      </div>

      {/* Order Number Banner */}
      <div className="mt-8 rounded-2xl bg-brown-50 p-6 text-center">
        <p className="text-sm font-medium text-brown-600">Order Number</p>
        <p className="mt-1 text-2xl font-bold tracking-wider text-brown-800">
          {order.orderNumber}
        </p>
        <p className="mt-2 text-sm text-brown-600">
          A confirmation email has been sent to{" "}
          <span className="font-medium">{order.customerEmail}</span>
        </p>
      </div>

      {/* Order Details Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Order Type & Delivery */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            {order.orderType === "DELIVERY" ? (
              <MapPin className="h-4 w-4 text-brown-600" />
            ) : (
              <Package className="h-4 w-4 text-brown-600" />
            )}
            {order.orderType === "DELIVERY"
              ? "Delivery Details"
              : "Pickup Details"}
          </div>
          {order.orderType === "DELIVERY" && order.deliveryAddress ? (
            <div className="mt-3 text-sm text-stone-600">
              <p>{(order.deliveryAddress as { street: string }).street}</p>
              <p>
                {(order.deliveryAddress as { city: string }).city}
                {(order.deliveryAddress as { state?: string }).state
                  ? `, ${(order.deliveryAddress as { state: string }).state}`
                  : ""}{" "}
                {(order.deliveryAddress as { postalCode: string }).postalCode}
              </p>
              {(order.deliveryAddress as { deliveryInstructions?: string })
                .deliveryInstructions && (
                <p className="mt-1 text-stone-500">
                  Note:{" "}
                  {
                    (
                      order.deliveryAddress as {
                        deliveryInstructions: string;
                      }
                    ).deliveryInstructions
                  }
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-600">
              Ready for pickup at our store
            </p>
          )}
        </div>

        {/* Timing */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <Clock className="h-4 w-4 text-brown-600" />
            Order Timing
          </div>
          <p className="mt-3 text-sm text-stone-600">
            {order.scheduledTime
              ? `Scheduled: ${new Date(order.scheduledTime).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}`
              : "ASAP — As soon as possible"}
          </p>
          {order.estimatedReadyTime && (
            <p className="mt-1 text-sm text-brown-600">
              Est. ready by{" "}
              {new Date(order.estimatedReadyTime).toLocaleString("en-PH", {
                timeStyle: "short",
              })}
            </p>
          )}
        </div>

        {/* Payment */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            {paymentIcon}
            <span className="text-brown-600">Payment</span>
          </div>
          <p className="mt-3 text-sm text-stone-600">{paymentLabel}</p>
          <p className="mt-1 text-sm">
            <span
              className={
                order.paymentStatus === "PAID"
                  ? "text-green-600 font-medium"
                  : "text-amber-600 font-medium"
              }
            >
              {order.paymentStatus === "PAID" ? "Paid" : "Payment Pending"}
            </span>
          </p>
        </div>

        {/* Gift */}
        {order.isGift && (
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Gift className="h-4 w-4 text-brown-600" />
              Gift Order
            </div>
            {order.giftMessage && (
              <p className="mt-3 text-sm italic text-stone-600">
                &ldquo;{order.giftMessage}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
          <ShoppingBag className="h-5 w-5 text-brown-600" />
          Order Items
        </h2>
        <div className="mt-4 divide-y divide-stone-100">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3"
            >
              <div>
                <p className="text-sm font-medium text-stone-900">
                  {item.quantity}x {item.menuItemName}
                </p>
                {item.customizations &&
                  typeof item.customizations === "object" && (
                    <CustomizationSummary
                      customizations={item.customizations}
                    />
                  )}
              </div>
              <p className="shrink-0 text-sm font-medium text-stone-700">
                {formatCurrency(item.priceAtOrder * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm">
          <div className="flex justify-between text-stone-600">
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
            <div className="flex justify-between text-stone-600">
              <span>Delivery Fee</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
          )}
          {order.tax > 0 && (
            <div className="flex justify-between text-stone-600">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
          )}
          {order.tip > 0 && (
            <div className="flex justify-between text-stone-600">
              <span>Tip</span>
              <span>{formatCurrency(order.tip)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold text-stone-900">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/track/${order.orderNumber}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brown-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brown-700"
        >
          Track Your Order
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href="/menu"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-6 py-3 font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Continue Shopping
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-6 py-3 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
        >
          <Printer className="h-4 w-4" />
          Print Receipt
        </button>
      </div>
    </div>
  );
}

function CustomizationSummary({
  customizations,
}: {
  customizations: Record<string, unknown>;
}) {
  const parts: string[] = [];
  if (customizations.size && typeof customizations.size === "string") {
    parts.push(customizations.size);
  }
  if (Array.isArray(customizations.addOns)) {
    for (const a of customizations.addOns) {
      if (typeof a === "object" && a && "name" in a) {
        parts.push((a as { name: string }).name);
      }
    }
  }

  if (parts.length === 0) return null;
  return <p className="text-xs text-stone-500">{parts.join(", ")}</p>;
}
