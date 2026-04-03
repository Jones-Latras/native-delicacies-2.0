"use client";

import { useState } from "react";
import { ItemDetailModal } from "@/components/storefront";
import { HomeProductCard } from "@/components/storefront/home-product-card";
import type { MenuItem } from "@/types";

interface HomeAllProductsSectionProps {
  items: MenuItem[];
  categories: { slug: string; name: string }[];
}

export function HomeAllProductsSection({ items, categories }: HomeAllProductsSectionProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category.slug === activeCategory);

  return (
    <>
      <div className="rounded-[12px] bg-[#F5EFE6] px-4 py-3 sm:px-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 font-[family-name:var(--font-label)] text-[13px] transition-all duration-200 ease-in-out ${
              activeCategory === "all"
                ? "bg-[#A0522D] text-white"
                : "border border-[#C9A87C] bg-[#FAF6F0] text-[#5C3D1E] hover:border-[#A0522D] hover:text-[#A0522D]"
            }`}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActiveCategory(category.slug)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 font-[family-name:var(--font-label)] text-[13px] transition-all duration-200 ease-in-out ${
                activeCategory === category.slug
                  ? "bg-[#A0522D] text-white"
                  : "border border-[#C9A87C] bg-[#FAF6F0] text-[#5C3D1E] hover:border-[#A0522D] hover:text-[#A0522D]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="mt-6 rounded-xl bg-[#FAF6F0] px-6 py-16 text-center">
          <div className="text-3xl" aria-hidden="true">
            {"\u{1F343}"}
          </div>
          <p className="mt-4 font-[family-name:var(--font-label)] text-base text-[#7A6A55]">
            Wala pang produkto sa kategoryang ito
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <HomeProductCard key={item.id} item={item} onViewDetails={setDetailItem} />
          ))}
        </div>
      )}

      <ItemDetailModal
        item={detailItem}
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
      />
    </>
  );
}
