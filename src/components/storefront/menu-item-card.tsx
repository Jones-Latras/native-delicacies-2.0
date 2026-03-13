"use client";

import Image from "next/image";
import { ShoppingCart, Info, Clock, MapPin } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui";
import type { MenuItem } from "@/types";

interface MenuItemCardProps {
  item: MenuItem;
  onViewDetails?: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onViewDetails }: MenuItemCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToCart() {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
      customizations: {},
    });
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brown-100 to-amber-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
            <Badge variant="warning" className="bg-amber-500 text-white text-[10px] font-semibold">
              Featured
            </Badge>
          )}
          {!item.isAvailable && (
            <Badge variant="danger" className="text-[10px] font-semibold">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Quick info button */}
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(item)}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-stone-600 opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-brown-600 group-hover:opacity-100"
            aria-label={`View details for ${item.name}`}
          >
            <Info className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Region */}
        <div className="mb-1.5 flex items-center gap-2 text-xs text-stone-400">
          <span>{item.category.name}</span>
          {item.originRegion && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {item.originRegion}
              </span>
            </>
          )}
        </div>

        <h3 className="font-semibold text-stone-900 line-clamp-1">{item.name}</h3>
        <p className="mt-1 text-sm text-stone-500 line-clamp-2">{item.description}</p>

        {/* Dietary tags */}
        {item.dietaryTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Prep time */}
        {item.preparationMinutes && (
          <div className="mt-2 flex items-center gap-1 text-xs text-stone-400">
            <Clock className="h-3 w-3" />
            <span>{item.preparationMinutes} min</span>
          </div>
        )}

        {/* Price & CTA */}
        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
          <span className="text-lg font-bold text-brown-600">
            {formatCurrency(item.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
            className="flex items-center gap-1.5 rounded-xl bg-brown-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brown-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
