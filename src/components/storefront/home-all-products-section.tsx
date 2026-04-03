"use client";

import { Search } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { ItemDetailModal } from "@/components/storefront";
import { HomeProductCard } from "@/components/storefront/home-product-card";
import type { MenuItem } from "@/types";

interface HomeAllProductsSectionProps {
  items: MenuItem[];
  categories: { slug: string; name: string }[];
}

export function HomeAllProductsSection({ items, categories }: HomeAllProductsSectionProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearch = deferredSearchQuery.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category.slug === activeCategory;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.description.toLowerCase().includes(normalizedSearch) ||
      item.category.name.toLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  const emptyMessage =
    normalizedSearch.length > 0
      ? "Walang tumugma sa hinahanap mo"
      : "Wala pang produkto sa kategoryang ito";

  return (
    <>
      <div className="rounded-[12px] bg-[#F5EFE6] px-4 py-3 sm:px-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6A55]"
            strokeWidth={1.7}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search delicacies, e.g. Hopia"
            className="w-full rounded-[12px] border border-[#C9A87C] bg-[#FFFDF8] py-3 pl-11 pr-4 font-[family-name:var(--font-label)] text-sm text-[#3E2012] transition-colors duration-200 ease-in-out placeholder:text-[#7A6A55] focus:border-[#A0522D] focus:outline-none"
            aria-label="Search products"
          />
        </div>

        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
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
            {emptyMessage}
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
