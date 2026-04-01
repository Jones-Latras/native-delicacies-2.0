"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Info, Clock, MapPin } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge, SURFACE_CARD_BASE_CLASS } from "@/components/ui";
import type { MenuItem } from "@/types";

interface MenuItemCardProps {
  item: MenuItem;
  onViewDetails?: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onViewDetails }: MenuItemCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  const stockLeft = useMemo(() => {
    if (item.dailyLimit === null || item.dailyLimit === undefined) return null;
    return Math.max(item.dailyLimit - (item.soldToday ?? 0), 0);
  }, [item.dailyLimit, item.soldToday]);

  const isOutOfStock = !item.isAvailable || stockLeft === 0;

  const maxOrderable = stockLeft ?? undefined;

  function handleAddToCart() {
    if (isOutOfStock) return;
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      maxQuantity: maxOrderable,
      imageUrl: item.imageUrl,
      customizations: {},
    });
  }

  return (
    <div
      className={cn(
        SURFACE_CARD_BASE_CLASS,
        "group animate-rise overflow-hidden rounded-[var(--radius-card)] border-2 border-latik/20 bg-asukal/78 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-pulot/22 hover:bg-asukal/88 hover:shadow-[0_18px_30px_rgba(59,31,14,0.14)]"
      )}
    >
      <div className="relative h-52 overflow-hidden bg-[linear-gradient(135deg,rgba(194,133,42,0.32),rgba(253,246,227,0.96),rgba(74,124,89,0.16))]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-105",
              isOutOfStock && "grayscale"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl">🍘</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {item.isFeatured && (
            <Badge variant="warning" className="bg-pulot text-asukal text-[0.6rem]">
              Featured
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="danger" className="text-[0.6rem]">
              Out of Stock
            </Badge>
          )}
          {!isOutOfStock && stockLeft !== null && (
            <Badge variant="default" className="border-kape/20 bg-kape/88 text-[0.6rem] text-asukal">
              {stockLeft} left
            </Badge>
          )}
        </div>

        {onViewDetails && (
          <button
            onClick={() => onViewDetails(item)}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-btn)] border border-asukal/35 bg-asukal/88 p-0 text-latik opacity-100 shadow-[0_10px_20px_rgba(59,31,14,0.12)] backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-asukal hover:text-pulot md:opacity-0 md:group-hover:opacity-100"
            aria-label={`View details for ${item.name}`}
          >
            <Info className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-latik/48">
          <span>{item.category.name}</span>
          {item.originRegion && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" strokeWidth={1.5} />
                {item.originRegion}
              </span>
            </>
          )}
        </div>

        <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-[1.35rem] leading-tight text-kape">
          {item.name}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-latik/72">{item.description}</p>

        {item.dietaryTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-latik/15 bg-gatas/75 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-latik/72"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {item.preparationMinutes && (
          <div className="mt-3 flex items-center gap-1 text-[0.68rem] uppercase tracking-[0.16em] text-latik/52">
            <Clock className="h-3 w-3" strokeWidth={1.5} />
            <span>{item.preparationMinutes} min</span>
          </div>
        )}

        <div className="mt-4 border-t border-latik/10 pt-4">
          <div className="mb-3 flex items-center justify-between text-[0.68rem] uppercase tracking-[0.18em] text-latik/55">
            <span>
              {stockLeft === null ? "In stock" : `${stockLeft} remaining today`}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-[family-name:var(--font-display)] text-[1.45rem] text-pulot">
              {formatCurrency(item.price)}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={maxOrderable ?? 99}
                value={quantity}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (!Number.isFinite(next)) return;
                  const cap = maxOrderable ?? 99;
                  setQuantity(Math.max(1, Math.min(cap, next)));
                }}
                disabled={isOutOfStock}
                className="w-16 rounded-[var(--radius-card)] border border-latik/20 bg-asukal/80 px-2 py-2.5 text-center text-sm text-kape shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] disabled:cursor-not-allowed disabled:bg-gatas/70"
                aria-label={`Quantity for ${item.name}`}
              />
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex items-center gap-1.5 rounded-[var(--radius-btn)] border border-pulot bg-pulot px-4 py-2.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-asukal shadow-[0_14px_24px_rgba(59,31,14,0.14)] transition-all duration-300 ease-in-out hover:-translate-y-px hover:brightness-110 hover:shadow-[0_18px_30px_rgba(59,31,14,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
