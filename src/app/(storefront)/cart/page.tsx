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
import { useHasMounted } from "@/hooks/use-has-mounted";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/types";

import { SurfaceCard } from "@/components/ui";
export default function CartPage() {
  const hasMounted = useHasMounted();
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

  if (!hasMounted) {
    return null;
  }

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
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pulot/12">
            <ShoppingBag className="h-12 w-12 text-pulot/55" strokeWidth={1.5} />
          </div>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl text-kape">
            Your cart is empty
          </h1>
          <p className="mt-3 max-w-lg text-center leading-7 text-latik/68">
            Looks like you haven&apos;t added any delicacies yet. Browse our menu to find your favorites!
          </p>
          <Link
            href="/menu"
            className="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-btn)] border border-pulot bg-pulot px-8 py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-asukal shadow-[0_16px_28px_rgba(59,31,14,0.14)] transition-all duration-300 ease-in-out hover:-translate-y-px hover:brightness-110"
          >
            Browse Menu
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-1 text-[0.72rem] uppercase tracking-[0.18em] text-latik/55">
        <Link href="/" className="hover:text-pulot">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="font-medium text-kape">Shopping Cart</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-kape">
          Shopping Cart
          <span className="ml-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik/55">
            ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
        </h1>
        {!clearConfirm ? (
          <button
            onClick={() => setClearConfirm(true)}
            className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-latik/60 transition-colors hover:text-red-800/75"
          >
            Clear Cart
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-latik/68">Clear all items?</span>
            <button
              onClick={handleClearCart}
              className="rounded-full bg-red-900/8 px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-red-800/85 hover:bg-red-900/12"
            >
              Yes, clear
            </button>
            <button
              onClick={() => setClearConfirm(false)}
              className="rounded-full px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-latik/72 hover:bg-kape/5"
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
            className="mt-6 inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik transition-colors hover:text-pulot"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <SurfaceCard className="p-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-kape">Order Summary</h2>

            {/* Promo Code */}
            <div className="mt-5">
              {promoCode ? (
                <div className="flex items-center justify-between rounded-[1rem] border border-pandan/20 bg-pandan/10 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-pandan" strokeWidth={1.5} />
                    <div>
                      <span className="text-sm font-medium text-pandan">
                        {promoCode}
                      </span>
                      {promoMessage && (
                        <p className="text-xs text-pandan/75">{promoMessage}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-pandan hover:text-kape"
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
                      className="flex-1 rounded-[1rem] border border-latik/18 bg-asukal/88 px-4 py-2.5 text-sm text-kape placeholder:text-latik/45 focus:border-pandan focus:outline-none focus:ring-2 focus:ring-pandan/20"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="rounded-[1rem] border border-latik/18 bg-gatas/80 px-4 py-2.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-latik transition-all duration-300 ease-in-out hover:bg-gatas disabled:opacity-50"
                    >
                      {promoLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoError && (
                    <p className="mt-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-red-800/85">{promoError}</p>
                  )}
                </>
              )}
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-latik/72">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-pandan">
                  <span>Promo Discount</span>
                  <span>-{formatCurrency(promoDiscount)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-latik/52">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Delivery fee calculated at checkout</span>
              </div>
              <div className="border-t border-latik/10 pt-3">
                <div className="flex justify-between font-[family-name:var(--font-display)] text-2xl text-kape">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-pulot bg-pulot py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-asukal shadow-[0_16px_28px_rgba(59,31,14,0.14)] transition-all duration-300 ease-in-out hover:-translate-y-px hover:brightness-110"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>

            <div className="mt-4 flex items-center justify-center gap-4 text-[0.68rem] uppercase tracking-[0.14em] text-latik/45">
              <span>🔒 Secure Checkout</span>
              <span>📦 Fresh & Packed with Care</span>
            </div>
          </SurfaceCard>
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
    <SurfaceCard className="flex gap-4 p-4 sm:p-5">
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
    </SurfaceCard>
  );
}
