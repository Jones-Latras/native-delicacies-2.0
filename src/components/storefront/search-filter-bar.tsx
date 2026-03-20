"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SurfaceCard } from "@/components/ui";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A–Z" },
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

  const activeFilterCount = [currentCategory, currentDietary].filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-latik/45" strokeWidth={1.5} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search delicacies..."
            className="w-full rounded-[1.15rem] border border-latik/18 bg-asukal/88 py-3 pl-11 pr-4 text-sm text-kape shadow-[0_12px_24px_rgba(59,31,14,0.08)] transition-all duration-300 ease-in-out placeholder:text-latik/45 focus:border-pandan focus:outline-none focus:ring-2 focus:ring-pandan/20"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-latik/45 transition-all duration-300 ease-in-out hover:bg-kape/5 hover:text-kape"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 rounded-[1.15rem] border px-4 py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] shadow-[0_12px_22px_rgba(59,31,14,0.08)] transition-all duration-300 ease-in-out",
            showFilters || activeFilterCount > 0
              ? "border-pulot/35 bg-pulot/12 text-pulot"
              : "border-latik/18 bg-asukal/88 text-latik hover:border-latik/28 hover:bg-gatas/90"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-pulot px-1 text-[10px] font-bold text-asukal">
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="hidden rounded-[1.15rem] border border-latik/18 bg-asukal/88 px-4 py-3 text-sm text-latik shadow-[0_12px_22px_rgba(59,31,14,0.08)] focus:border-pandan focus:outline-none focus:ring-2 focus:ring-pandan/20 sm:block"
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
        <SurfaceCard className="p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h4 className="mb-3 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-latik/62">Category</h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => updateParams({ category: "" })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[0.64rem] font-medium uppercase tracking-[0.16em] transition-all duration-300 ease-in-out",
                    !currentCategory
                      ? "border-pulot bg-pulot text-asukal"
                      : "border-latik/16 bg-gatas/75 text-latik/72 hover:border-latik/24 hover:bg-gatas"
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => updateParams({ category: cat.slug })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[0.64rem] font-medium uppercase tracking-[0.16em] transition-all duration-300 ease-in-out",
                      currentCategory === cat.slug
                        ? "border-pulot bg-pulot text-asukal"
                        : "border-latik/16 bg-gatas/75 text-latik/72 hover:border-latik/24 hover:bg-gatas"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-latik/62">Dietary</h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => updateParams({ dietary: "" })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[0.64rem] font-medium uppercase tracking-[0.16em] transition-all duration-300 ease-in-out",
                    !currentDietary
                      ? "border-pulot bg-pulot text-asukal"
                      : "border-latik/16 bg-gatas/75 text-latik/72 hover:border-latik/24 hover:bg-gatas"
                  )}
                >
                  All
                </button>
                {DIETARY_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => updateParams({ dietary: tag })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[0.64rem] font-medium uppercase tracking-[0.16em] transition-all duration-300 ease-in-out",
                      currentDietary === tag
                        ? "border-pulot bg-pulot text-asukal"
                        : "border-latik/16 bg-gatas/75 text-latik/72 hover:border-latik/24 hover:bg-gatas"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 sm:hidden">
            <h4 className="mb-3 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-latik/62">Sort By</h4>
            <select
              value={currentSort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="w-full rounded-[1.15rem] border border-latik/18 bg-asukal/88 px-4 py-3 text-sm text-latik shadow-[0_12px_22px_rgba(59,31,14,0.08)] focus:border-pandan focus:outline-none focus:ring-2 focus:ring-pandan/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={() => updateParams({ category: "", dietary: "", search: "" })}
              className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik transition-colors duration-300 hover:text-pulot"
            >
              Clear all filters
            </button>
          )}
        </SurfaceCard>
      )}
    </div>
  );
}
