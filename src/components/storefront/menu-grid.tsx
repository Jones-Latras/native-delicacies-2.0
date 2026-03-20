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
      <div className="rounded-[1.6rem] border border-latik/15 bg-asukal/88 px-6 py-16 text-center shadow-[0_18px_34px_rgba(59,31,14,0.10)]">
        <span className="text-5xl">🍽️</span>
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-kape">No items found</h3>
        <p className="mx-auto mt-2 max-w-md text-latik/68">
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
