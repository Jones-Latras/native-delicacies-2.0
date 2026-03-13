"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Tag,
  ArrowRight,
  ArrowLeft,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/types";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const itemCount = useCartStore((s) => s.getItemCount());
  const total = useCartStore((s) => s.getTotal());
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscount = useCartStore((s) => s.promoDiscount);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const setPromoCode = useCartStore((s) => s.setPromoCode);

  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [clearConfirm, setClearConfirm] = useState(false);

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

  function handleClearCart() {
    clearCart();
    setClearConfirm(false);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brown-50">
            <ShoppingBag className="h-12 w-12 text-brown-300" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-stone-900">
            Your cart is empty
          </h1>
          <p className="mt-2 text-center text-stone-500">
            Looks like you haven&apos;t added any delicacies yet. Browse our menu to find your favorites!
          </p>
          <Link
            href="/menu"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brown-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-brown-700"
          >
            Browse Menu
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-stone-500">
        <Link href="/" className="hover:text-brown-600">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-stone-900">Shopping Cart</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-stone-900">
          Shopping Cart
          <span className="ml-2 text-lg font-normal text-stone-500">
            ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
        </h1>
        {!clearConfirm ? (
          <button
            onClick={() => setClearConfirm(true)}
            className="text-sm text-stone-500 transition-colors hover:text-red-600"
          >
            Clear Cart
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-500">Clear all items?</span>
            <button
              onClick={handleClearCart}
              className="rounded-lg bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Yes, clear
            </button>
            <button
              onClick={() => setClearConfirm(false)}
              className="rounded-lg px-3 py-1 text-sm text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Items List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brown-600 transition-colors hover:text-brown-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900">Order Summary</h2>

            {/* Promo Code */}
            <div className="mt-5">
              {promoCode ? (
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="text-sm font-medium text-green-700">
                        {promoCode}
                      </span>
                      {promoMessage && (
                        <p className="text-xs text-green-600">{promoMessage}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-xs font-medium text-green-600 hover:text-green-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError("");
                      }}
                      placeholder="Enter promo code"
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
                </>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="mt-5 space-y-3 text-sm">
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
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <Clock className="h-3.5 w-3.5" />
                <span>Delivery fee calculated at checkout</span>
              </div>
              <div className="border-t border-stone-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-stone-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brown-600 py-3.5 font-semibold text-white transition-colors hover:bg-brown-700"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Trust badges */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-stone-400">
              <span>🔒 Secure Checkout</span>
              <span>📦 Fresh & Packed with Care</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cart Item Card (Full Page version) ──

function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);

  const customizationDetails: string[] = [];
  if (item.customizations.size) customizationDetails.push(`Size: ${item.customizations.size}`);
  if (item.customizations.addOns?.length) {
    customizationDetails.push(
      ...item.customizations.addOns.map((a) => `${a.name} (+${formatCurrency(a.price)})`)
    );
  }
  if (item.customizations.modifications?.length) {
    customizationDetails.push(...item.customizations.modifications);
  }

  return (
    <div className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-brown-100 to-amber-100 sm:h-28 sm:w-28">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 96px, 112px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl">🍘</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-stone-900">{item.name}</h3>
            <p className="text-sm text-stone-500">
              {formatCurrency(item.customizations.sizePrice ?? item.price)} each
            </p>
          </div>
          <span className="shrink-0 text-lg font-bold text-brown-600">
            {formatCurrency(item.lineTotal)}
          </span>
        </div>

        {/* Customizations */}
        {customizationDetails.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {customizationDetails.map((detail, i) => (
              <span
                key={i}
                className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
              >
                {detail}
              </span>
            ))}
          </div>
        )}

        {/* Special Instructions */}
        {item.specialInstructions && (
          <p className="mt-1.5 text-xs italic text-stone-400">
            &quot;{item.specialInstructions}&quot;
          </p>
        )}

        {/* Quantity & Actions */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center rounded-xl border border-stone-200">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-9 w-9 items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-stone-900">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="flex h-9 w-9 items-center justify-center text-stone-500 hover:text-stone-900"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {confirmRemove ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemove(item.id)}
                className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
              >
                Remove
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              className="flex items-center gap-1 rounded-lg p-1.5 text-sm text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
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
