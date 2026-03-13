"use client";

import { useState } from "react";
import { MenuItemCard, ItemDetailModal } from "@/components/storefront";
import type { MenuItem } from "@/types";

interface MenuGridProps {
  items: MenuItem[];
}

export function MenuGrid({ items }: MenuGridProps) {
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <span className="text-5xl">🍽️</span>
        <h3 className="mt-4 text-lg font-semibold text-stone-900">No items found</h3>
        <p className="mt-1 text-stone-500">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onViewDetails={setDetailItem}
          />
        ))}
      </div>

      <ItemDetailModal
        item={detailItem}
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
      />
    </>
  );
}
