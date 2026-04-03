"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { cn, formatCurrency } from "@/lib/utils";
import type { MenuCategory, MenuItem } from "@/types";
import { BILAO_SIZES, PIECE_COLORS, type BilaoSize } from "./bilao-config";

interface BilaoItem {
  menuItem: MenuItem;
  quantity: number;
}

interface TrayPiece {
  id: string;
  label: string;
  bg: string;
  text: string;
  imageUrl?: string;
  name: string;
  quantity: number;
  stackDepth: number;
}

interface ProductThumbProps {
  imageUrl?: string;
  alt: string;
  fallback: string;
  className: string;
  sizes: string;
  fallbackClassName?: string;
}

function sortCategories(a: MenuCategory, b: MenuCategory) {
  return a.displayOrder - b.displayOrder || a.name.localeCompare(b.name);
}

function ProductThumb({
  imageUrl,
  alt,
  fallback,
  className,
  sizes,
  fallbackClassName,
}: ProductThumbProps) {
  return (
    <div className={cn("relative overflow-hidden bg-[#F5E6C8]", className)}>
      {imageUrl ? (
        <Image src={imageUrl} alt={alt} fill className="object-cover" sizes={sizes} />
      ) : (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6A55]",
            fallbackClassName
          )}
        >
          {fallback}
        </span>
      )}
    </div>
  );
}

