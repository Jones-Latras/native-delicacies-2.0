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
  { value: "name", label: "Name A–Z" },
];

const REGION_OPTIONS = ["Luzon", "Visayas", "Mindanao"];

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
  const currentRegion = searchParams.get("region") ?? "";
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
      params.delete("page"); // reset pagination on filter change
      startTransition(() => {
        router.push(`/menu?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams, startTransition]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (searchValue !== current) {
        updateParams({ search: searchValue });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue, searchParams, updateParams]);

  const activeFilterCount = [currentCategory, currentRegion, currentDietary].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search + Filter Toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search delicacies..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder:text-stone-400 focus:border-brown-500 focus:outline-none focus:ring-2 focus:ring-brown-500/20"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium transition-colors",
            showFilters || activeFilterCount > 0
              ? "border-brown-600 bg-brown-50 text-brown-700"
              : "text-stone-600 hover:border-stone-300"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brown-600 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="hidden rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-brown-500 focus:outline-none focus:ring-2 focus:ring-brown-500/20 sm:block"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 sm:grid-cols-3">
            {/* Category */}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Category</h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => updateParams({ category: "" })}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    !currentCategory
                      ? "bg-brown-600 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => updateParams({ category: cat.slug })}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      currentCategory === cat.slug
                        ? "bg-brown-600 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Region */}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Region</h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => updateParams({ region: "" })}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    !currentRegion
                      ? "bg-brown-600 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  )}
                >
                  All
                </button>
                {REGION_OPTIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => updateParams({ region })}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      currentRegion === region
                        ? "bg-brown-600 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    )}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary */}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Dietary</h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => updateParams({ dietary: "" })}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    !currentDietary
                      ? "bg-brown-600 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  )}
                >
                  All
                </button>
                {DIETARY_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => updateParams({ dietary: tag })}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      currentDietary === tag
                        ? "bg-brown-600 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile sort - shown only on small screens */}
          <div className="mt-4 sm:hidden">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Sort By</h4>
            <select
              value={currentSort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-brown-500 focus:outline-none focus:ring-2 focus:ring-brown-500/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => updateParams({ category: "", region: "", dietary: "", search: "" })}
              className="mt-4 text-sm font-medium text-brown-600 hover:text-brown-800"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
