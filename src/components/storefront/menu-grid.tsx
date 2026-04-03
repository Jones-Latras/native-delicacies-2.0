"use client";

import { useState } from "react";
import { ItemDetailModal } from "@/components/storefront";
import { HomeProductCard } from "@/components/storefront/home-product-card";
import type { MenuItem } from "@/types";

interface MenuGridProps {
  items: MenuItem[];
}

export function MenuGrid({ items }: MenuGridProps) {
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-[#FAF6F0] px-6 py-16 text-center">
        <div className="text-3xl" aria-hidden="true">
          {"\u{1F343}"}
        </div>
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[#3E2012]">
          Wala pang produkto sa kategoryang ito
        </h3>
        <p className="mx-auto mt-2 max-w-md font-[family-name:var(--font-label)] text-[#7A6A55]">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <HomeProductCard key={item.id} item={item} onViewDetails={setDetailItem} />
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
