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
    <div className={cn("relative overflow-hidden bg-stone-100", className)}>
      {imageUrl ? (
        <Image src={imageUrl} alt={alt} fill className="object-cover" sizes={sizes} />
      ) : (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center text-sm font-semibold uppercase tracking-[0.18em] text-stone-500",
            fallbackClassName,
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

      return [item.name, item.description, item.category.name].join(" ").toLowerCase().includes(query);
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
    if (!canAddMore) return;

    setBilaoItems((prev) => {
      const existing = prev.find((bilaoItem) => bilaoItem.menuItem.id === item.id);

      if (existing) {
        return prev.map((bilaoItem) =>
          bilaoItem.menuItem.id === item.id ? { ...bilaoItem, quantity: bilaoItem.quantity + 1 } : bilaoItem,
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
      if (existing.quantity <= 1) return prev.filter((bilaoItem) => bilaoItem.menuItem.id !== itemId);

      return prev.map((bilaoItem) =>
        bilaoItem.menuItem.id === itemId ? { ...bilaoItem, quantity: bilaoItem.quantity - 1 } : bilaoItem,
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
    <div className="artisan-bilao min-h-screen bg-[linear-gradient(180deg,rgba(255,250,242,0.9),rgba(245,236,215,0.95))]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="mb-5 flex items-center gap-2 text-sm text-stone-500">
          <Link href="/" className="hover:text-brown-600">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/menu" className="hover:text-brown-600">
            Menu
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-stone-900">Bilao Builder</span>
        </nav>

        <div className="mb-6 border-b border-latik/14 px-6 pb-6">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.26em] text-pulot">Custom Feast</p>
          <h1 className="mt-3 text-4xl font-black text-kape">Build Your Bilao</h1>
        </div>

        <div
          className={cn(
            "flex flex-col gap-8",
            selectedSize && "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(25rem,32rem)] lg:items-start",
          )}
        >
          <div className={cn("space-y-6", selectedSize && "lg:sticky lg:top-24")}>
            <div className="border-t border-stone-200 pt-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">Step 1: Choose Your Bilao Size</h2>
                </div>
                {selectedSize ? (
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
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
                        "rounded-xl border px-3 py-4 text-center transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-stone-200 bg-transparent hover:border-primary/40",
                      )}
                    >
                      <div className="text-base font-bold text-stone-900 sm:text-lg">{size.name}</div>
                      <div className="mt-1 text-sm text-stone-500">{size.pieces} pieces</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.14em] text-stone-400">Mix and match</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSize ? (
              <div className="border-t border-stone-200 pt-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">Your Bilao</h2>
                </div>
                {bilaoItems.length > 0 ? (
                  <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-red-600"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                  ) : null}
                </div>

                <div className="relative mx-auto aspect-square w-full max-w-[26rem] rounded-full border-[10px] border-primary/20 bg-primary/5 p-5">
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
                          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-full border border-white/70 bg-primary/10" />
                        ) : null}
                        {piece.stackDepth > 1 ? (
                          <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-full border border-white/80 bg-primary/15" />
                        ) : null}

                        <ProductThumb
                          imageUrl={piece.imageUrl}
                          alt={piece.name}
                          fallback={piece.label}
                          className={cn(
                            "absolute inset-0 rounded-full ring-2 ring-white/90",
                            piece.imageUrl ? "" : piece.bg,
                          )}
                          sizes="56px"
                          fallbackClassName={cn("tracking-normal text-[10px] font-bold", piece.text)}
                        />

                        {piece.quantity > 1 ? (
                          <span className="absolute -right-1 -top-1 rounded-full bg-kape px-1.5 py-0.5 text-[10px] font-bold text-white ring-2 ring-white">
                            x{piece.quantity}
                          </span>
                        ) : null}
                      </div>
                    ))}

                    {Array.from({ length: Math.max(0, Math.min(30, maxPieces - totalPieces)) }, (_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-stone-300/90 bg-white/35"
                      />
                    ))}
                  </div>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-stone-200 bg-white/90 px-4 py-1.5 text-sm font-semibold text-stone-700">
                    {totalPieces} / {maxPieces} pieces selected
                  </div>
                </div>

                {bilaoItems.length > 0 ? (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 border-t border-stone-200/80 pt-5">
                    {bilaoItems.map((bilaoItem) => {
                      const color = itemColorMap.get(bilaoItem.menuItem.id) ?? PIECE_COLORS[0];

                      return (
                        <span
                          key={bilaoItem.menuItem.id}
                          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-stone-700"
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
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", color.bg, color.text)}>
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
              <div className="flex min-h-[34rem] flex-col border-t border-stone-200 pt-6 lg:h-full">
                <div className="space-y-4 border-b border-stone-200 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-stone-900">Step 2: Add Delicacies</h2>
                    </div>
                    <span className="rounded-full border border-stone-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">
                      {filteredItems.length} items
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search delicacies or categories..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-full border border-stone-200 bg-white/70 py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-primary"
                    />
                    {search ? (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
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
                        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                        activeCategory === "all"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-stone-200 bg-white/60 text-stone-600 hover:border-primary/25 hover:text-stone-900",
                      )}
                    >
                      <span>All Categories</span>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500">{items.length}</span>
                    </button>

                    {categorySummaries.map((summary) => (
                      <button
                        key={summary.category.id}
                        type="button"
                        onClick={() => handleCategorySelect(summary.category.slug)}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                          activeCategory === summary.category.slug
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-stone-200 bg-white/60 text-stone-600 hover:border-primary/25 hover:text-stone-900",
                        )}
                      >
                        <span>{summary.category.name}</span>
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500">{summary.itemCount}</span>
                        {summary.selectedCount > 0 ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                      </button>
                    ))}
                  </div>

                  {hasFilters ? (
                    <div className="flex items-center justify-between gap-3 text-xs text-stone-500">
                      <span>
                        Showing {filteredItems.length} matching item{filteredItems.length !== 1 ? "s" : ""}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="font-medium text-primary hover:text-brown-700"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto overscroll-contain pr-1">
                    {groupedItems.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-center text-stone-400">
                        <Search className="mb-2 h-8 w-8" />
                        <p className="text-sm font-medium text-stone-500">No items found</p>
                        <p className="mt-1 max-w-xs text-xs text-stone-400">Try a different search or switch back to all categories.</p>
                      </div>
                    ) : (
                      groupedItems.map((group) => {
                        const isCollapsed = collapsedCategories[group.category.slug] ?? false;
                        const selectedCount = selectedPiecesByCategory.get(group.category.slug) ?? 0;

                        return (
                          <section key={group.category.id} className="border-b border-stone-100 py-4 last:border-b-0">
                            <button
                              type="button"
                              onClick={() => toggleCategoryCollapse(group.category.slug)}
                              className="flex w-full items-center justify-between gap-4 text-left"
                            >
                              <div>
                                <h3 className="text-sm font-semibold text-stone-900">{group.category.name}</h3>
                                <p className="mt-1 text-xs text-stone-500">
                                  {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                                  {selectedCount > 0 ? ` - ${selectedCount} piece${selectedCount !== 1 ? "s" : ""} selected` : ""}
                                </p>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 flex-shrink-0 text-stone-400 transition-transform",
                                  isCollapsed ? "-rotate-90" : "rotate-0",
                                )}
                              />
                            </button>

                            {!isCollapsed ? (
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {group.items.map((item) => {
                                  const qty = getItemQuantity(item.id);
                                  const color = itemColorMap.get(item.id) ?? PIECE_COLORS[0];

                                  return (
                                    <div
                                      key={item.id}
                                      className={cn(
                                        "grid grid-cols-[4.75rem_minmax(0,1fr)] gap-3 rounded-2xl border p-2.5 transition-colors",
                                        qty > 0
                                          ? "border-primary/30 bg-primary/5"
                                          : "border-stone-200 bg-white/70 hover:border-primary/20",
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
                                            <h4 className="line-clamp-2 text-sm font-semibold text-stone-900">{item.name}</h4>
                                            <p className="mt-1 text-xs text-stone-500">{formatCurrency(item.price)} per piece</p>
                                          </div>
                                          {qty > 0 ? (
                                            <span
                                              className={cn(
                                                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                                color.bg,
                                                color.text,
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
                                                ? "border-stone-200 text-stone-600 hover:border-red-200 hover:text-red-600"
                                                : "cursor-not-allowed border-stone-200 text-stone-300",
                                            )}
                                            aria-label={`Remove ${item.name} from bilao`}
                                          >
                                            <Minus className="h-3.5 w-3.5" />
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleAddToBilao(item)}
                                            disabled={!canAddMore}
                                            className={cn(
                                              "inline-flex min-w-[5.5rem] items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                                              canAddMore
                                                ? "bg-primary text-white hover:bg-brown-700"
                                                : "cursor-not-allowed bg-stone-200 text-stone-400",
                                            )}
                                            aria-label={`Add ${item.name} to bilao`}
                                          >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add
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

                <div className="border-t border-stone-200 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-semibold text-stone-900">Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(bilaoTotal)}</span>
                  </div>

                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-stone-500">
                      <span>
                        {totalPieces} / {maxPieces} pieces
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isFull ? "bg-green-500" : "bg-primary",
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
                      "flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-all",
                      added ? "bg-green-600" : isFull ? "bg-primary hover:bg-brown-700" : "cursor-not-allowed bg-stone-300",
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
                    <p className="mt-2 text-center text-xs text-stone-400">
                      Add {maxPieces - totalPieces} more piece{maxPieces - totalPieces !== 1 ? "s" : ""} to complete your bilao
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
            className="inline-flex items-center gap-2 text-sm font-medium text-brown-600 hover:text-brown-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
