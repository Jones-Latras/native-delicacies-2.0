"use client";

import Image from "next/image";
import { useState } from "react";
import { Clock3, Info, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { MenuItem } from "@/types";

interface HomeProductCardProps {
  item: MenuItem;
  onViewDetails?: (item: MenuItem) => void;
}

export function HomeProductCard({ item, onViewDetails }: HomeProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const stockLeft =
    item.dailyLimit === null || item.dailyLimit === undefined
      ? null
      : Math.max(item.dailyLimit - (item.soldToday ?? 0), 0);
  const isOutOfStock = !item.isAvailable || stockLeft === 0;
  const maxOrderable = stockLeft ?? undefined;
  const regionLabel = item.originRegion
    ? `${item.category.name} \u00B7 ${item.originRegion}`
    : item.category.name;

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
    <div className="group overflow-hidden rounded-[12px] border-[0.5px] border-[#C9A87C] bg-[#FFFDF8] shadow-[0_4px_16px_rgba(90,50,20,0.05)] transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(90,50,20,0.10)]">
      <div className="relative h-[200px] overflow-hidden bg-[#F5E6C8]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-200 ease-in-out group-hover:scale-[1.05]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[2rem]" aria-hidden="true">
              {"\u{1F358}"}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-[#A0522D]/10 opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100" />

        {item.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-[#A0522D] px-2 py-0.5 font-[family-name:var(--font-label)] text-[10px] font-medium text-white">
            Featured
          </span>
        )}

        {isOutOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-[#F5E6C8] px-2 py-0.5 font-[family-name:var(--font-label)] text-[10px] font-medium text-[#5C3D1E]">
            Out of Stock
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.05em] text-[#7A6A55]">
          {regionLabel}
        </p>

        <h3 className="mt-1 line-clamp-2 font-[family-name:var(--font-display)] text-[16px] font-semibold leading-snug text-[#3E2012]">
          {item.name}
        </h3>

        {item.dietaryTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#EEF5E7] px-2 py-1 font-[family-name:var(--font-label)] text-[10px] font-medium text-[#3A6A1E]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-[family-name:var(--font-label)] text-[17px] font-bold text-[#A0522D]">
              {formatCurrency(item.price)}
            </p>
            {item.preparationMinutes && (
              <div className="mt-1 flex items-center gap-1 font-[family-name:var(--font-label)] text-[12px] text-[#7A6A55]">
                <Clock3 className="h-3.5 w-3.5" strokeWidth={1.7} />
                <span>{item.preparationMinutes} min</span>
              </div>
            )}
          </div>

          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              className="inline-flex items-center gap-1 rounded-full border border-[#C9A87C] px-3 py-1.5 font-[family-name:var(--font-label)] text-[11px] text-[#7A6A55] transition-all duration-200 ease-in-out hover:border-[#A0522D] hover:text-[#A0522D]"
              aria-label={`View details for ${item.name}`}
            >
              <Info className="h-3.5 w-3.5" strokeWidth={1.7} />
              Details
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <label
            htmlFor={`homepage-qty-${item.id}`}
            className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.08em] text-[#7A6A55]"
          >
            Quantity
          </label>
          <input
            id={`homepage-qty-${item.id}`}
            type="number"
            min={1}
            max={maxOrderable ?? 99}
            value={quantity}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (!Number.isFinite(next)) return;

              const cap = maxOrderable ?? 99;
              setQuantity(Math.max(1, Math.min(cap, next)));
            }}
            disabled={isOutOfStock}
            className="w-20 rounded-[8px] border border-[#C9A87C] bg-[#FAF6F0] px-3 py-2 text-center font-[family-name:var(--font-label)] text-sm text-[#3E2012] transition-colors duration-200 ease-in-out focus:border-[#A0522D] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#F5E6C8] disabled:text-[#7A6A55]"
            aria-label={`Quantity for ${item.name}`}
          />
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#A0522D] px-4 py-2 font-[family-name:var(--font-label)] text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-[#7D3D1A] disabled:cursor-not-allowed disabled:bg-[#C9A87C]"
        >
          {!isOutOfStock && <ShoppingCart className="h-4 w-4" strokeWidth={1.7} />}
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
