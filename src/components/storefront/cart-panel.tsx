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
import { useHasMounted } from "@/hooks/use-has-mounted";
import { formatCurrency, cn } from "@/lib/utils";
import type { CartItem } from "@/types";

export function CartPanel() {
  const hasMounted = useHasMounted();
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
  const displayItems = hasMounted ? items : [];
  const displaySubtotal = hasMounted ? subtotal : 0;
  const displayItemCount = hasMounted ? itemCount : 0;
  const displayTotal = hasMounted ? total : 0;
  const displayPromoCode = hasMounted ? promoCode : null;
  const displayPromoDiscount = hasMounted ? promoDiscount : 0;

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
  const estimatedPrepTime = displayItems.reduce((max) => {
    return max; // Will be enhanced when item data includes prep time
  }, 15);

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-40 bg-kape/55 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-latik/15 bg-asukal/98 shadow-[0_24px_48px_rgba(59,31,14,0.22)] backdrop-blur-xl transition-transform duration-300 ease-in-out",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-latik/10 px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-pulot" strokeWidth={1.5} />
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-kape">
              Your Cart
              {displayItemCount > 0 && (
                <span className="ml-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-latik/55">
                  ({displayItemCount} {displayItemCount === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="rounded-full border border-latik/12 bg-asukal p-2 text-latik/55 transition-all duration-300 ease-in-out hover:border-pulot/30 hover:bg-pulot/10 hover:text-pulot"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {displayItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pulot/12">
              <ShoppingBag className="h-10 w-10 text-pulot/55" strokeWidth={1.5} />
            </div>
            <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-kape">
              Your cart is empty
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm leading-6 text-latik/68">
              Discover our authentic Filipino delicacies and add your favorites!
            </p>
            <Link
              href="/menu"
              onClick={closeCart}
              className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-btn)] border border-pulot bg-pulot px-6 py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-asukal shadow-[0_16px_28px_rgba(59,31,14,0.14)] transition-all duration-300 ease-in-out hover:-translate-y-px hover:brightness-110"
            >
              Browse Menu
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {displayItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-latik/10 px-6 py-4">
              {displayPromoCode ? (
                <div className="mb-4 flex items-center justify-between rounded-[1rem] border border-pandan/20 bg-pandan/10 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-pandan" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-pandan">
                      {displayPromoCode}
                    </span>
                    {promoMessage && (
                      <span className="text-xs text-pandan/75">
                        · {promoMessage}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-pandan transition-colors duration-300 hover:text-kape"
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
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-latik/72">
                  <span>Subtotal</span>
                  <span>{formatCurrency(displaySubtotal)}</span>
                </div>
                {displayPromoDiscount > 0 && (
                  <div className="flex justify-between text-pandan">
                    <span>Promo Discount</span>
                    <span>-{formatCurrency(displayPromoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-latik/10 pt-3 font-[family-name:var(--font-display)] text-xl text-kape">
                  <span>Total</span>
                  <span>{formatCurrency(displayTotal)}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-latik/55">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Estimated preparation: ~{estimatedPrepTime} min</span>
              </div>

              <div className="mt-4 space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-pulot bg-pulot py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-asukal shadow-[0_16px_28px_rgba(59,31,14,0.14)] transition-all duration-300 ease-in-out hover:-translate-y-px hover:brightness-110"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center rounded-[var(--radius-btn)] border border-latik/20 bg-asukal/70 py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik transition-all duration-300 ease-in-out hover:bg-gatas/90"
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
    <div className="flex gap-3 rounded-[1.2rem] border border-latik/10 bg-gatas/52 p-3">
      {/* Image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1rem] bg-[linear-gradient(135deg,rgba(194,133,42,0.28),rgba(253,246,227,0.94),rgba(74,124,89,0.14))]">
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
          <h4 className="truncate font-[family-name:var(--font-display)] text-lg text-kape">
            {item.name}
          </h4>
          <span className="shrink-0 font-[family-name:var(--font-display)] text-lg text-pulot">
            {formatCurrency(item.lineTotal)}
          </span>
        </div>

        {customizationSummary.length > 0 && (
          <p className="mt-0.5 truncate text-xs text-latik/68">
            {customizationSummary.join(" · ")}
          </p>
        )}

        {item.specialInstructions && (
          <p className="mt-0.5 truncate text-xs italic text-latik/48">
            &quot;{item.specialInstructions}&quot;
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-full border border-latik/16 bg-asukal/80">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-7 w-7 items-center justify-center text-latik/65 hover:text-kape disabled:opacity-30"
              aria-label="Decrease"
            >
              <Minus className="h-3 w-3" strokeWidth={1.5} />
            </button>
            <span className="w-7 text-center text-xs font-semibold text-kape">
              {item.quantity}
            </span>
            <input
              type="number"
              min={1}
              max={item.maxQuantity ?? 99}
              value={item.quantity}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isFinite(next)) return;
                onUpdateQuantity(item.id, next);
              }}
              className="h-7 w-14 border-x border-latik/14 bg-transparent text-center text-xs text-kape focus:outline-none"
              aria-label={`Quantity for ${item.name}`}
            />
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.maxQuantity !== undefined && item.quantity >= item.maxQuantity}
              className="flex h-7 w-7 items-center justify-center text-latik/65 hover:text-kape"
              aria-label="Increase"
            >
              <Plus className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </div>

          {item.maxQuantity !== undefined && (
            <span className="text-[11px] uppercase tracking-[0.12em] text-latik/40">Max {item.maxQuantity}</span>
          )}

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
                className="rounded px-2 py-0.5 text-xs text-latik/68 hover:bg-kape/5"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              className="rounded-full p-1.5 text-latik/40 transition-all duration-300 ease-in-out hover:bg-red-900/8 hover:text-red-800/75"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