export function BilaoBuilderClient({ items }: { items: MenuItem[] }) {
  const addItem = useCartStore((s) => s.addItem);

  const [selectedSize, setSelectedSize] = useState<BilaoSize | null>(null);
  const [bilaoItems, setBilaoItems] = useState<BilaoItem[]>([]);
  const [added, setAdded] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const totalPieces = bilaoItems.reduce((sum, bi) => sum + bi.quantity, 0);
  const maxPieces = selectedSize?.pieces ?? 0;
  const progress = maxPieces > 0 ? Math.min(100, Math.round((totalPieces / maxPieces) * 100)) : 0;
  const isFull = totalPieces >= maxPieces;
  const canAddMore = selectedSize !== null && totalPieces < maxPieces;
  const bilaoTotal = bilaoItems.reduce((sum, bi) => sum + bi.menuItem.price * bi.quantity, 0);
  const hasFilters = search.trim().length > 0 || activeCategory !== "all";

  const itemColorMap = useMemo(() => {
    const map = new Map<string, (typeof PIECE_COLORS)[number]>();
    items.forEach((item, index) => {
      map.set(item.id, PIECE_COLORS[index % PIECE_COLORS.length]);
    });
    return map;
  }, [items]);

  const selectedPiecesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    bilaoItems.forEach((bilaoItem) => {
      const slug = bilaoItem.menuItem.category.slug;
      map.set(slug, (map.get(slug) ?? 0) + bilaoItem.quantity);
    });
    return map;
  }, [bilaoItems]);

  const categorySummaries = useMemo(() => {
    const map = new Map<string, { category: MenuCategory; itemCount: number }>();

    items.forEach((item) => {
      const existing = map.get(item.category.slug);
      if (existing) {
        existing.itemCount += 1;
        return;
      }

      map.set(item.category.slug, {
        category: item.category,
        itemCount: 1,
      });
    });

    return Array.from(map.values())
      .sort((a, b) => sortCategories(a.category, b.category))
      .map((entry) => ({
        ...entry,
        selectedCount: selectedPiecesByCategory.get(entry.category.slug) ?? 0,
      }));
  }, [items, selectedPiecesByCategory]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category.slug === activeCategory;
      if (!matchesCategory) return false;

      if (!query) return true;

      return [item.name, item.description, item.category.name]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [activeCategory, items, search]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, { category: MenuCategory; items: MenuItem[] }>();

    filteredItems.forEach((item) => {
      const existing = groups.get(item.category.slug);
      if (existing) {
        existing.items.push(item);
        return;
      }

      groups.set(item.category.slug, {
        category: item.category,
        items: [item],
      });
    });

    return Array.from(groups.values()).sort((a, b) => sortCategories(a.category, b.category));
  }, [filteredItems]);

  function isItemSelectable(item: MenuItem) {
    const stockLeft =
      item.dailyLimit == null ? null : Math.max(item.dailyLimit - (item.soldToday ?? 0), 0);
    return item.isAvailable && stockLeft !== 0;
  }

  const trayPieces = useMemo<TrayPiece[]>(() => {
    return bilaoItems.map((bilaoItem) => {
      const color = itemColorMap.get(bilaoItem.menuItem.id) ?? PIECE_COLORS[0];

      return {
        id: bilaoItem.menuItem.id,
        label: bilaoItem.menuItem.name.slice(0, 2).toUpperCase(),
        bg: color.bg,
        text: color.text,
        imageUrl: bilaoItem.menuItem.imageUrl,
        name: bilaoItem.menuItem.name,
        quantity: bilaoItem.quantity,
        stackDepth: Math.min(3, bilaoItem.quantity),
      };
    });
  }, [bilaoItems, itemColorMap]);

  function getItemQuantity(itemId: string) {
    return bilaoItems.find((bi) => bi.menuItem.id === itemId)?.quantity ?? 0;
  }

  function handleAddToBilao(item: MenuItem) {
    if (!canAddMore || !isItemSelectable(item)) return;

    setBilaoItems((prev) => {
      const existing = prev.find((bilaoItem) => bilaoItem.menuItem.id === item.id);

      if (existing) {
        return prev.map((bilaoItem) =>
          bilaoItem.menuItem.id === item.id
            ? { ...bilaoItem, quantity: bilaoItem.quantity + 1 }
            : bilaoItem
        );
      }

      return [...prev, { menuItem: item, quantity: 1 }];
    });

    setCollapsedCategories((prev) => ({ ...prev, [item.category.slug]: false }));
    setAdded(false);
  }

  function handleRemoveFromBilao(itemId: string) {
    setBilaoItems((prev) => {
      const existing = prev.find((bilaoItem) => bilaoItem.menuItem.id === itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1)
        return prev.filter((bilaoItem) => bilaoItem.menuItem.id !== itemId);

      return prev.map((bilaoItem) =>
        bilaoItem.menuItem.id === itemId
          ? { ...bilaoItem, quantity: bilaoItem.quantity - 1 }
          : bilaoItem
      );
    });

    setAdded(false);
  }

  function handleAddToCart() {
    if (!selectedSize || !isFull) return;

    const bilaoLabel = `${selectedSize.name} Bilao`;

    for (const bilaoItem of bilaoItems) {
      addItem({
        menuItemId: bilaoItem.menuItem.id,
        name: bilaoItem.menuItem.name,
        price: bilaoItem.menuItem.price,
        quantity: bilaoItem.quantity,
        imageUrl: bilaoItem.menuItem.imageUrl,
        customizations: {},
        specialInstructions: `Part of ${bilaoLabel} (${selectedSize.pieces} pcs)`,
      });
    }

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setSelectedSize(null);
      setBilaoItems([]);
      setSearch("");
      setActiveCategory("all");
      setCollapsedCategories({});
    }, 1500);
  }

  function handleReset() {
    setBilaoItems([]);
    setAdded(false);
    setSearch("");
    setActiveCategory("all");
    setCollapsedCategories({});
  }

  function handleSizeSelect(size: BilaoSize) {
    setSelectedSize(size);
    setBilaoItems([]);
    setAdded(false);
    setSearch("");
    setActiveCategory("all");
    setCollapsedCategories({});
  }

  function handleCategorySelect(slug: string) {
    setActiveCategory(slug);
    if (slug !== "all") {
      setCollapsedCategories((prev) => ({ ...prev, [slug]: false }));
    }
  }

  function handleClearFilters() {
    setSearch("");
    setActiveCategory("all");
  }

  function toggleCategoryCollapse(slug: string) {
    setCollapsedCategories((prev) => ({
      ...prev,
      [slug]: !(prev[slug] ?? false),
    }));
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#FFFDF8_0%,#FAF6F0_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C9A87C]/60" />
      <div className="pointer-events-none absolute left-[8%] top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(245,230,200,0.65),transparent_72%)]" />
      <div className="pointer-events-none absolute bottom-10 right-[8%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(160,82,45,0.10),transparent_72%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.12em] text-[#7A6A55]">
          <Link
            href="/"
            className="transition-colors duration-200 ease-in-out hover:text-[#A0522D]"
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/menu"
            className="transition-colors duration-200 ease-in-out hover:text-[#A0522D]"
          >
            Menu
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-[#3E2012]">Bilao Builder</span>
        </nav>

        <div className="mb-10 text-center">
          <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
            Custom Feast
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.25rem] leading-tight text-[#3E2012] sm:text-[3rem]">
            Build Your Bilao
          </h1>
          <div className="mx-auto mt-4 h-[2px] w-[60px] rounded-full bg-[#A0522D]" />
          <p className="mx-auto mt-5 max-w-2xl font-[family-name:var(--font-label)] text-base italic leading-7 text-[#7A6A55]">
            Choose a bilao size, mix heritage delicacies, and compose a platter that feels prepared
            for salu-salo.
          </p>
        </div>

        <div
          className={cn(
            "flex flex-col gap-8",
            selectedSize &&
              "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(25rem,32rem)] lg:items-start"
          )}
        >
          <div className={cn("space-y-6", selectedSize && "lg:sticky lg:top-24")}>
            <div className="rounded-[24px] border border-[#C9A87C] bg-[#FFFDF8] p-6 shadow-[0_18px_40px_rgba(90,50,20,0.06)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
                    Step 1: Choose Your Bilao Size
                  </h2>
                </div>
                {selectedSize ? (
                  <span className="rounded-full bg-[#F5E6C8] px-3 py-1 font-[family-name:var(--font-label)] text-[11px] font-medium uppercase tracking-[0.1em] text-[#A0522D]">
                    {selectedSize.name}
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {BILAO_SIZES.map((size) => {
                  const isSelected = selectedSize?.id === size.id;

                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => handleSizeSelect(size)}
                      className={cn(
                        "rounded-[18px] border px-3 py-4 text-center transition-all duration-200 ease-in-out",
                        isSelected
                          ? "border-[#A0522D] bg-[#F5E6C8]"
                          : "border-[#C9A87C] bg-[#FAF6F0] hover:border-[#A0522D]"
                      )}
                    >
                      <div className="font-[family-name:var(--font-display)] text-lg text-[#3E2012]">
                        {size.name}
                      </div>
                      <div className="mt-1 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
                        {size.pieces} pieces
                      </div>
                      <div className="mt-2 font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.1em] text-[#A58A69]">
                        Mix and match
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSize ? (
              <div className="rounded-[24px] border border-[#C9A87C] bg-[#FFFDF8] p-6 shadow-[0_18px_40px_rgba(90,50,20,0.06)]">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
                      Your Bilao
                    </h2>
                  </div>
                  {bilaoItems.length > 0 ? (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 font-[family-name:var(--font-label)] text-sm text-[#7A6A55] transition-colors duration-200 ease-in-out hover:text-[#A0522D]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                  ) : null}
                </div>

                <div className="relative mx-auto aspect-square w-full max-w-[26rem] rounded-full border-[10px] border-[#C9A87C] bg-[#F5EFE6] p-5">
                  <div
                    className="absolute inset-0 rounded-full opacity-10"
                    style={{
                      backgroundImage: "radial-gradient(circle, #8b4513 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  <div className="relative grid h-full grid-cols-4 content-center justify-items-center gap-3 overflow-hidden sm:grid-cols-5">
                    {trayPieces.map((piece) => (
                      <div key={piece.id} className="relative h-14 w-14">
                        {piece.stackDepth > 2 ? (
                          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-full border border-white/70 bg-[#F5E6C8]" />
                        ) : null}
                        {piece.stackDepth > 1 ? (
                          <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-full border border-white/80 bg-[#EED4AF]" />
                        ) : null}

                        <ProductThumb
                          imageUrl={piece.imageUrl}
                          alt={piece.name}
                          fallback={piece.label}
                          className={cn(
                            "absolute inset-0 rounded-full ring-2 ring-white/90",
                            piece.imageUrl ? "" : piece.bg
                          )}
                          sizes="56px"
                          fallbackClassName={cn(
                            "tracking-normal text-[10px] font-bold",
                            piece.text
                          )}
                        />

                        {piece.quantity > 1 ? (
                          <span className="absolute -right-1 -top-1 rounded-full bg-[#3E2012] px-1.5 py-0.5 text-[10px] font-bold text-white ring-2 ring-white">
                            x{piece.quantity}
                          </span>
                        ) : null}
                      </div>
                    ))}

                    {Array.from(
                      { length: Math.max(0, Math.min(30, maxPieces - totalPieces)) },
                      (_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-[#C9A87C] bg-white/35"
                        />
                      )
                    )}
                  </div>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#C9A87C] bg-white/90 px-4 py-1.5 font-[family-name:var(--font-label)] text-sm font-medium text-[#5C3D1E]">
                    {totalPieces} / {maxPieces} pieces selected
                  </div>
                </div>

                {bilaoItems.length > 0 ? (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 border-t border-[#E8D8BD] pt-5">
                    {bilaoItems.map((bilaoItem) => {
                      const color = itemColorMap.get(bilaoItem.menuItem.id) ?? PIECE_COLORS[0];

                      return (
                        <span
                          key={bilaoItem.menuItem.id}
                          className="inline-flex items-center gap-2 rounded-full border border-[#C9A87C] bg-[#FAF6F0] px-2.5 py-1.5 font-[family-name:var(--font-label)] text-xs font-medium text-[#5C3D1E]"
                        >
                          <ProductThumb
                            imageUrl={bilaoItem.menuItem.imageUrl}
                            alt={bilaoItem.menuItem.name}
                            fallback={bilaoItem.menuItem.name.slice(0, 1)}
                            className="h-6 w-6 rounded-full"
                            sizes="24px"
                            fallbackClassName="tracking-normal"
                          />
                          <span className="max-w-[10rem] truncate">{bilaoItem.menuItem.name}</span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              color.bg,
                              color.text
                            )}
                          >
                            x{bilaoItem.quantity}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {selectedSize ? (
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
              <div className="flex min-h-[34rem] flex-col rounded-[24px] border border-[#C9A87C] bg-[#FFFDF8] p-6 shadow-[0_18px_40px_rgba(90,50,20,0.06)] lg:h-full">
                <div className="space-y-4 border-b border-[#E8D8BD] pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
                        Step 2: Add Delicacies
                      </h2>
                    </div>
                    <span className="rounded-full border border-[#C9A87C] bg-[#FAF6F0] px-3 py-1 font-[family-name:var(--font-label)] text-[11px] font-medium uppercase tracking-[0.1em] text-[#7A6A55]">
                      {filteredItems.length} items
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6A55]" />
                    <input
                      type="text"
                      placeholder="Search delicacies or categories..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-full border border-[#C9A87C] bg-[#FAF6F0] py-2.5 pl-10 pr-10 font-[family-name:var(--font-label)] text-sm text-[#3E2012] outline-none transition-colors duration-200 ease-in-out placeholder:text-[#7A6A55] focus:border-[#A0522D]"
                    />
                    {search ? (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6A55] transition-colors duration-200 ease-in-out hover:text-[#A0522D]"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect("all")}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 font-[family-name:var(--font-label)] text-xs font-medium transition-all duration-200 ease-in-out",
                        activeCategory === "all"
                          ? "border-[#A0522D] bg-[#A0522D] text-white"
                          : "border-[#C9A87C] bg-[#FAF6F0] text-[#5C3D1E] hover:border-[#A0522D] hover:text-[#A0522D]"
                      )}
                    >
                      <span>All Categories</span>
                      <span className="rounded-full bg-[#F5E6C8] px-2 py-0.5 text-[11px] text-[#7A6A55]">
                        {items.length}
                      </span>
                    </button>

                    {categorySummaries.map((summary) => (
                      <button
                        key={summary.category.id}
                        type="button"
                        onClick={() => handleCategorySelect(summary.category.slug)}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 font-[family-name:var(--font-label)] text-xs font-medium transition-all duration-200 ease-in-out",
                          activeCategory === summary.category.slug
                            ? "border-[#A0522D] bg-[#A0522D] text-white"
                            : "border-[#C9A87C] bg-[#FAF6F0] text-[#5C3D1E] hover:border-[#A0522D] hover:text-[#A0522D]"
                        )}
                      >
                        <span>{summary.category.name}</span>
                        <span className="rounded-full bg-[#F5E6C8] px-2 py-0.5 text-[11px] text-[#7A6A55]">
                          {summary.itemCount}
                        </span>
                        {summary.selectedCount > 0 ? (
                          <span className="h-2 w-2 rounded-full bg-[#F0C66E]" />
                        ) : null}
                      </button>
                    ))}
                  </div>

                  {hasFilters ? (
                    <div className="flex items-center justify-between gap-3 font-[family-name:var(--font-label)] text-xs text-[#7A6A55]">
                      <span>
                        Showing {filteredItems.length} matching item
                        {filteredItems.length !== 1 ? "s" : ""}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="font-medium text-[#A0522D] transition-colors duration-200 ease-in-out hover:text-[#7D3D1A]"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto overscroll-contain pr-1">
                    {groupedItems.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-center text-[#7A6A55]">
                        <Search className="mb-2 h-8 w-8" />
                        <p className="font-[family-name:var(--font-display)] text-xl text-[#3E2012]">
                          No items found
                        </p>
                        <p className="mt-1 max-w-xs font-[family-name:var(--font-label)] text-xs text-[#7A6A55]">
                          Try a different search or switch back to all categories.
                        </p>
                      </div>
                    ) : (
                      groupedItems.map((group) => {
                        const isCollapsed = collapsedCategories[group.category.slug] ?? false;
                        const selectedCount =
                          selectedPiecesByCategory.get(group.category.slug) ?? 0;

                        return (
                          <section
                            key={group.category.id}
                            className="border-b border-[#E8D8BD] py-4 last:border-b-0"
                          >
                            <button
                              type="button"
                              onClick={() => toggleCategoryCollapse(group.category.slug)}
                              className="flex w-full items-center justify-between gap-4 text-left"
                            >
                              <div>
                                <h3 className="font-[family-name:var(--font-display)] text-xl text-[#3E2012]">
                                  {group.category.name}
                                </h3>
                                <p className="mt-1 font-[family-name:var(--font-label)] text-xs text-[#7A6A55]">
                                  {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                                  {selectedCount > 0
                                    ? ` - ${selectedCount} piece${selectedCount !== 1 ? "s" : ""} selected`
                                    : ""}
                                </p>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 flex-shrink-0 text-[#7A6A55] transition-transform",
                                  isCollapsed ? "-rotate-90" : "rotate-0"
                                )}
                              />
                            </button>

                            {!isCollapsed ? (
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {group.items.map((item) => {
                                  const qty = getItemQuantity(item.id);
                                  const isSelectable = isItemSelectable(item);
                                  const color = itemColorMap.get(item.id) ?? PIECE_COLORS[0];

                                  return (
                                    <div
                                      key={item.id}
                                      className={cn(
                                        "grid grid-cols-[4.75rem_minmax(0,1fr)] gap-3 rounded-[18px] border p-2.5 transition-all duration-200 ease-in-out",
                                        qty > 0
                                          ? "border-[#A0522D] bg-[#F5E6C8]"
                                          : "border-[#C9A87C] bg-[#FAF6F0] hover:border-[#A0522D]"
                                      )}
                                    >
                                      <ProductThumb
                                        imageUrl={item.imageUrl}
                                        alt={item.name}
                                        fallback={item.name.slice(0, 2)}
                                        className="h-[4.75rem] w-[4.75rem] rounded-xl"
                                        sizes="76px"
                                      />

                                      <div className="min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="min-w-0">
                                            <h4 className="line-clamp-2 font-[family-name:var(--font-display)] text-lg text-[#3E2012]">
                                              {item.name}
                                            </h4>
                                            <p className="mt-1 font-[family-name:var(--font-label)] text-xs text-[#7A6A55]">
                                              {formatCurrency(item.price)} per piece
                                            </p>
                                          </div>
                                          {qty > 0 ? (
                                            <span
                                              className={cn(
                                                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                                color.bg,
                                                color.text
                                              )}
                                            >
                                              {qty}
                                            </span>
                                          ) : null}
                                        </div>

                                        <div className="mt-3 flex items-center justify-between gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveFromBilao(item.id)}
                                            disabled={qty === 0}
                                            className={cn(
                                              "inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                                              qty > 0
                                                ? "border-[#C9A87C] bg-white text-[#7A6A55] hover:border-red-200 hover:text-red-600"
                                                : "cursor-not-allowed border-[#E8D8BD] bg-white/60 text-[#C9B6A2]"
                                            )}
                                            aria-label={`Remove ${item.name} from bilao`}
                                          >
                                            <Minus className="h-3.5 w-3.5" />
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleAddToBilao(item)}
                                            disabled={!canAddMore || !isSelectable}
                                            className={cn(
                                              "inline-flex min-w-[5.5rem] items-center justify-center gap-1 rounded-full px-3 py-1.5 font-[family-name:var(--font-label)] text-xs font-medium transition-all duration-200 ease-in-out",
                                              canAddMore && isSelectable
                                                ? "bg-[#A0522D] text-white hover:bg-[#7D3D1A]"
                                                : "cursor-not-allowed bg-[#C9A87C] text-white/80"
                                            )}
                                            aria-label={`Add ${item.name} to bilao`}
                                          >
                                            <Plus className="h-3.5 w-3.5" />
                                            {isSelectable ? "Add" : "Sold out"}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                          </section>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="border-t border-[#E8D8BD] pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
                      Total
                    </span>
                    <span className="font-[family-name:var(--font-display)] text-2xl text-[#A0522D]">
                      {formatCurrency(bilaoTotal)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between font-[family-name:var(--font-label)] text-xs text-[#7A6A55]">
                      <span>
                        {totalPieces} / {maxPieces} pieces
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#F5E6C8]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isFull ? "bg-[#3A6A1E]" : "bg-[#A0522D]"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!isFull || added}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-[12px] py-3 font-[family-name:var(--font-label)] text-sm font-medium text-white transition-all duration-200 ease-in-out",
                      added
                        ? "bg-[#3A6A1E]"
                        : isFull
                          ? "bg-[#A0522D] hover:bg-[#7D3D1A]"
                          : "cursor-not-allowed bg-[#C9A87C]"
                    )}
                  >
                    {added ? (
                      <>
                        <Check className="h-5 w-5" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        Complete &amp; Add to Cart
                      </>
                    )}
                  </button>

                  {!isFull && totalPieces > 0 ? (
                    <p className="mt-2 text-center font-[family-name:var(--font-label)] text-xs text-[#7A6A55]">
                      Add {maxPieces - totalPieces} more piece
                      {maxPieces - totalPieces !== 1 ? "s" : ""} to complete your bilao
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 font-[family-name:var(--font-label)] text-sm text-[#A0522D] underline decoration-[#A0522D]/45 underline-offset-4 transition-colors duration-200 ease-in-out hover:text-[#7D3D1A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Link>
        </div>
      </div>
    </section>
  );
}
