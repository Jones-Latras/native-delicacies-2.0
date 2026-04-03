"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
];

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Nut-Free",
  "Contains Coconut",
  "Contains Egg",
  "Contains Dairy",
];

interface SearchFilterBarProps {
  categories: { slug: string; name: string }[];
}

export function SearchFilterBar({ categories }: SearchFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = searchParams.get("category") ?? "";
  const currentDietary = searchParams.get("dietary") ?? "";
  const currentSort = searchParams.get("sort") ?? "popular";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      params.delete("page");
      startTransition(() => {
        router.push(`/menu?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams, startTransition]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (searchValue !== current) {
        updateParams({ search: searchValue });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue, searchParams, updateParams]);

  const activeFilterCount = [currentCategory, currentDietary].filter(Boolean).length;
  const pillBaseClass =
    "shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 font-[family-name:var(--font-label)] text-[13px] transition-all duration-200 ease-in-out";

  return (
    <div className="space-y-4 rounded-[12px] bg-[#F5EFE6] p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6A55]"
            strokeWidth={1.7}
          />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search delicacies, e.g. Hopia"
            className="w-full rounded-[12px] border border-[#C9A87C] bg-[#FFFDF8] py-3 pl-11 pr-11 font-[family-name:var(--font-label)] text-sm text-[#3E2012] transition-colors duration-200 ease-in-out placeholder:text-[#7A6A55] focus:border-[#A0522D] focus:outline-none"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#7A6A55] transition-colors duration-200 ease-in-out hover:text-[#A0522D]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" strokeWidth={1.7} />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={currentSort}
            onChange={(event) => updateParams({ sort: event.target.value })}
            className="w-full appearance-none rounded-[12px] border border-[#C9A87C] bg-[#FFFDF8] px-4 py-3 pr-10 font-[family-name:var(--font-label)] text-sm text-[#5C3D1E] transition-colors duration-200 ease-in-out focus:border-[#A0522D] focus:outline-none lg:min-w-[190px]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((current) => !current)}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-[999px] border px-4 py-3 font-[family-name:var(--font-label)] text-[13px] font-medium transition-all duration-200 ease-in-out",
            showFilters || activeFilterCount > 0
              ? "border-[#A0522D] bg-[#A0522D] text-white"
              : "border-[#C9A87C] bg-[#FAF6F0] text-[#5C3D1E] hover:border-[#A0522D] hover:text-[#A0522D]"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.7} />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#A0522D]">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => updateParams({ category: "" })}
          className={cn(
            pillBaseClass,
            !currentCategory
              ? "bg-[#A0522D] text-white"
              : "border border-[#C9A87C] bg-[#FAF6F0] text-[#5C3D1E] hover:border-[#A0522D] hover:text-[#A0522D]"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => updateParams({ category: cat.slug })}
            className={cn(
              pillBaseClass,
              currentCategory === cat.slug
                ? "bg-[#A0522D] text-white"
                : "border border-[#C9A87C] bg-[#FAF6F0] text-[#5C3D1E] hover:border-[#A0522D] hover:text-[#A0522D]"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="rounded-[12px] border border-[#C9A87C] bg-[#FFFDF8] p-4">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <h4 className="mb-3 font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
                Dietary Preferences
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateParams({ dietary: "" })}
                  className={cn(
                    pillBaseClass,
                    !currentDietary
                      ? "bg-[#A0522D] text-white"
                      : "border border-[#C9A87C] bg-[#FAF6F0] text-[#5C3D1E] hover:border-[#A0522D] hover:text-[#A0522D]"
                  )}
                >
                  All
                </button>
                {DIETARY_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => updateParams({ dietary: tag })}
                    className={cn(
                      pillBaseClass,
                      currentDietary === tag
                        ? "bg-[#A0522D] text-white"
                        : "border border-[#C9A87C] bg-[#FAF6F0] text-[#5C3D1E] hover:border-[#A0522D] hover:text-[#A0522D]"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
                Sort Order
              </h4>
              <select
                value={currentSort}
                onChange={(event) => updateParams({ sort: event.target.value })}
                className="w-full rounded-[12px] border border-[#C9A87C] bg-[#FAF6F0] px-4 py-3 font-[family-name:var(--font-label)] text-sm text-[#5C3D1E] transition-colors duration-200 ease-in-out focus:border-[#A0522D] focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(activeFilterCount > 0 || searchValue) && (
            <button
              type="button"
              onClick={() => updateParams({ category: "", dietary: "", search: "" })}
              className="mt-4 font-[family-name:var(--font-label)] text-[13px] text-[#A0522D] underline decoration-[#A0522D]/45 underline-offset-4 transition-colors duration-200 ease-in-out hover:text-[#7D3D1A]"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
