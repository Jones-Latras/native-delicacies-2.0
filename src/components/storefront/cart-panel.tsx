"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Tag,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { formatCurrency, cn } from "@/lib/utils";
import type { CartItem } from "@/types";

export function CartPanel() {
  const { isCartOpen, closeCart } = useUIStore();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const itemCount = useCartStore((s) => s.getItemCount());
  const total = useCartStore((s) => s.getTotal());
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscount = useCartStore((s) => s.promoDiscount);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const setPromoCode = useCartStore((s) => s.setPromoCode);

  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

  async function handleApplyPromo() {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    setPromoMessage("");

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim(), subtotal }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setPromoError(data.error || "Invalid promo code");
        return;
      }

      setPromoCode(data.data.code, data.data.discount);
      setPromoMessage(data.data.message);
      setPromoInput("");
    } catch {
      setPromoError("Failed to validate promo code");
    } finally {
      setPromoLoading(false);
    }
  }

  function handleRemovePromo() {
    setPromoCode(null, 0);
    setPromoMessage("");
    setPromoError("");
  }

  // Estimate prep time (max among items)
  const estimatedPrepTime = items.reduce((max, item) => {
    return max; // Will be enhanced when item data includes prep time
  }, 15);

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brown-600" />
            <h2 className="text-lg font-bold text-stone-900">
              Your Cart
              {itemCount > 0 && (
                <span className="ml-2 text-sm font-normal text-stone-500">
                  ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brown-50">
              <ShoppingBag className="h-10 w-10 text-brown-300" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              Your cart is empty
            </h3>
            <p className="mt-1 text-center text-sm text-stone-500">
              Discover our authentic Filipino delicacies and add your favorites!
            </p>
            <Link
              href="/menu"
              onClick={closeCart}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brown-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brown-700"
            >
              Browse Menu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-stone-200 px-6 py-4">
              {/* Promo Code */}
              {promoCode ? (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {promoCode}
                    </span>
                    {promoMessage && (
                      <span className="text-xs text-green-600">
                        — {promoMessage}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-xs text-green-600 hover:text-green-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError("");
                      }}
                      placeholder="Promo code"
                      className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-brown-500 focus:outline-none focus:ring-2 focus:ring-brown-500/20"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200 disabled:opacity-50"
                    >
                      {promoLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoError && (
                    <p className="mt-1 text-xs text-red-500">{promoError}</p>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount</span>
                    <span>-{formatCurrency(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold text-stone-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Estimated Prep Time */}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
                <Clock className="h-3.5 w-3.5" />
                <span>Estimated preparation: ~{estimatedPrepTime} min</span>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brown-600 py-3 font-semibold text-white transition-colors hover:bg-brown-700"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center rounded-xl border border-stone-200 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                >
                  View Full Cart
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── Cart Item Row ──

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);

  const customizationSummary: string[] = [];
  if (item.customizations.size) customizationSummary.push(item.customizations.size);
  if (item.customizations.addOns?.length) {
    customizationSummary.push(...item.customizations.addOns.map((a) => a.name));
  }
  if (item.customizations.modifications?.length) {
    customizationSummary.push(...item.customizations.modifications);
  }

  return (
    <div className="flex gap-3 rounded-xl bg-stone-50 p-3">
      {/* Image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-brown-100 to-amber-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-2xl">🍘</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-stone-900">
            {item.name}
          </h4>
          <span className="shrink-0 text-sm font-semibold text-brown-600">
            {formatCurrency(item.lineTotal)}
          </span>
        </div>

        {customizationSummary.length > 0 && (
          <p className="mt-0.5 truncate text-xs text-stone-500">
            {customizationSummary.join(" · ")}
          </p>
        )}

        {item.specialInstructions && (
          <p className="mt-0.5 truncate text-xs italic text-stone-400">
            &quot;{item.specialInstructions}&quot;
          </p>
        )}

        {/* Quantity & Remove */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-stone-200 bg-white">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-7 w-7 items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-30"
              aria-label="Decrease"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-7 text-center text-xs font-semibold text-stone-900">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center text-stone-500 hover:text-stone-900"
              aria-label="Increase"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {confirmRemove ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onRemove(item.id)}
                className="rounded px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                className="rounded px-2 py-0.5 text-xs text-stone-500 hover:bg-stone-100"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              className="rounded p-1 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
