"use client";

import { useState } from "react";
import { ItemDetailModal } from "@/components/storefront";
import { HomeProductCard } from "@/components/storefront/home-product-card";
import type { MenuItem } from "@/types";

interface FeaturedGridProps {
  items: MenuItem[];
}

export function FeaturedGrid({ items }: FeaturedGridProps) {
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

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
